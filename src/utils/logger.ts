export type LogLevel = 'info' | 'success' | 'fail' | 'warn';

export type LoggerFunction = (message: string, level: LogLevel) => void;

const defaultLogger: LoggerFunction = (message: string, level: LogLevel) => {
  const prefix = {
    info: '[INFO]',
    success: '[SUCCESS]',
    fail: '[FAIL]',
    warn: '[WARN]'
  };
  console.log(`${prefix[level]} ${message}`);
};

let globalLogger: LoggerFunction = defaultLogger;

export function setLogger(logger: LoggerFunction | null): void {
  globalLogger = logger || defaultLogger;
}

export function getLogger(): LoggerFunction {
  return globalLogger;
}

export function log(message: string, level: LogLevel = 'info'): void {
  globalLogger(message, level);
}

export function logInfo(message: string): void {
  log(message, 'info');
}

export function logSuccess(message: string): void {
  log(message, 'success');
}

export function logFail(message: string): void {
  log(message, 'fail');
}

export function logWarn(message: string): void {
  log(message, 'warn');
}
