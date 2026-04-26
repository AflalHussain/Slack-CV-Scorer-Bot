// Simple colored console logger
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

class Logger {
  constructor() {
    this.enabled = true;
  }

  info(message, ...args) {
    if (!this.enabled) return;
    console.log(`${colors.cyan}[INFO]${colors.reset}`, message, ...args);
  }

  success(message, ...args) {
    if (!this.enabled) return;
    console.log(`${colors.green}[SUCCESS]${colors.reset}`, message, ...args);
  }

  warn(message, ...args) {
    if (!this.enabled) return;
    console.warn(`${colors.yellow}[WARN]${colors.reset}`, message, ...args);
  }

  error(message, ...args) {
    if (!this.enabled) return;
    console.error(`${colors.red}[ERROR]${colors.reset}`, message, ...args);
  }

  debug(message, ...args) {
    if (!this.enabled) return;
    console.log(`${colors.magenta}[DEBUG]${colors.reset}`, message, ...args);
  }
}

module.exports = new Logger();
