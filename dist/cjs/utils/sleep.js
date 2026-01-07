"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = sleep;
function sleep(time) {
    try {
        return new Promise((resolve) => setTimeout(resolve, time));
    }
    catch (e) { }
}
//# sourceMappingURL=sleep.js.map