import chalk from 'chalk';

export const logger = {
  info: (msg: string): void => {
    console.log(chalk.cyan('ℹ'), msg);
  },
  success: (msg: string): void => {
    console.log(chalk.green('✓'), msg);
  },
  warn: (msg: string): void => {
    console.log(chalk.yellow('⚠'), msg);
  },
  error: (msg: string): void => {
    console.error(chalk.red('✗'), msg);
  },
  heading: (msg: string): void => {
    console.log(chalk.bold.white(msg));
  },
  dim: (msg: string): void => {
    console.log(chalk.dim(msg));
  },
};
