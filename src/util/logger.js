import chalk from 'chalk';

class Logger {
  constructor(prefix) {
    this.prefix = prefix || 'unnamed'
  }

  /**
   * 
   * @param {String} levelName Name of logging level
   * @param {String} levelColor Color name for logging level name
   * @param  {...any} args Arguments for console.log
   */
  log(levelName, levelColor, ...args) {
    const padEnd = 5 - levelName.length
    const padEndString = padEnd ? ' '.repeat(padEnd) : ''
    const newPrefix = this.prefix + ' › ' + chalk.underline[levelColor](levelName) + padEndString
    console.log(newPrefix, ...args)
  }

  error(messageError, errorName) {
    this.log('warn', 'red', messageError)
    const err = new Error(messageError)
    err.name = errorName
    throw(err)
  }

  warn(...args) {
    this.log('warn', 'yellow', ...args)
  }

  info(...args) {
    this.log('info', 'blue', ...args)
  }

  debug(...args) {
    if (!process.env.DEBUG) return;
    this.log('debug', 'magenta', ...args)
  }
}

export default Logger
