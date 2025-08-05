import chalk from 'chalk';

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

let currentLevel = LOG_LEVELS.INFO;

export function setLogLevel(level) {
  currentLevel = level;
}

export function error(message, ...args) {
  if (currentLevel >= LOG_LEVELS.ERROR) {
    console.error(chalk.red('❌'), message, ...args);
  }
}

export function warn(message, ...args) {
  if (currentLevel >= LOG_LEVELS.WARN) {
    console.warn(chalk.yellow('⚠️'), message, ...args);
  }
}

export function info(message, ...args) {
  if (currentLevel >= LOG_LEVELS.INFO) {
    console.log(chalk.blue('ℹ️'), message, ...args);
  }
}

export function debug(message, ...args) {
  if (currentLevel >= LOG_LEVELS.DEBUG) {
    console.log(chalk.gray('🔍'), message, ...args);
  }
}

export function success(message, ...args) {
  if (currentLevel >= LOG_LEVELS.INFO) {
    console.log(chalk.green('✅'), message, ...args);
  }
}

export function logSecretDetection(file, type, reason = '') {
  const typeColors = {
    'staged': chalk.red,
    'tracked': chalk.yellow,
    'suspicious_content': chalk.magenta
  };
  
  const color = typeColors[type] || chalk.white;
  const typeLabel = type.replace('_', ' ').toUpperCase();
  
  debug(`${color(typeLabel)}: ${file}${reason ? ` (${reason})` : ''}`);
} 