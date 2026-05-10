import * as yaml from 'js-yaml';
import * as path from 'path';
import * as os from 'os';
import { Generator, GeneratorOptions, NimModel } from './types';
import { writeConfig } from '../utils/config';

// ---------------------------------------------------------------------------
// Model classification
// ---------------------------------------------------------------------------

/**
 * Model ID substrings that indicate a non-chat model (embeddings, image
 * generation, scientific, vision-only, safety classifiers, etc.).
 * These are excluded from the chat/autocomplete config by default.
 */
const NON_CHAT_PATTERNS = [
  'embed',
  'rerank',
  'flux',
  'stable-diffusion',
  'stable-video',
  'alphafold',
  'diffdock',
  'esmfold',
  'rfdiffusion',
  'proteinmpnn',
  'boltz',
  'molmim',
  'genmol',
  'cuopt',
  'fourcastnet',
  'corrdiff',
  'bevformer',
  'streampetr',
  'sparsedrive',
  'dinov2',
  'grounding-dino',
  'visual-changenet',
  'gliner',
  'nvclip',
  'jailbreak-detect',
  'nemoretriever-parse',
  'nemotron-parse',
  'evo2',
  'msa-search',
  'paligemma',
];

// Patterns that identify autocompletion-capable (Fill-in-Middle) code models
const AUTOCOMPLETE_PATTERNS = ['coder', 'starcoder', 'deepseek-coder'];

export function classifyModel(
  model: NimModel
): 'chat' | 'autocomplete' | 'skip' {
  const id = model.id.toLowerCase();

  if (NON_CHAT_PATTERNS.some((p) => id.includes(p))) {
    return 'skip';
  }

  if (AUTOCOMPLETE_PATTERNS.some((p) => id.includes(p))) {
    return 'autocomplete';
  }

  return 'chat';
}

// ---------------------------------------------------------------------------
// Name formatting
// ---------------------------------------------------------------------------

/**
 * Convert a NIM model ID into a readable display name.
 * "meta/llama-3.1-70b-instruct" → "Meta — Llama 3.1 70B Instruct"
 */
export function formatModelName(modelId: string): string {
  const slashIndex = modelId.indexOf('/');
  let org = '';
  let modelPart = modelId;

  if (slashIndex !== -1) {
    org = modelId.slice(0, slashIndex);
    modelPart = modelId.slice(slashIndex + 1);
  }

  const formatSegment = (segment: string): string =>
    segment
      .split(/[-_.]/)
      .map((word) => {
        // Numeric tokens like "3.1", "70b" → keep upper-casing the 'b' suffix
        if (/^\d/.test(word)) return word.toUpperCase();
        // Common abbreviations
        if (['hf', 'it', 'vl', 'vlm'].includes(word)) return word.toUpperCase();
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');

  const orgDisplay = org ? formatSegment(org) + ' — ' : '';
  return orgDisplay + formatSegment(modelPart);
}

// ---------------------------------------------------------------------------
// Config builder
// ---------------------------------------------------------------------------

function buildContinueConfig(options: GeneratorOptions): Record<string, unknown> {
  const chatModels: NimModel[] = [];
  const autocompleteModels: NimModel[] = [];

  for (const model of options.models) {
    const cls = classifyModel(model);
    if (cls === 'chat') chatModels.push(model);
    else if (cls === 'autocomplete') autocompleteModels.push(model);
    // 'skip' → excluded
  }

  const apiBaseV1 = `${options.apiBase}/v1`;

  const modelEntries = chatModels.map((model) => ({
    name: formatModelName(model.id),
    provider: 'openai',
    model: model.id,
    apiBase: apiBaseV1,
    requestOptions: {
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
      },
    },
    capabilities: ['tool_use'],
    roles: ['chat', 'edit', 'apply'],
  }));

  // Add code models with their default chat roles AND a separate autocomplete entry
  for (const model of autocompleteModels) {
    modelEntries.push({
      name: formatModelName(model.id),
      provider: 'openai',
      model: model.id,
      apiBase: apiBaseV1,
      requestOptions: {
        headers: {
          Authorization: `Bearer ${options.apiKey}`,
        },
      },
      capabilities: ['tool_use'],
      roles: ['chat', 'edit', 'apply'],
    });

    // Separate autocomplete entry
    modelEntries.push({
      name: `${formatModelName(model.id)} (Autocomplete)`,
      provider: 'openai',
      model: model.id,
      apiBase: apiBaseV1,
      requestOptions: {
        headers: {
          Authorization: `Bearer ${options.apiKey}`,
        },
      },
      capabilities: [],
      roles: ['autocomplete'],
    });
  }

  return {
    name: 'NVIDIA NIM',
    version: '1.0.0',
    schema: 'v1',
    models: modelEntries,
  };
}

// ---------------------------------------------------------------------------
// Generator implementation
// ---------------------------------------------------------------------------

export const continueGenerator: Generator = {
  id: 'continue',
  name: 'Continue',
  description:
    'Generate a config.yaml for the Continue VS Code / JetBrains extension',
  defaultOutputPath: path.join(os.homedir(), '.continue', 'config.yaml'),

  async generate(options: GeneratorOptions): Promise<void> {
    const config = buildContinueConfig(options);

    const yamlContent = yaml.dump(config, {
      lineWidth: 120,
      noRefs: true,
      forceQuotes: false,
    });

    const header = [
      '# Generated by nim-install',
      '# https://github.com/Ober3550/nim-install',
      '#',
      '# SECURITY NOTE: This file contains your NVIDIA NIM API key.',
      '# Keep this file private and do not commit it to version control.',
      '# To rotate your key, re-run: nim-install generate continue',
      '',
    ].join('\n');

    await writeConfig(options.outputPath, header + yamlContent, options.overwrite);
  },
};
