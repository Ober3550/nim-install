import { Generator } from './types';
import { continueGenerator } from './continue';

/**
 * Registry of all available config generators.
 * To add support for a new agent, implement the Generator interface and
 * add it to this map.
 */
const generators = new Map<string, Generator>([
  ['continue', continueGenerator],
  // Future:
  // ['pi-agent', piAgentGenerator],
  // ['copilot', copilotGenerator],
]);

export function getGenerator(id: string): Generator | undefined {
  return generators.get(id.toLowerCase());
}

export function listGenerators(): Generator[] {
  return Array.from(generators.values());
}
