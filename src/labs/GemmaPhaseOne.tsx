import {useEffect, useRef, useState, type FormEvent, type KeyboardEvent} from 'react';
import {ArrowUp, Bot, Check, Copy, Download, HardDrive, RotateCcw, Square, Trash2} from 'lucide-react';
import {GEMMA_MODEL_BYTES, GEMMA_MODEL_URL, type GemmaWorkerToMainMessage, type GenerationMetrics, type MainToGemmaWorkerMessage} from './gemmaPhaseTwo.protocol';

type Status = 'checking' | 'unsupported' | 'disabled' | 'ready' | 'downloading' | 'initializing' | 'loaded' | 'generating' | 'cancelled' | 'error';
type Capability = {webGpu: boolean; secureContext: boolean; adapter: string; storageAvailable?: number; deviceMemory?: number; hardwareConcurrency?: number};
type ChatMessage = {id: string; role: 'user' | 'assistant'; text: string; metrics?: GenerationMetrics};

const CHAT_STORAGE_KEY = 'dylan-ask-ai-chat-v1';
const GEMMA_ENABLED = import.meta.env.VITE_GEMMA_ENABLED !== 'false';
const suggestions = [
  'Who is Dylan and what does he build?',
  'Tell me about Dylan’s strongest project.',
  'What is Dylan’s backend experience?',
  'Why is this AI demo technically interesting?',
];
const INITIALIZATION_TIMEOUT_MS = 3 * 60 * 1000;

function reportRuntimeError(operation: string, detail: unknown) {
  const error = detail instanceof Error ? detail : new Error(String(detail));
  console.error(`[Ask Dylan AI] ${operation}`, error);
  const reportError = (window as Window & {reportError?: (error: unknown) => void}).reportError;
  reportError?.(error);
}

function formatBytes(bytes?: number) {
  if (bytes === undefined) return 'Unknown';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes; let index = 0;
  while (value >= 1000 && index < units.length - 1) { value /= 1000; index += 1; }
  return `${value.toFixed(index > 1 ? 2 : 0)} ${units[index]}`;
}

