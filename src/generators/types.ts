export interface NimModel {
  id: string;
  object: string;
  created?: number;
  owned_by?: string;
}

export interface NimModelsResponse {
  object: string;
  data: NimModel[];
}

export interface GeneratorOptions {
  /** NVIDIA NIM API key to embed in the generated config */
  apiKey: string;
  /** Base URL for the NVIDIA NIM API, e.g. https://integrate.api.nvidia.com */
  apiBase: string;
  /** Models to include in the generated config */
  models: NimModel[];
  /** Absolute path where the config file should be written */
  outputPath: string;
  /** Whether to overwrite an existing file at outputPath */
  overwrite: boolean;
}

export interface Generator {
  /** Unique identifier used as the CLI target argument, e.g. "continue" */
  readonly id: string;
  /** Human-readable name for display */
  readonly name: string;
  /** Short description shown in help text */
  readonly description: string;
  /** Default output path on the current OS */
  readonly defaultOutputPath: string;
  /** Write the config file for this agent */
  generate(options: GeneratorOptions): Promise<void>;
}
