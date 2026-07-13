import {useEffect, useRef, useState, type FormEvent, type KeyboardEvent} from 'react';
import {ArrowUp, Bot, Download, HardDrive, RotateCcw, Square, Trash2} from 'lucide-react';
import {GEMMA_MODEL_BYTES, GEMMA_MODEL_URL, type GemmaWorkerToMainMessage, type GenerationMetrics, type MainToGemmaWorkerMessage} from './gemmaPhaseTwo.protocol';

type Status = 'checking' | 'unsupported' | 'ready' | 'downloading' | 'initializing' | 'loaded' | 'generating' | 'cancelled' | 'error';
type Capability = {webGpu: boolean; secureContext: boolean; adapter: string; storageAvailable?: number};
type ChatMessage = {id: string; role: 'user' | 'assistant'; text: string; metrics?: GenerationMetrics};

const suggestions = [
  'Who is Dylan and what does he build?',
  'Tell me about Dylan’s strongest project.',
  'What is Dylan’s backend experience?',
  'Why is this AI demo technically interesting?',
];
const INITIALIZATION_TIMEOUT_MS = 3 * 60 * 1000;

function formatBytes(bytes?: number) {
  if (bytes === undefined) return 'Unknown';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes; let index = 0;
  while (value >= 1000 && index < units.length - 1) { value /= 1000; index += 1; }
  return `${value.toFixed(index > 1 ? 2 : 0)} ${units[index]}`;
}

