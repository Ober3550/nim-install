'use strict';

const chalk = require('chalk');

const logger = {
  info:    (msg) => console.log(chalk.cyan('ℹ'), msg),
  success: (msg) => console.log(chalk.green('✓'), msg),
  warn:    (msg) => console.log(chalk.yellow('⚠'), msg),
  error:   (msg) => console.error(chalk.red('✗'), msg),
  heading: (msg) => console.log(chalk.bold.white(msg)),
  dim:     (msg) => console.log(chalk.dim(msg)),
};

module.exports = { logger };
