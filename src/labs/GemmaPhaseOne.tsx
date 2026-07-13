import {useEffect, useRef, useState, type FormEvent} from 'react';
import {
  GEMMA_MODEL_BYTES,
  GEMMA_MODEL_URL,
  type GemmaWorkerToMainMessage,
  type GenerationMetrics,
  type MainToGemmaWorkerMessage,
} from './gemmaPhaseTwo.protocol';

type LabStatus =
  | 'checking'
  | 'unsupported'
  | 'ready'
  | 'downloading'
  | 'initializing'
  | 'loaded'
  | 'generating'
  | 'cancelled'
  | 'error';

type CapabilityReport = {
  webGpu: boolean;
  secureContext: boolean;
  adapter: string;
  storageAvailable?: number;
  storageQuota?: number;
};

function formatBytes(bytes?: number) {
  if (bytes === undefined) return 'Unavailable';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1000 && unitIndex < units.length - 1) {
    value /= 1000;
    unitIndex += 1;
  }
  return `${value.toFixed(unitIndex > 1 ? 2 : 0)} ${units[unitIndex]}`;
}

export default function GemmaPhaseOne() {
  const [status, setStatus] = useState<LabStatus>('checking');
  const [capability, setCapability] = useState<CapabilityReport>();
  const [downloadedBytes, setDownloadedBytes] = useState(0);
  const [downloadTotal, setDownloadTotal] = useState(GEMMA_MODEL_BYTES);
  const [loadMs, setLoadMs] = useState<number>();
  const [prompt, setPrompt] = useState('Introduce Dylan in three concise sentences.');
  const [response, setResponse] = useState('');
  const [metrics, setMetrics] = useState<GenerationMetrics>();
  const [error, setError] = useState('');
  const [workerReady, setWorkerReady] = useState(false);
  const [modelIsLoaded, setModelIsLoaded] = useState(false);

  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    let active = true;
    // LiteRT-LM's early-preview WASM loader uses importScripts internally,
    // which requires a classic worker rather than an ES module worker.
    const worker = new Worker(new URL('./gemmaPhaseTwo.worker.ts', import.meta.url));
    workerRef.current = worker;

    function handleWorkerMessage(event: MessageEvent<GemmaWorkerToMainMessage>) {
      if (!active) return;
      const message = event.data;

      switch (message.type) {
        case 'worker-ready':
          setWorkerReady(true);
          break;
        case 'download-progress':
          setDownloadedBytes(message.received);
          setDownloadTotal(message.total);
          setStatus('downloading');
          break;
        case 'initializing':
          setStatus('initializing');
          break;
        case 'loaded':
          setLoadMs(message.loadMs);
          setModelIsLoaded(true);
          setStatus('loaded');
          break;
        case 'generation-chunk':
          setResponse(current => current + message.text);
          break;
        case 'generation-complete':
          setMetrics(message.metrics);
          setStatus('loaded');
          break;
        case 'cancelled':
          setError(message.operation === 'load'
            ? 'Model loading was cancelled.'
            : 'Generation was cancelled.');
          setStatus(message.operation === 'generation' ? 'loaded' : 'cancelled');
          break;
        case 'error':
          setError(message.message);
          setStatus('error');
          break;
      }
    }

    worker.addEventListener('message', handleWorkerMessage);

    async function checkCapabilities() {
      try {
        const webGpu = 'gpu' in navigator;
        let adapter = 'Not available';

        if (webGpu) {
          const gpuAdapter = await navigator.gpu.requestAdapter({powerPreference: 'high-performance'});
          if (gpuAdapter) {
            const info = gpuAdapter.info;
            adapter = [info.vendor, info.architecture, info.device, info.description]
              .filter(Boolean)
              .join(' · ') || 'WebGPU adapter available';
          }
        }

        const storage = await navigator.storage?.estimate?.();
        const report: CapabilityReport = {
          webGpu,
          secureContext: window.isSecureContext,
          adapter,
          storageAvailable: storage?.quota && storage?.usage !== undefined
            ? storage.quota - storage.usage
            : undefined,
          storageQuota: storage?.quota,
        };

        if (!active) return;
        setCapability(report);
        setStatus(webGpu && window.isSecureContext ? 'ready' : 'unsupported');
      } catch (cause) {
        if (!active) return;
        setError(cause instanceof Error ? cause.message : String(cause));
        setStatus('error');
      }
    }

    checkCapabilities();

    return () => {
      active = false;
      worker.removeEventListener('message', handleWorkerMessage);
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  function postToWorker(message: MainToGemmaWorkerMessage) {
    workerRef.current?.postMessage(message);
  }

  function loadModel() {
    setError('');
    setDownloadedBytes(0);
    setDownloadTotal(GEMMA_MODEL_BYTES);
    setResponse('');
    setMetrics(undefined);
    setLoadMs(undefined);
    setModelIsLoaded(false);
    setStatus('downloading');
    postToWorker({type: 'load', modelUrl: GEMMA_MODEL_URL, verifiedBytes: GEMMA_MODEL_BYTES});
  }

  function cancelLoad() {
    postToWorker({type: 'cancel-load'});
  }

  function sendPrompt(event: FormEvent) {
    event.preventDefault();
    const input = prompt.trim();
    if (!modelIsLoaded || !input || status === 'generating') return;

    setError('');
    setResponse('');
    setMetrics(undefined);
    setStatus('generating');
    postToWorker({type: 'generate', prompt: input});
  }

  function cancelGeneration() {
    postToWorker({type: 'cancel-generation'});
  }

  const progress = downloadTotal > 0
    ? Math.min(100, (downloadedBytes / downloadTotal) * 100)
    : 0;
  const canLoad = status === 'ready' || status === 'cancelled' || status === 'error';

  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white md:px-10">
      <div className="mx-auto max-w-5xl">
        <a href="/" className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500 hover:text-white">← Portfolio</a>

        <header className="mt-10 border-b border-white/10 pb-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 font-mono text-[10px] font-bold tracking-[0.2em]">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            PHASE 02 · WORKER RUNTIME
          </div>
          <h1 className="max-w-4xl text-4xl font-black leading-none md:text-7xl">Gemma 4 E2B Browser Lab</h1>
          <p className="mt-6 max-w-3xl font-mono text-sm leading-7 text-neutral-400">
            An isolated Web Worker test for Google LiteRT-LM, WebGPU model loading, streaming generation and cancellation. The AI runtime stays off the browser's main UI thread.
          </p>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-4" aria-label="Feasibility summary">
          {[
            ['MODEL', 'Gemma 4 E2B IT'],
            ['RUNTIME', '@litert-lm/core 0.12.1'],
            ['ARTIFACT', formatBytes(GEMMA_MODEL_BYTES)],
            ['EXECUTION', workerReady ? 'Worker + WebGPU' : 'Worker starting'],
          ].map(([label, value]) => (
            <div key={label} className="border border-white/10 bg-white/[0.02] p-5">
              <p className="font-mono text-[9px] font-bold tracking-[0.2em] text-neutral-600">{label}</p>
              <p className="mt-3 text-sm font-bold normal-case">{value}</p>
            </div>
          ))}
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <section className="border border-white/10 bg-white/[0.02] p-6 md:p-8">
            <h2 className="text-xl font-bold">Compatibility</h2>
            <dl className="mt-6 space-y-4 font-mono text-xs">
              <div className="flex justify-between gap-4 border-b border-white/5 pb-4">
                <dt className="text-neutral-500">Secure context</dt>
                <dd>{capability?.secureContext ? 'PASS' : 'FAIL'}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-white/5 pb-4">
                <dt className="text-neutral-500">WebGPU</dt>
                <dd>{capability?.webGpu ? 'PASS' : 'FAIL'}</dd>
              </div>
              <div className="border-b border-white/5 pb-4">
                <dt className="text-neutral-500">Adapter</dt>
                <dd className="mt-2 break-words text-right">{capability?.adapter ?? 'Checking…'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Available storage</dt>
                <dd>{formatBytes(capability?.storageAvailable)}</dd>
              </div>
            </dl>

            {status === 'unsupported' && (
              <p role="alert" className="mt-6 border border-white/15 bg-white/5 p-4 font-mono text-xs leading-6 text-neutral-300">
                This browser cannot run the spike. Use a secure localhost/HTTPS page in a WebGPU-enabled Chrome or Edge browser.
              </p>
            )}
          </section>

          <section className="border border-white/10 bg-white/[0.02] p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Runtime test</h2>
                <p className="mt-2 font-mono text-xs text-neutral-500">Status: {status.toUpperCase()}</p>
              </div>
              {!modelIsLoaded && canLoad && capability?.webGpu && capability.secureContext && (
                <button onClick={loadModel} className="border border-white bg-white px-5 py-3 font-mono text-xs font-bold text-black transition hover:bg-neutral-200">
                  Download & load model
                </button>
              )}
              {(status === 'downloading' || status === 'initializing') && (
                <button onClick={cancelLoad} className="border border-white/20 px-5 py-3 font-mono text-xs font-bold transition hover:border-white">
                  Cancel load
                </button>
              )}
            </div>

            <div className="mt-6 rounded border border-white/10 bg-black p-5">
              <div className="flex justify-between gap-4 font-mono text-[10px] text-neutral-500">
                <span>MODEL TRANSFER</span>
                <span>{formatBytes(downloadedBytes)} / {formatBytes(downloadTotal)}</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden bg-white/10" aria-label="Model download progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} role="progressbar">
                <div className="h-full bg-white transition-[width]" style={{width: `${progress}%`}} />
              </div>
              <p className="mt-3 font-mono text-[10px] text-neutral-600">{progress.toFixed(1)}% · load time {loadMs ? `${(loadMs / 1000).toFixed(1)}s` : 'pending'}</p>
            </div>

            <form onSubmit={sendPrompt} className="mt-6">
              <label htmlFor="gemma-prompt" className="font-mono text-[10px] font-bold tracking-[0.2em] text-neutral-500">TEST PROMPT</label>
              <textarea
                id="gemma-prompt"
                value={prompt}
                onChange={event => setPrompt(event.target.value)}
                disabled={!modelIsLoaded || status === 'generating'}
                className="mt-3 min-h-24 w-full resize-y border border-white/15 bg-black p-4 font-mono text-sm text-white outline-none transition focus:border-white disabled:cursor-not-allowed disabled:opacity-40"
              />
              <div className="mt-3 flex gap-3">
                <button disabled={!modelIsLoaded || status === 'generating'} className="border border-white bg-white px-5 py-3 font-mono text-xs font-bold text-black disabled:cursor-not-allowed disabled:opacity-30">
                  Run generation
                </button>
                {status === 'generating' && (
                  <button type="button" onClick={cancelGeneration} className="border border-white/20 px-5 py-3 font-mono text-xs font-bold">Stop</button>
                )}
              </div>
            </form>

            <div className="mt-6 min-h-32 border border-white/10 bg-black p-5" aria-live="polite">
              <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-neutral-600">MODEL OUTPUT</p>
              <p className="mt-4 whitespace-pre-wrap font-mono text-sm leading-7 text-neutral-300">{response || 'Waiting for a successful model load…'}</p>
            </div>

            {metrics && (
              <div className="mt-4 grid grid-cols-3 gap-3 font-mono text-[10px]">
                <div className="border border-white/10 p-3"><span className="block text-neutral-600">FIRST TOKEN</span><strong className="mt-2 block text-white">{metrics.firstTokenMs.toFixed(0)} ms</strong></div>
                <div className="border border-white/10 p-3"><span className="block text-neutral-600">TOTAL</span><strong className="mt-2 block text-white">{metrics.totalMs.toFixed(0)} ms</strong></div>
                <div className="border border-white/10 p-3"><span className="block text-neutral-600">CHARACTERS</span><strong className="mt-2 block text-white">{metrics.characters}</strong></div>
              </div>
            )}

            {error && <p role="alert" className="mt-5 border border-white/20 bg-white/5 p-4 font-mono text-xs leading-6 text-white">{error}</p>}
          </section>
        </div>

        <footer className="mt-8 border-t border-white/10 py-8 font-mono text-[10px] leading-6 text-neutral-600">
          Experimental route: /lab/gemma · The model is fetched directly from the official LiteRT community repository and executed in a dedicated Web Worker. This Phase 2 route does not persist the model or conversation.
        </footer>
      </div>
    </main>
  );
}
