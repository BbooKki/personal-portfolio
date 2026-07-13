export const GEMMA_MODEL_URL = 'https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm/resolve/main/gemma-4-E2B-it-web.litertlm';
export const GEMMA_MODEL_BYTES = 2_008_432_640;

export type GenerationMetrics = {
  firstTokenMs: number;
  totalMs: number;
  characters: number;
};

export type MainToGemmaWorkerMessage =
  | {type: 'load'; modelUrl: string; verifiedBytes: number}
  | {type: 'generate'; prompt: string; context?: Array<{role: 'user' | 'assistant'; text: string}>}
  | {type: 'cancel-load'}
  | {type: 'cancel-generation'}
  | {type: 'reset-conversation'}
  | {type: 'check-cache'}
  | {type: 'clear-cache'};

export type GemmaWorkerToMainMessage =
  | {type: 'worker-ready'}
  | {type: 'download-progress'; received: number; total: number}
  | {type: 'initializing'}
  | {type: 'loaded'; loadMs: number}
  | {type: 'generation-chunk'; text: string}
  | {type: 'generation-complete'; metrics: GenerationMetrics}
  | {type: 'conversation-reset'}
  | {type: 'cache-status'; cached: boolean}
  | {type: 'cache-cleared'}
  | {type: 'cancelled'; operation: 'load' | 'generation'}
  | {type: 'error'; operation: 'load' | 'generation'; message: string};
