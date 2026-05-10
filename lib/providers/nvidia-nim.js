'use strict';

const NIM_API_BASE = 'https://integrate.api.nvidia.com';

/**
 * Fetch the list of available models from the NVIDIA NIM API.
 * Uses the OpenAI-compatible GET /v1/models endpoint.
 * @param {string} apiKey
 * @returns {Promise<Array<{id: string, object: string, owned_by?: string}>>}
 */
async function fetchModels(apiKey) {
  const response = await fetch(`${NIM_API_BASE}/v1/models`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `NVIDIA NIM API returned ${response.status} ${response.statusText}` +
        (body ? `\n${body}` : '')
    );
  }

  const data = await response.json();

  if (!Array.isArray(data.data)) {
    throw new Error('Unexpected response format from NVIDIA NIM API');
  }

  return data.data;
}

module.exports = { NIM_API_BASE, fetchModels };
