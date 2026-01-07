const defaultLogger = (message, level) => {
    const prefix = {
        info: '[INFO]',
        success: '[SUCCESS]',
        fail: '[FAIL]',
        warn: '[WARN]'
    };
    console.log(`${prefix[level]} ${message}`);
};
let globalLogger = defaultLogger;
export function setLogger(logger) {
    globalLogger = logger || defaultLogger;
}
export function getLogger() {
    return globalLogger;
}
export function log(message, level = 'info') {
    globalLogger(message, level);
}
export function logInfo(message) {
    log(message, 'info');
}
export function logSuccess(message) {
    log(message, 'success');
}
export function logFail(message) {
    log(message, 'fail');
}
export function logWarn(message) {
    log(message, 'warn');
}
//# sourceMappingURL=logger.js.map