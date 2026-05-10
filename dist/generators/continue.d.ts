import { Generator, NimModel } from './types';
export declare function classifyModel(model: NimModel): 'chat' | 'autocomplete' | 'skip';
/**
 * Convert a NIM model ID into a readable display name.
 * "meta/llama-3.1-70b-instruct" → "Meta — Llama 3.1 70B Instruct"
 */
export declare function formatModelName(modelId: string): string;
export declare const continueGenerator: Generator;
//# sourceMappingURL=continue.d.ts.map