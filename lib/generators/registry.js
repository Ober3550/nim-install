'use strict';

const { continueGenerator } = require('./continue');

/**
 * Registry of all available config generators.
 * To add a new agent, implement the generator object shape and add it here.
 */
const generators = new Map([
  ['continue', continueGenerator],
  // Future:
  // ['pi-agent', piAgentGenerator],
  // ['copilot', copilotGenerator],
]);

/** @param {string} id @returns {object | undefined} */
function getGenerator(id) {
  return generators.get(id.toLowerCase());
}

/** @returns {object[]} */
function listGenerators() {
  return Array.from(generators.values());
}

module.exports = { getGenerator, listGenerators };
