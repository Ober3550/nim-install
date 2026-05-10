"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NIM_API_BASE = void 0;
exports.fetchModels = fetchModels;
exports.NIM_API_BASE = 'https://integrate.api.nvidia.com';
/**
 * Fetch the list of available models from the NVIDIA NIM API.
 * Uses the OpenAI-compatible GET /v1/models endpoint.
 */
async function fetchModels(apiKey) {
    const response = await fetch(`${exports.NIM_API_BASE}/v1/models`, {
        headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: 'application/json',
        },
    });
    if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(`NVIDIA NIM API returned ${response.status} ${response.statusText}` +
            (body ? `\n${body}` : ''));
    }
    const data = (await response.json());
    if (!Array.isArray(data.data)) {
        throw new Error('Unexpected response format from NVIDIA NIM API');
    }
    return data.data;
}
//# sourceMappingURL=nvidia-nim.js.map