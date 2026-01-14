export type LogLevel = 'info' | 'success' | 'fail' | 'warn';
export type LoggerFunction = (message: string, level: LogLevel) => void;
export declare function setLogger(logger: LoggerFunction | null): void;
export declare function getLogger(): LoggerFunction;
export declare function log(message: string, level?: LogLevel): void;
export declare function logInfo(message: string): void;
export declare function logSuccess(message: string): void;
export declare function logFail(message: string): void;
export declare function logWarn(message: string): void;
