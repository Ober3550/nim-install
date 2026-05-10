'use strict';

const fs   = require('fs');
const path = require('path');

/**
 * Write content to a file, creating any missing parent directories.
 * Throws if the file already exists and overwrite is false.
 * @param {string}  outputPath
 * @param {string}  content
 * @param {boolean} overwrite
 */
async function writeConfig(outputPath, content, overwrite) {
  const dir = path.dirname(outputPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(outputPath) && !overwrite) {
    throw new Error(
      `A file already exists at ${outputPath}.\nUse --overwrite to replace it.`
    );
  }

  fs.writeFileSync(outputPath, content, 'utf8');
}

/**
 * @param {string} filePath
 * @returns {boolean}
 */
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

module.exports = { writeConfig, fileExists };
