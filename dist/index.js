#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const inquirer_1 = __importDefault(require("inquirer"));
const nvidia_nim_1 = require("./providers/nvidia-nim");
const registry_1 = require("./generators/registry");
const continue_1 = require("./generators/continue");
const config_1 = require("./utils/config");
const logger_1 = require("./utils/logger");
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function resolveApiKey(flagValue) {
    const fromEnv = process.env['NVIDIA_API_KEY'];
    if (flagValue)
        return flagValue;
    if (fromEnv) {
        logger_1.logger.info('Using NVIDIA_API_KEY from environment');
        return fromEnv;
    }
    const { key } = await inquirer_1.default.prompt([
        {
            type: 'password',
            name: 'key',
            message: 'Enter your NVIDIA NIM API key:',
            validate: (input) => input.trim().length > 0 || 'API key is required',
        },
    ]);
    return key.trim();
}
// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
const program = new commander_1.Command();
program
    .name('nim-install')
    .description('Generate AI agent model configurations for NVIDIA NIM')
    .version('0.1.0');
// ---------------------------------------------------------------------------
// generate command
// ---------------------------------------------------------------------------
program
    .command('generate [target]')
    .description('Generate a model configuration for a target agent. ' +
    'Supported targets: ' +
    (0, registry_1.listGenerators)()
        .map((g) => g.id)
        .join(', '))
    .option('-k, --api-key <key>', 'NVIDIA NIM API key (or set NVIDIA_API_KEY env var)')
    .option('-o, --output <path>', 'Output path for the config file')
    .option('--overwrite', 'Overwrite an existing config file', false)
    .option('--all-models', 'Skip model selection and include all available chat/code models', false)
    .action(async (target, options) => {
    logger_1.logger.heading('\n  NVIDIA NIM Config Generator\n');
    // ── Resolve target ──────────────────────────────────────────────────
    let resolvedTarget = target;
    if (!resolvedTarget) {
        const generators = (0, registry_1.listGenerators)();
        const { chosen } = await inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'chosen',
                message: 'Which agent would you like to generate a config for?',
                choices: generators.map((g) => ({
                    name: `${g.name}  —  ${g.description}`,
                    value: g.id,
                })),
            },
        ]);
        resolvedTarget = chosen;
    }
    const generator = (0, registry_1.getGenerator)(resolvedTarget);
    if (!generator) {
        logger_1.logger.error(`Unknown target: "${resolvedTarget}"`);
        logger_1.logger.info(`Available targets: ${(0, registry_1.listGenerators)()
            .map((g) => g.id)
            .join(', ')}`);
        process.exit(1);
    }
    // ── Resolve API key ─────────────────────────────────────────────────
    const apiKey = await resolveApiKey(options.apiKey);
    // ── Fetch models ────────────────────────────────────────────────────
    logger_1.logger.info('Fetching available models from NVIDIA NIM…');
    let allModels;
    try {
        allModels = await (0, nvidia_nim_1.fetchModels)(apiKey);
        logger_1.logger.success(`Found ${allModels.length} available models`);
    }
    catch (err) {
        logger_1.logger.error(`Failed to fetch models: ${err.message}`);
        process.exit(1);
    }
    // ── Filter to chat / code models ────────────────────────────────────
    const usableModels = allModels.filter((m) => {
        const cls = (0, continue_1.classifyModel)(m);
        return cls === 'chat' || cls === 'autocomplete';
    });
    if (usableModels.length === 0) {
        logger_1.logger.error('No usable chat or code models found in the API response.');
        process.exit(1);
    }
    // ── Model selection ─────────────────────────────────────────────────
    let selectedModels = usableModels;
    if (!options.allModels) {
        const { chosen: selectedIds } = await inquirer_1.default.prompt([
            {
                type: 'checkbox',
                name: 'chosen',
                message: 'Select models to include (space to toggle, enter to confirm):',
                choices: usableModels.map((m) => ({
                    name: m.id,
                    value: m.id,
                    checked: true,
                })),
                pageSize: 20,
            },
        ]);
        if (selectedIds.length === 0) {
            logger_1.logger.warn('No models selected. Exiting.');
            process.exit(0);
        }
        selectedModels = usableModels.filter((m) => selectedIds.includes(m.id));
    }
    logger_1.logger.info(`Including ${selectedModels.length} model(s) in the config`);
    // ── Resolve output path ─────────────────────────────────────────────
    let outputPath = options.output ?? generator.defaultOutputPath;
    if (!options.output) {
        const { confirmedPath } = await inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'confirmedPath',
                message: 'Output path for the config file:',
                default: outputPath,
            },
        ]);
        outputPath = confirmedPath.trim();
    }
    // ── Overwrite check ─────────────────────────────────────────────────
    let overwrite = options.overwrite;
    if (!overwrite && (0, config_1.fileExists)(outputPath)) {
        logger_1.logger.warn(`A config file already exists at: ${outputPath}`);
        const { shouldOverwrite } = await inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'shouldOverwrite',
                message: 'Overwrite it?',
                default: false,
            },
        ]);
        if (!shouldOverwrite) {
            logger_1.logger.warn('Aborted — existing file was not modified.');
            process.exit(0);
        }
        overwrite = true;
    }
    // ── Security notice ─────────────────────────────────────────────────
    logger_1.logger.warn('Your NVIDIA NIM API key will be stored in plain text in the config file.');
    logger_1.logger.dim(`  File: ${outputPath}`);
    logger_1.logger.dim('  Ensure this file is excluded from version control.');
    // ── Generate ────────────────────────────────────────────────────────
    try {
        await generator.generate({
            apiKey,
            apiBase: nvidia_nim_1.NIM_API_BASE,
            models: selectedModels,
            outputPath,
            overwrite,
        });
        logger_1.logger.success(`Config written to: ${outputPath}`);
        logger_1.logger.info(`Restart your ${generator.name} extension / IDE to apply the new configuration.`);
    }
    catch (err) {
        logger_1.logger.error(`Failed to write config: ${err.message}`);
        process.exit(1);
    }
});
// ---------------------------------------------------------------------------
// list-models command
// ---------------------------------------------------------------------------
program
    .command('list-models')
    .description('List all models available on NVIDIA NIM')
    .option('-k, --api-key <key>', 'NVIDIA NIM API key (or set NVIDIA_API_KEY env var)')
    .option('--json', 'Output raw JSON', false)
    .action(async (options) => {
    const apiKey = await resolveApiKey(options.apiKey);
    logger_1.logger.info('Fetching available models…');
    try {
        const models = await (0, nvidia_nim_1.fetchModels)(apiKey);
        if (options.json) {
            console.log(JSON.stringify(models, null, 2));
            return;
        }
        console.log('');
        for (const model of models) {
            const cls = (0, continue_1.classifyModel)(model);
            const tag = cls === 'chat'
                ? ' [chat]'
                : cls === 'autocomplete'
                    ? ' [code/autocomplete]'
                    : ' [other]';
            console.log(`  ${model.id}${tag}`);
        }
        console.log('');
        logger_1.logger.success(`Total: ${models.length} models`);
    }
    catch (err) {
        logger_1.logger.error(`Failed to fetch models: ${err.message}`);
        process.exit(1);
    }
});
// ---------------------------------------------------------------------------
// Parse
// ---------------------------------------------------------------------------
program.parse();
//# sourceMappingURL=index.js.map