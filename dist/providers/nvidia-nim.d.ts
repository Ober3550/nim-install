import { NimModel } from '../generators/types';
export declare const NIM_API_BASE = "https://integrate.api.nvidia.com";
/**
 * Fetch the list of available models from the NVIDIA NIM API.
 * Uses the OpenAI-compatible GET /v1/models endpoint.
 */
export declare function fetchModels(apiKey: string): Promise<NimModel[]>;
//# sourceMappingURL=nvidia-nim.d.ts.map