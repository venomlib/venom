"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connect = connect;
//import { Browser, Page } from 'puppeteer';
const index_js_1 = require("../config/index.js");
async function connect(options) {
    //const event = new CallbackOnStatus();
    const mergeOptionsDefault = { ...index_js_1.defaultOptions, ...options };
    if (!!mergeOptionsDefault.session && mergeOptionsDefault.session.length) {
        const sessionName = mergeOptionsDefault.session;
        const replaceSession = sessionName.replace(/[^0-9a-zA-Zs]/g, '');
        if (replaceSession.length) {
            mergeOptionsDefault.session = replaceSession;
        }
        else {
            mergeOptionsDefault.session = index_js_1.defaultOptions.session;
        }
    }
    // const wpage: Browser | boolean = await initBrowser(mergeOptionsDefault);
    // if (typeof wpage !== 'boolean') {
    //   const page: boolean | Page = await initWhatsapp(mergeOptionsDefault, wpage);
    //   if (typeof page !== 'boolean') {
    //     console.log('New option');
    //   }
    // }
}
//# sourceMappingURL=init.js.map