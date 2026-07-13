/// <reference lib="webworker" />

import {Engine, type Conversation, type Message} from '@litert-lm/core';
import type {
  GemmaWorkerToMainMessage,
  MainToGemmaWorkerMessage,
} from './gemmaPhaseTwo.protocol';

const workerScope = globalThis as unknown as DedicatedWorkerGlobalScope;
const LITERT_WASM_BASE = 'https://cdn.jsdelivr.net/npm/@litert-lm/core@0.12.1/wasm/';

// Emscripten cannot infer the imported script's directory from importScripts
// inside a bundled classic worker, so point its companion .wasm fetch back to
// the official package CDN explicitly.
(globalThis as unknown as {
  Module?: {locateFile: (path: string) => string};
}).Module = {
  locateFile: path => `${LITERT_WASM_BASE}${path}`,
};

let engine: Engine | null = null;
let conversation: Conversation | null = null;
let loadAbortController: AbortController | null = null;
let generationCancelled = false;

function post(message: GemmaWorkerToMainMessage) {
  workerScope.postMessage(message);
}

function extractText(message: Message) {
  if (typeof message.content === 'string') return message.content;
  if (!Array.isArray(message.content)) return '';
  return message.content
    .filter(item => item.type === 'text' && typeof item.text === 'string')
    .map(item => item.text)
    .join('');
}

async function resetRuntime() {
  generationCancelled = true;
  conversation?.cancel();
  if (conversation) await conversation.delete();
  if (engine) await engine.delete();
  conversation = null;
  engine = null;
}

async function loadModel(modelUrl: string, verifiedBytes: number) {
  await resetRuntime();
  generationCancelled = false;
  const startedAt = performance.now();
  const controller = new AbortController();
  loadAbortController = controller;

  try {
    const modelResponse = await fetch(modelUrl, {signal: controller.signal});
    if (!modelResponse.ok || !modelResponse.body) {
      throw new Error(`Model download failed with HTTP ${modelResponse.status}.`);
    }

    const contentLength = Number(modelResponse.headers.get('content-length'));
    const total = Number.isFinite(contentLength) && contentLength > 0
      ? contentLength
      : verifiedBytes;
    const reader = modelResponse.body.getReader();
    let received = 0;
    let lastProgressAt = 0;

    const monitoredStream = new ReadableStream<Uint8Array>({
      async pull(streamController) {
        const {done, value} = await reader.read();
        if (done) {
          post({type: 'download-progress', received, total});
          post({type: 'initializing'});
          streamController.close();
          return;
        }

        received += value.byteLength;
        const now = performance.now();
        if (now - lastProgressAt >= 100) {
          lastProgressAt = now;
          post({type: 'download-progress', received, total});
        }
        streamController.enqueue(value);
      },
      cancel(reason) {
        return reader.cancel(reason);
      },
    });

    engine = await Engine.create({
      model: monitoredStream,
      mainExecutorSettings: {maxNumTokens: 4096},
    });

    conversation = await engine.createConversation({
      preface: {
        messages: [{
          role: 'system',
          content: 'You are testing an on-device portfolio assistant for Dylan Islom, a full-stack engineer in Seoul. Keep responses concise and state that this is a Phase 2 Web Worker feasibility test.',
        }],
      },
      prefillPrefaceOnInit: true,
      sessionConfig: {
        maxOutputTokens: 256,
        samplerParams: {temperature: 0.2, p: 0.9, k: 40},
      },
    });

    loadAbortController = null;
    post({type: 'loaded', loadMs: performance.now() - startedAt});
  } catch (cause) {
    loadAbortController = null;
    if (controller.signal.aborted) {
      post({type: 'cancelled', operation: 'load'});
      return;
    }
    post({
      type: 'error',
      operation: 'load',
      message: cause instanceof Error ? cause.message : String(cause),
    });
  }
}

async function generate(prompt: string) {
  if (!conversation) {
    post({type: 'error', operation: 'generation', message: 'The model is not loaded.'});
    return;
  }

  generationCancelled = false;
  const startedAt = performance.now();
  let firstTokenAt: number | undefined;
  let characters = 0;

  try {
    const stream = conversation.sendMessageStreaming(prompt);
    for await (const chunk of stream) {
      if (generationCancelled) break;
      const text = extractText(chunk);
      if (!text) continue;
      firstTokenAt ??= performance.now();
      characters += text.length;
      post({type: 'generation-chunk', text});
    }

    if (generationCancelled) return;
    const finishedAt = performance.now();
    post({
      type: 'generation-complete',
      metrics: {
        firstTokenMs: (firstTokenAt ?? finishedAt) - startedAt,
        totalMs: finishedAt - startedAt,
        characters,
      },
    });
  } catch (cause) {
    if (generationCancelled) return;
    post({
      type: 'error',
      operation: 'generation',
      message: cause instanceof Error ? cause.message : String(cause),
    });
  }
}

workerScope.addEventListener('message', event => {
  const message = event.data as MainToGemmaWorkerMessage;

  switch (message.type) {
    case 'load':
      void loadModel(message.modelUrl, message.verifiedBytes);
      break;
    case 'generate':
      void generate(message.prompt);
      break;
    case 'cancel-load':
      loadAbortController?.abort();
      break;
    case 'cancel-generation':
      generationCancelled = true;
      conversation?.cancel();
      post({type: 'cancelled', operation: 'generation'});
      break;
  }
});

post({type: 'worker-ready'});