function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^\)]+\))/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`')) return <code key={index} className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[.9em] text-white">{part.slice(1, -1)}</code>;
    const link = part.match(/^\[([^\]]+)\]\(([^\)]+)\)$/);
    if (link) return <a key={index} href={link[2]} target="_blank" rel="noreferrer" className="underline decoration-white/30 underline-offset-4 hover:decoration-white">{link[1]}</a>;
    return <span key={index}>{part}</span>;
  });
}

function MarkdownMessage({text}: {text: string}) {
  const blocks: React.ReactNode[] = [];
  const lines = text.split('\n');
  let paragraph: string[] = [];
  let code: string[] | null = null;
  let codeLanguage = '';
  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(<p key={`p-${blocks.length}`} className="whitespace-pre-wrap leading-7">{renderInline(paragraph.join('\n'))}</p>);
    paragraph = [];
  };
  lines.forEach((line, index) => {
    if (line.trim().startsWith('```')) {
      if (code) {
        blocks.push(<pre key={`code-${blocks.length}`} className="overflow-x-auto rounded border border-white/10 bg-black/70 p-4 font-mono text-xs leading-6 text-neutral-300"><code data-language={codeLanguage}>{code.join('\n')}</code></pre>);
        code = null;
        codeLanguage = '';
      } else {
        flushParagraph();
        code = [];
        codeLanguage = line.trim().slice(3);
      }
      return;
    }
    if (code) { code.push(line); return; }
    if (!line.trim()) { flushParagraph(); return; }
    const heading = line.match(/^#{1,3}\s+(.+)$/);
    if (heading) { flushParagraph(); blocks.push(<h3 key={`h-${index}`} className="pt-2 font-semibold text-white">{renderInline(heading[1])}</h3>); return; }
    const bullet = line.match(/^\s*[-*]\s+(.+)$/);
    if (bullet) { flushParagraph(); blocks.push(<div key={`li-${index}`} className="flex gap-2 leading-7"><span className="text-neutral-600">•</span><span>{renderInline(bullet[1])}</span></div>); return; }
    paragraph.push(line);
  });
  if (code) blocks.push(<pre key={`code-${blocks.length}`} className="overflow-x-auto rounded border border-white/10 bg-black/70 p-4 font-mono text-xs leading-6 text-neutral-300"><code data-language={codeLanguage}>{code.join('\n')}</code></pre>);
  flushParagraph();
  return <div className="space-y-3 text-sm">{blocks}</div>;
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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const restoredHistoryRef = useRef(false);
  const modelLoadedRef = useRef(false);
  const workerRef = useRef<Worker | null>(null);
  const startWorkerRef = useRef<() => void>(() => undefined);
  const initializationTimerRef = useRef<number | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ChatMessage[];
        if (Array.isArray(parsed)) {
          const validMessages = parsed.filter(message => message && (message.role === 'user' || message.role === 'assistant') && typeof message.text === 'string');
          if (validMessages.length) restoredHistoryRef.current = true;
          setMessages(validMessages);
        }
      }
    } catch { /* Ignore malformed or unavailable browser storage. */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages)); } catch { /* Storage is optional. */ }
  }, [messages, hydrated]);

  useEffect(() => {
    let active = true;
    if (!GEMMA_ENABLED) { setStatus('disabled'); return () => { active = false; }; }
    const clearInitializationTimer = () => {
      if (initializationTimerRef.current !== undefined) window.clearTimeout(initializationTimerRef.current);
      initializationTimerRef.current = undefined;
    };
    const startWorker = () => {
      clearInitializationTimer();
      workerRef.current?.terminate();
      setWorkerReady(false);
      const worker = new Worker(new URL('./gemmaPhaseTwo.worker.ts', import.meta.url), {type: 'module'});
      workerRef.current = worker;
      worker.onerror = () => {
        if (!active) return;
        reportRuntimeError('worker', 'The on-device runtime stopped unexpectedly.');
        clearInitializationTimer();
        modelLoadedRef.current = false;
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
          case 'download-progress':
            if (modelLoadedRef.current) break;
            setDownloaded(message.received); setTotal(message.total); setStatus('downloading');
            break;
          case 'initializing':
            if (modelLoadedRef.current) break;
            setStatus('initializing');
            clearInitializationTimer();
            initializationTimerRef.current = window.setTimeout(() => {
              if (!active || worker !== workerRef.current) return;
              worker.terminate();
              workerRef.current = null;
              setWorkerReady(false);
              modelLoadedRef.current = false;
              setModelLoaded(false);
              setStatus('error');
              setError('WebGPU initialization exceeded 3 minutes and was stopped. Retry from the saved model.');
              startWorker();
            }, INITIALIZATION_TIMEOUT_MS);
            break;
          case 'loaded': clearInitializationTimer(); modelLoadedRef.current = true; setModelLoaded(true); setStatus('loaded'); break;
          case 'generation-chunk': setMessages(current => current.map((item, index) => index === current.length - 1 ? {...item, text: item.text + message.text} : item)); break;
          case 'generation-complete': setMessages(current => current.map((item, index) => index === current.length - 1 ? {...item, metrics: message.metrics} : item)); setStatus('loaded'); break;
          case 'conversation-reset': break;
          case 'cache-cleared': setCached(false); break;
          case 'cancelled': clearInitializationTimer(); setStatus(message.operation === 'generation' ? 'loaded' : 'cancelled'); break;
          case 'error': clearInitializationTimer(); reportRuntimeError(message.operation, message.message); setError(message.message); setStatus(message.operation === 'generation' ? 'loaded' : 'error'); break;
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
        const deviceMemory = 'deviceMemory' in navigator ? (navigator as Navigator & {deviceMemory?: number}).deviceMemory : undefined;
        setCapability({webGpu: Boolean(adapter), secureContext: window.isSecureContext, adapter: adapter ? [adapter.info.vendor, adapter.info.architecture].filter(Boolean).join(' · ') || 'WebGPU available' : 'Not available', storageAvailable: storage?.quota && storage.usage !== undefined ? storage.quota - storage.usage : undefined, deviceMemory, hardwareConcurrency: navigator.hardwareConcurrency});
        setStatus(adapter && window.isSecureContext ? 'ready' : 'unsupported');
      } catch (cause) { reportRuntimeError('capability-check', cause); setError(cause instanceof Error ? cause.message : String(cause)); setStatus('error'); }
    })();
    return () => { active = false; clearInitializationTimer(); workerRef.current?.terminate(); workerRef.current = null; };
  }, []);

  useEffect(() => { scrollRef.current?.scrollTo({top: scrollRef.current.scrollHeight, behavior: 'smooth'}); }, [messages]);
  const post = (message: MainToGemmaWorkerMessage) => workerRef.current?.postMessage(message);
  const progress = total ? Math.min(100, downloaded / total * 100) : 0;
  const loading = !modelLoaded && (status === 'downloading' || status === 'initializing');
  const resourceWarning = capability && ((capability.storageAvailable !== undefined && capability.storageAvailable < GEMMA_MODEL_BYTES * 1.15) || (capability.deviceMemory !== undefined && capability.deviceMemory <= 4));

  function loadModel() {
    modelLoadedRef.current = false;
    setModelLoaded(false);
    setError(''); setDownloaded(0); setTotal(GEMMA_MODEL_BYTES); setStatus(cached ? 'initializing' : 'downloading');
    post({type: 'load', modelUrl: GEMMA_MODEL_URL, verifiedBytes: GEMMA_MODEL_BYTES});
  }

  function send(text = input, appendUser = true) {
    const prompt = text.trim();
    if (!prompt || !modelLoaded || status === 'generating') return;
    setError(''); setInput(''); setStatus('generating');
    setMessages(current => [...(appendUser ? [...current, {id: crypto.randomUUID(), role: 'user' as const, text: prompt}] : current), {id: crypto.randomUUID(), role: 'assistant', text: ''}]);
    const context = restoredHistoryRef.current ? messages.filter(message => message.text).map(({role, text: messageText}) => ({role, text: messageText})).slice(-12) : undefined;
    restoredHistoryRef.current = false;
    post({type: 'generate', prompt, context});
  }

  function submit(event: FormEvent) { event.preventDefault(); send(); }
  function keyDown(event: KeyboardEvent<HTMLTextAreaElement>) { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(); } }
  function clearChat() { setMessages([]); setError(''); setCopiedId(null); restoredHistoryRef.current = false; if (modelLoaded) post({type: 'reset-conversation'}); }
  async function copyMessage(message: ChatMessage) {
    if (!message.text) return;
    try { await navigator.clipboard.writeText(message.text); setCopiedId(message.id); window.setTimeout(() => setCopiedId(current => current === message.id ? null : current), 1800); } catch { setError('Copy is unavailable in this browser.'); }
  }
  function regenerate() {
    if (status === 'generating' || !modelLoaded || messages.length < 2) return;
    const last = messages[messages.length - 1];
    const previous = messages[messages.length - 2];
    if (last.role !== 'assistant' || previous.role !== 'user') return;
    setMessages(current => [...current.slice(0, -1), {id: crypto.randomUUID(), role: 'assistant', text: ''}]);
    setError(''); setStatus('generating');
    const context = restoredHistoryRef.current ? messages.slice(0, -1).filter(message => message.text).map(({role, text: messageText}) => ({role, text: messageText})).slice(-12) : undefined;
    restoredHistoryRef.current = false;
    post({type: 'generate', prompt: previous.text, context});
  }
  function clearModel() { post({type: 'clear-cache'}); }
  function cancelLoad() {
    workerRef.current?.terminate();
    workerRef.current = null;
    if (initializationTimerRef.current !== undefined) window.clearTimeout(initializationTimerRef.current);
    initializationTimerRef.current = undefined;
    setWorkerReady(false);
    modelLoadedRef.current = false;
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
          <aside className="flex flex-col border border-white/10 bg-white/[.02] p-5 lg:min-h-[650px]">
            <div className="flex h-10 w-10 items-center justify-center border border-white/15 bg-white/5"><Bot size={20} /></div>
            <p className="mt-6 font-mono text-[10px] tracking-[.2em] text-neutral-500">LIVE DEMO 03 · GEMMA</p>
            <h1 className="mt-3 text-3xl font-black normal-case">Ask Dylan’s AI</h1>
            <p className="mt-4 text-sm leading-6 text-neutral-400">Chat with Gemma 4 E2B running entirely on your device. Your prompts never leave this browser.</p>
            <div className="mt-5 border border-white/10 bg-white/[.03] p-3 text-xs leading-5 text-neutral-500"><span className="font-semibold text-neutral-300">First visit?</span> The model downloads once, then stays cached locally. Chat history is saved only in this browser.</div>

            <div className="mt-7 space-y-3 border-y border-white/10 py-5 font-mono text-[10px]">
              <div className="flex justify-between"><span className="text-neutral-600">MODEL</span><span>Gemma 4 E2B</span></div>
              <div className="flex justify-between"><span className="text-neutral-600">DOWNLOAD</span><span>{formatBytes(GEMMA_MODEL_BYTES)}</span></div>
              <div className="flex justify-between"><span className="text-neutral-600">RUNTIME</span><span>LiteRT 0.14 · WebGPU</span></div>
              <div className="flex justify-between"><span className="text-neutral-600">LOCAL CACHE</span><span>{cached ? 'SAVED' : 'EMPTY'}</span></div>
            </div>

            {!modelLoaded && status !== 'unsupported' && status !== 'disabled' && !loading && (
              <button onClick={loadModel} disabled={!workerReady} className="mt-5 flex items-center justify-center gap-2 bg-white px-4 py-3 font-mono text-xs font-bold text-black disabled:opacity-40"><Download size={15} />{cached ? 'Load saved model' : 'Download model'}</button>
            )}
            {loading && <button onClick={cancelLoad} className="mt-5 border border-white/20 px-4 py-3 font-mono text-xs">Cancel loading</button>}
            {cached && <button onClick={clearModel} disabled={loading} className="mt-3 flex items-center justify-center gap-2 px-4 py-2 font-mono text-[10px] text-neutral-500 hover:text-white disabled:opacity-30"><HardDrive size={13} />Remove saved copy</button>}

            <div className="mt-auto pt-7 font-mono text-[10px] leading-5 text-neutral-600">
              <p>{capability?.webGpu ? '✓' : '×'} WebGPU · {capability?.secureContext ? '✓' : '×'} Secure context</p>
              <p className="truncate" title={capability?.adapter}>{capability?.adapter ?? 'Checking hardware…'}</p>
              <p>{capability?.deviceMemory ? `${capability.deviceMemory} GB device memory` : 'Device memory unavailable'}</p>
              <p>{formatBytes(capability?.storageAvailable)} storage available</p>
            </div>
          </aside>

          <section className="flex min-h-[calc(100dvh-7.5rem)] flex-col overflow-hidden border border-white/10 bg-white/[.015] lg:min-h-[650px]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div><p className="text-sm font-semibold">Portfolio assistant</p><p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-neutral-600">{status === 'generating' ? 'Generating locally…' : status === 'disabled' ? 'Temporarily unavailable' : modelLoaded ? 'Ready to chat' : 'Model setup required'}</p></div>
              <button onClick={clearChat} disabled={!messages.length || status === 'generating'} className="flex items-center gap-2 font-mono text-[10px] text-neutral-500 hover:text-white disabled:opacity-30"><Trash2 size={14} />Clear chat</button>
            </div>

            {loading && <div className="border-b border-white/10 px-5 py-4"><div className="flex flex-col gap-1 font-mono text-[10px] text-neutral-500 sm:flex-row sm:justify-between"><span>{status === 'initializing' ? 'STEP 2/2 · INITIALIZING WEBGPU RUNTIME' : cached ? 'STEP 1/2 · READING LOCAL MODEL' : 'STEP 1/2 · DOWNLOADING MODEL ONCE'}</span><span>{status === 'initializing' ? 'AUTO-STOPS AFTER 3 MIN' : `${progress.toFixed(1)}% · ${formatBytes(downloaded)} / ${formatBytes(total)}`}</span></div><div className="mt-3 h-1 bg-white/10"><div className="h-full bg-white transition-[width]" style={{width: `${status === 'initializing' ? 100 : progress}%`}} /></div><p className="mt-3 text-xs leading-5 text-neutral-600">Keep this tab open while the private model prepares. After setup, responses are generated on your device.</p></div>}

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-7 md:px-8" aria-live="polite">
              {!messages.length ? <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center py-10 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5"><Bot size={24} /></div>
                <h2 className="mt-6 text-2xl font-bold normal-case">What would you like to know?</h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-neutral-500">Ask about Dylan’s work, engineering background, or how this private on-device AI demo was built.</p>
                <div className="mt-7 grid w-full gap-2 sm:grid-cols-2">{suggestions.map(suggestion => <button key={suggestion} onClick={() => send(suggestion)} disabled={!modelLoaded} className="border border-white/10 p-3 text-left text-xs leading-5 text-neutral-400 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-35">{suggestion}</button>)}</div>
              </div> : <div className="mx-auto max-w-3xl space-y-7">{messages.map((message, index) => <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' && <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10"><Bot size={14} /></div>}
                <div className={`max-w-[92%] ${message.role === 'user' ? 'bg-white px-4 py-3 text-black sm:max-w-[85%]' : 'min-w-0 flex-1 py-1 text-neutral-300'}`}><div>{message.text ? message.role === 'assistant' ? <MarkdownMessage text={message.text} /> : <p className="whitespace-pre-wrap text-sm leading-7">{message.text}</p> : <span className="inline-block animate-pulse text-sm text-neutral-600">Thinking on your GPU…</span>}</div>{message.metrics && <p className="mt-2 font-mono text-[9px] text-neutral-600">FIRST TOKEN {message.metrics.firstTokenMs.toFixed(0)}MS · TOTAL {(message.metrics.totalMs / 1000).toFixed(1)}S</p>}{message.role === 'assistant' && message.text && <div className="mt-3 flex flex-wrap gap-3 font-mono text-[9px] text-neutral-600"><button type="button" onClick={() => copyMessage(message)} className="flex items-center gap-1 hover:text-white">{copiedId === message.id ? <Check size={12} /> : <Copy size={12} />}{copiedId === message.id ? 'COPIED' : 'COPY'}</button>{index === messages.length - 1 && <button type="button" onClick={regenerate} disabled={status === 'generating'} className="flex items-center gap-1 hover:text-white disabled:opacity-30"><RotateCcw size={12} />REGENERATE</button>}</div>}</div>
              </div>)}</div>}
            </div>

            {error && <div role="alert" className="mx-4 mb-3 flex items-center justify-between border border-red-400/20 bg-red-400/5 px-4 py-3 text-xs text-red-200 md:mx-8"><span>{error}</span><button onClick={() => setError('')}><RotateCcw size={14} /></button></div>}
            {resourceWarning && <div className="mx-4 mb-3 border border-amber-200/20 bg-amber-200/5 p-4 text-xs leading-5 text-amber-100/70 md:mx-8">This device may not have enough free memory or storage for the local model. You can continue, but loading may fail. No files or prompts leave this browser.</div>}
            {status === 'unsupported' && <div className="mx-4 mb-3 border border-white/10 p-4 text-xs leading-5 text-neutral-400 md:mx-8">This demo needs a WebGPU-enabled Chrome or Edge browser over HTTPS. You can still explore the rest of the <a href="/" className="text-white underline underline-offset-4">portfolio</a>.</div>}
            {status === 'disabled' && <div className="mx-4 mb-3 border border-white/10 p-4 text-xs leading-5 text-neutral-400 md:mx-8">The local AI demo is temporarily disabled while the portfolio is being maintained. The rest of the <a href="/" className="text-white underline underline-offset-4">portfolio</a> remains available.</div>}
            <form onSubmit={submit} className="border-t border-white/10 p-4 md:px-8 md:py-5">
              <div className="mx-auto flex max-w-3xl items-end gap-3 border border-white/15 bg-black p-2 focus-within:border-white/40">
                <textarea aria-label="Message Dylan’s AI" rows={1} value={input} onChange={event => setInput(event.target.value)} onKeyDown={keyDown} disabled={!modelLoaded || status === 'generating'} placeholder={modelLoaded ? 'Ask about Dylan…' : 'Load the model to start chatting'} className="max-h-36 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-neutral-700 disabled:cursor-not-allowed" />
                {status === 'generating' ? <button type="button" aria-label="Stop generating" onClick={() => post({type: 'cancel-generation'})} className="flex h-10 w-10 items-center justify-center bg-white text-black"><Square size={14} fill="currentColor" /></button> : <button aria-label="Send message" disabled={!modelLoaded || !input.trim()} className="flex h-10 w-10 items-center justify-center bg-white text-black disabled:bg-neutral-900 disabled:text-neutral-700"><ArrowUp size={17} /></button>}
              </div>
              <p className="mt-3 text-center font-mono text-[9px] text-neutral-700">POWERED BY GEMMA 4 E2B · RUNS LOCALLY · ENTER TO SEND · SHIFT+ENTER FOR NEW LINE</p>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
