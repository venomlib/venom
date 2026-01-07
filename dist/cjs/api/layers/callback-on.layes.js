"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallbackOnStatus = void 0;
const index_js_1 = require("../model/enum/index.js");
const index_js_2 = require("../helpers/index.js");
/**
 * attribution and behavior change of a given event
 */
class CallbackOnStatus {
    statusFind;
    constructor() {
        this.statusFind = '';
    }
    /**
     * waiting for event change
     * @param event returns event status
     */
    async onChange(event) {
        let change = null;
        while (true) {
            if (this.statusFind !== change) {
                change = this.statusFind;
                if (event)
                    event(change);
            }
            await (0, index_js_2.sleep)(50);
        }
    }
    /**
     * here you can monitor user events
     * @param type types of monitoring
     * @param callback returns of monitoring
     */
    async on(type, callback) {
        switch (type) {
            case index_js_1.onMode.interfaceChange:
                this.onChange((event) => {
                    if (event.onType === index_js_1.onMode.interfaceChange) {
                        callback(event);
                    }
                });
                break;
            case index_js_1.onMode.newOnAck:
                this.onChange((event) => {
                    if (event.onType === index_js_1.onMode.newOnAck) {
                        callback(event);
                    }
                });
                break;
            case index_js_1.onMode.newMessage:
                this.onChange((event) => {
                    if (event.onType === index_js_1.onMode.newMessage) {
                        callback(event);
                    }
                });
                break;
            case index_js_1.onMode.qrcode:
                this.onChange((event) => {
                    if (event.onType === index_js_1.onMode.qrcode) {
                        callback(event);
                    }
                });
                break;
            case index_js_1.onMode.connection:
                this.onChange((event) => {
                    if (event.onType === index_js_1.onMode.connection) {
                        callback(event);
                    }
                });
                break;
        }
    }
}
exports.CallbackOnStatus = CallbackOnStatus;
//# sourceMappingURL=callback-on.layes.js.map