"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = sleep;
/**
 * Pauses the execution for a specified amount of time.
 * @param time The duration to sleep in milliseconds.
 */
function sleep(time) {
    try {
        // Create a promise that resolves after the specified time
        return new Promise((resolve) => setTimeout(resolve, time));
    }
    catch { }
}
//# sourceMappingURL=sleep.js.map