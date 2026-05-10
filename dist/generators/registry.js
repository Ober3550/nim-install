"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGenerator = getGenerator;
exports.listGenerators = listGenerators;
const continue_1 = require("./continue");
/**
 * Registry of all available config generators.
 * To add support for a new agent, implement the Generator interface and
 * add it to this map.
 */
const generators = new Map([
    ['continue', continue_1.continueGenerator],
    // Future:
    // ['pi-agent', piAgentGenerator],
    // ['copilot', copilotGenerator],
]);
function getGenerator(id) {
    return generators.get(id.toLowerCase());
}
function listGenerators() {
    return Array.from(generators.values());
}
//# sourceMappingURL=registry.js.map