export default function GemmaPhaseOne() {
  const [status, setStatus] = useState<Status>('checking');
  const [capability, setCapability] = useState<Capability>();
  const [downloaded, setDownloaded] = useState(0);
  const [total, setTotal] = useState(GEMMA_MODEL_BYTES);
  const [cached, setCached] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState('');
  const [workerReady, setWorkerReady] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const startWorkerRef = useRef<() => void>(() => undefined);
  const initializationTimerRef = useRef<number | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    const clearInitializationTimer = () => {
      if (initializationTimerRef.current !== undefined) window.clearTimeout(initializationTimerRef.current);
      initializationTimerRef.current = undefined;
    };
    const startWorker = () => {
      clearInitializationTimer();
      workerRef.current?.terminate();
      setWorkerReady(false);
      const worker = new Worker(new URL('./gemmaPhaseTwo.worker.ts', import.meta.url));
      workerRef.current = worker;
      worker.onerror = () => {
        if (!active) return;
        clearInitializationTimer();
        setModelLoaded(false);
        setStatus('error');
        setError('The on-device runtime stopped unexpectedly. Retry with the saved model.');
      };
      worker.onmessage = (event: MessageEvent<GemmaWorkerToMainMessage>) => {
        if (!active || worker !== workerRef.current) return;
        const message = event.data;
        switch (message.type) {
          case 'worker-ready': setWorkerReady(true); worker.postMessage({type: 'check-cache'} satisfies MainToGemmaWorkerMessage); break;
          case 'cache-status': setCached(message.cached); break;
          case 'download-progress': setDownloaded(message.received); setTotal(message.total); setStatus('downloading'); break;
          case 'initializing':
            setStatus('initializing');
            clearInitializationTimer();
            initializationTimerRef.current = window.setTimeout(() => {
              if (!active || worker !== workerRef.current) return;
              worker.terminate();
              workerRef.current = null;
              setWorkerReady(false);
              setModelLoaded(false);
              setStatus('error');
              setError('WebGPU initialization exceeded 3 minutes and was stopped. Retry from the saved model.');
              startWorker();
            }, INITIALIZATION_TIMEOUT_MS);
            break;
          case 'loaded': clearInitializationTimer(); setModelLoaded(true); setStatus('loaded'); break;
          case 'generation-chunk': setMessages(current => current.map((item, index) => index === current.length - 1 ? {...item, text: item.text + message.text} : item)); break;
          case 'generation-complete': setMessages(current => current.map((item, index) => index === current.length - 1 ? {...item, metrics: message.metrics} : item)); setStatus('loaded'); break;
          case 'conversation-reset': break;
          case 'cache-cleared': setCached(false); break;
          case 'cancelled': clearInitializationTimer(); setStatus(message.operation === 'generation' ? 'loaded' : 'cancelled'); break;
          case 'error': clearInitializationTimer(); setError(message.message); setStatus(message.operation === 'generation' ? 'loaded' : 'error'); break;
        }
      };
    };
    startWorkerRef.current = startWorker;
    startWorker();
    (async () => {
      try {
        const webGpu = 'gpu' in navigator;
        const adapter = webGpu ? await navigator.gpu.requestAdapter({powerPreference: 'high-performance'}) : null;
        const storage = await navigator.storage?.estimate?.();
        if (!active) return;
        setCapability({webGpu: Boolean(adapter), secureContext: window.isSecureContext, adapter: adapter ? [adapter.info.vendor, adapter.info.architecture].filter(Boolean).join(' · ') || 'WebGPU available' : 'Not available', storageAvailable: storage?.quota && storage.usage !== undefined ? storage.quota - storage.usage : undefined});
        setStatus(adapter && window.isSecureContext ? 'ready' : 'unsupported');
      } catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)); setStatus('error'); }
    })();
    return () => { active = false; clearInitializationTimer(); workerRef.current?.terminate(); workerRef.current = null; };
  }, []);

  useEffect(() => { scrollRef.current?.scrollTo({top: scrollRef.current.scrollHeight, behavior: 'smooth'}); }, [messages]);
  const post = (message: MainToGemmaWorkerMessage) => workerRef.current?.postMessage(message);
  const progress = total ? Math.min(100, downloaded / total * 100) : 0;
  const loading = status === 'downloading' || status === 'initializing';

  function loadModel() {
    setError(''); setDownloaded(0); setTotal(GEMMA_MODEL_BYTES); setStatus(cached ? 'initializing' : 'downloading');
    post({type: 'load', modelUrl: GEMMA_MODEL_URL, verifiedBytes: GEMMA_MODEL_BYTES});
  }

  function send(text = input) {
    const prompt = text.trim();
    if (!prompt || !modelLoaded || status === 'generating') return;
    setError(''); setInput(''); setStatus('generating');
    setMessages(current => [...current, {id: crypto.randomUUID(), role: 'user', text: prompt}, {id: crypto.randomUUID(), role: 'assistant', text: ''}]);
    post({type: 'generate', prompt});
  }

  function submit(event: FormEvent) { event.preventDefault(); send(); }
  function keyDown(event: KeyboardEvent<HTMLTextAreaElement>) { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(); } }
  function clearChat() { setMessages([]); setError(''); post({type: 'reset-conversation'}); }
  function clearModel() { post({type: 'clear-cache'}); }
  function cancelLoad() {
    workerRef.current?.terminate();
    workerRef.current = null;
    if (initializationTimerRef.current !== undefined) window.clearTimeout(initializationTimerRef.current);
    initializationTimerRef.current = undefined;
    setWorkerReady(false);
    setModelLoaded(false);
    setStatus('cancelled');
    setError(cached
      ? 'Model loading stopped. Your completed cached model was kept.'
      : 'Model loading stopped. The partial download was discarded.');
    startWorkerRef.current();
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-5 md:px-8 md:py-7">
        <header className="flex items-center justify-between border-b border-white/10 pb-5">
          <a href="/" className="font-mono text-xs tracking-[.18em] text-neutral-500 transition hover:text-white">← DYLAN_ISLOM</a>
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-[.15em] text-neutral-500"><span className={`h-1.5 w-1.5 rounded-full ${modelLoaded ? 'bg-emerald-400' : 'bg-neutral-600'}`} />{modelLoaded ? 'ON-DEVICE MODEL READY' : 'PRIVATE BROWSER AI'}</div>
        </header>

        <div className="grid flex-1 gap-6 py-6 lg:grid-cols-[290px_minmax(0,1fr)]">
          <aside className="flex flex-col border border-white/10 bg-white/[.02] p-5">
            <div className="flex h-10 w-10 items-center justify-center border border-white/15 bg-white/5"><Bot size={20} /></div>
            <p className="mt-6 font-mono text-[10px] tracking-[.2em] text-neutral-500">LIVE DEMO 03 · GEMMA</p>
            <h1 className="mt-3 text-3xl font-black normal-case">Ask Dylan’s AI</h1>
            <p className="mt-4 text-sm leading-6 text-neutral-400">Chat with Gemma 4 E2B running entirely on your device. Your prompts never leave this browser.</p>

            <div className="mt-7 space-y-3 border-y border-white/10 py-5 font-mono text-[10px]">
              <div className="flex justify-between"><span className="text-neutral-600">MODEL</span><span>Gemma 4 E2B</span></div>
              <div className="flex justify-between"><span className="text-neutral-600">DOWNLOAD</span><span>{formatBytes(GEMMA_MODEL_BYTES)}</span></div>
              <div className="flex justify-between"><span className="text-neutral-600">RUNTIME</span><span>LiteRT 0.14 · WebGPU</span></div>
              <div className="flex justify-between"><span className="text-neutral-600">LOCAL CACHE</span><span>{cached ? 'SAVED' : 'EMPTY'}</span></div>
            </div>

            {!modelLoaded && status !== 'unsupported' && !loading && (
              <button onClick={loadModel} disabled={!workerReady} className="mt-5 flex items-center justify-center gap-2 bg-white px-4 py-3 font-mono text-xs font-bold text-black disabled:opacity-40"><Download size={15} />{cached ? 'Load saved model' : 'Download model'}</button>
            )}
            {loading && <button onClick={cancelLoad} className="mt-5 border border-white/20 px-4 py-3 font-mono text-xs">Cancel loading</button>}
            {cached && <button onClick={clearModel} disabled={loading} className="mt-3 flex items-center justify-center gap-2 px-4 py-2 font-mono text-[10px] text-neutral-500 hover:text-white disabled:opacity-30"><HardDrive size={13} />Remove saved copy</button>}

            <div className="mt-auto pt-7 font-mono text-[10px] leading-5 text-neutral-600">
              <p>{capability?.webGpu ? '✓' : '×'} WebGPU · {capability?.secureContext ? '✓' : '×'} Secure context</p>
              <p className="truncate" title={capability?.adapter}>{capability?.adapter ?? 'Checking hardware…'}</p>
              <p>{formatBytes(capability?.storageAvailable)} storage available</p>
            </div>
          </aside>

          <section className="flex min-h-[650px] flex-col overflow-hidden border border-white/10 bg-white/[.015]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div><p className="text-sm font-semibold">Portfolio assistant</p><p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-neutral-600">{status === 'generating' ? 'Generating locally…' : modelLoaded ? 'Ready to chat' : 'Model setup required'}</p></div>
              <button onClick={clearChat} disabled={!messages.length || status === 'generating'} className="flex items-center gap-2 font-mono text-[10px] text-neutral-500 hover:text-white disabled:opacity-30"><Trash2 size={14} />Clear chat</button>
            </div>

            {loading && <div className="border-b border-white/10 px-5 py-4"><div className="flex justify-between font-mono text-[10px] text-neutral-500"><span>{status === 'initializing' ? 'INITIALIZING WEBGPU RUNTIME' : cached ? 'READING LOCAL MODEL' : 'DOWNLOADING MODEL ONCE'}</span><span>{status === 'initializing' ? 'AUTO-STOPS AFTER 3 MIN' : `${progress.toFixed(1)}% · ${formatBytes(downloaded)} / ${formatBytes(total)}`}</span></div><div className="mt-3 h-1 bg-white/10"><div className="h-full bg-white transition-[width]" style={{width: `${status === 'initializing' ? 100 : progress}%`}} /></div></div>}

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-7 md:px-8" aria-live="polite">
              {!messages.length ? <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5"><Bot size={24} /></div>
                <h2 className="mt-6 text-2xl font-bold normal-case">What would you like to know?</h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-neutral-500">Ask about Dylan’s work, engineering background, or how this private on-device AI demo was built.</p>
                <div className="mt-7 grid w-full gap-2 sm:grid-cols-2">{suggestions.map(suggestion => <button key={suggestion} onClick={() => send(suggestion)} disabled={!modelLoaded} className="border border-white/10 p-3 text-left text-xs leading-5 text-neutral-400 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-35">{suggestion}</button>)}</div>
              </div> : <div className="mx-auto max-w-3xl space-y-7">{messages.map(message => <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' && <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10"><Bot size={14} /></div>}
                <div className={`max-w-[85%] ${message.role === 'user' ? 'bg-white px-4 py-3 text-black' : 'py-1 text-neutral-300'}`}><p className="whitespace-pre-wrap text-sm leading-7">{message.text || <span className="inline-block animate-pulse text-neutral-600">Thinking on your GPU…</span>}</p>{message.metrics && <p className="mt-2 font-mono text-[9px] text-neutral-600">FIRST TOKEN {message.metrics.firstTokenMs.toFixed(0)}MS · TOTAL {(message.metrics.totalMs / 1000).toFixed(1)}S</p>}</div>
              </div>)}</div>}
            </div>

            {error && <div role="alert" className="mx-4 mb-3 flex items-center justify-between border border-red-400/20 bg-red-400/5 px-4 py-3 text-xs text-red-200 md:mx-8"><span>{error}</span><button onClick={() => setError('')}><RotateCcw size={14} /></button></div>}
            {status === 'unsupported' && <div className="mx-4 mb-3 border border-white/10 p-4 text-xs leading-5 text-neutral-400 md:mx-8">This demo needs a WebGPU-enabled Chrome or Edge browser over HTTPS. The rest of the portfolio remains available.</div>}
            <form onSubmit={submit} className="border-t border-white/10 p-4 md:px-8 md:py-5">
              <div className="mx-auto flex max-w-3xl items-end gap-3 border border-white/15 bg-black p-2 focus-within:border-white/40">
                <textarea aria-label="Message Dylan’s AI" rows={1} value={input} onChange={event => setInput(event.target.value)} onKeyDown={keyDown} disabled={!modelLoaded || status === 'generating'} placeholder={modelLoaded ? 'Ask about Dylan…' : 'Load the model to start chatting'} className="max-h-36 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-neutral-700 disabled:cursor-not-allowed" />
                {status === 'generating' ? <button type="button" aria-label="Stop generating" onClick={() => post({type: 'cancel-generation'})} className="flex h-10 w-10 items-center justify-center bg-white text-black"><Square size={14} fill="currentColor" /></button> : <button aria-label="Send message" disabled={!modelLoaded || !input.trim()} className="flex h-10 w-10 items-center justify-center bg-white text-black disabled:bg-neutral-900 disabled:text-neutral-700"><ArrowUp size={17} /></button>}
              </div>
              <p className="mt-3 text-center font-mono text-[9px] text-neutral-700">ON-DEVICE AI CAN BE INACCURATE · ENTER TO SEND · SHIFT+ENTER FOR NEW LINE</p>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
