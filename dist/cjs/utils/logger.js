"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setLogger = setLogger;
exports.getLogger = getLogger;
exports.log = log;
exports.logInfo = logInfo;
exports.logSuccess = logSuccess;
exports.logFail = logFail;
exports.logWarn = logWarn;
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
function setLogger(logger) {
    globalLogger = logger || defaultLogger;
}
function getLogger() {
    return globalLogger;
}
function log(message, level = 'info') {
    globalLogger(message, level);
}
function logInfo(message) {
    log(message, 'info');
}
function logSuccess(message) {
    log(message, 'success');
}
function logFail(message) {
    log(message, 'fail');
}
function logWarn(message) {
    log(message, 'warn');
}
//# sourceMappingURL=logger.js.map