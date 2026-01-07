"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.isConnectingToPhone = exports.isInsideChats = exports.needsToScan = exports.isAuthenticated = exports.getInterfaceStatus = void 0;
exports.asciiQr = asciiQr;
exports.retrieveQR = retrieveQR;
exports.checkDisconnect = checkDisconnect;
exports.checkStore = checkStore;
const path = __importStar(require("path"));
const qr_generator_js_1 = require("../utils/qr-generator.js");
const sleep_js_1 = require("../utils/sleep.js");
const getInterfaceStatus = async (waPage) => {
    return await waPage
        .waitForFunction(() => {
        const erroHTTP = document.querySelector('.error-code');
        if (erroHTTP && erroHTTP[0].innerText.includes('HTTP ERROR 429')) {
            return { type: erroHTTP[0].innerText };
        }
        if (document.querySelector('canvas')) {
            return 'UNPAIRED';
        }
        const streamStatus = window?.Store?.Stream?.displayInfo;
        if (['PAIRING', 'RESUMING', 'SYNCING'].includes(streamStatus)) {
            return 'PAIRING';
        }
        const chat = document.querySelector('.app, .two');
        if (chat && chat.attributes && chat.tabIndex) {
            return 'CONNECTED';
        }
        return false;
    }, {
        timeout: 0,
        polling: 100
    })
        .then(async (element) => {
        return await element
            .evaluate((a) => {
            return a;
        })
            .catch(() => undefined);
    })
        .catch(() => undefined);
};
exports.getInterfaceStatus = getInterfaceStatus;
// };
/**
 * Validates if client is authenticated
 * @returns true if is authenticated, false otherwise
 * @param waPage
 */
const isAuthenticated = async (waPage) => {
    const status = await (0, exports.getInterfaceStatus)(waPage);
    if (typeof status === 'object') {
        return status;
    }
    if (typeof status !== 'string') {
        return null;
    }
    return ['CONNECTED', 'PAIRING'].includes(status);
};
exports.isAuthenticated = isAuthenticated;
const needsToScan = async (waPage) => {
    const status = await (0, exports.getInterfaceStatus)(waPage);
    if (typeof status !== 'string') {
        return null;
    }
    return status === 'UNPAIRED';
};
exports.needsToScan = needsToScan;
const isInsideChats = async (waPage) => {
    const status = await (0, exports.getInterfaceStatus)(waPage);
    if (typeof status !== 'string') {
        return null;
    }
    return status === 'CONNECTED';
};
exports.isInsideChats = isInsideChats;
const isConnectingToPhone = async (waPage) => {
    const status = await (0, exports.getInterfaceStatus)(waPage);
    if (typeof status !== 'string') {
        return null;
    }
    return status === 'PAIRING';
};
exports.isConnectingToPhone = isConnectingToPhone;
async function asciiQr(code) {
    try {
        return await (0, qr_generator_js_1.generateASCIIQR)(code, { small: true });
    }
    catch (e) {
        console.error(e);
        return '';
    }
}
async function retrieveQR(page) {
    const hasCanvas = await page
        .evaluate(() => {
        const buttonReload = document.querySelector('button.Jht5u');
        const canvas = document.querySelector('canvas');
        if (canvas !== null && buttonReload === null) {
            return true;
        }
        else {
            return false;
        }
    })
        .catch(() => undefined);
    if (hasCanvas === false) {
        return undefined;
    }
    await page
        .addScriptTag({
        path: require.resolve(path.join(__dirname, '../lib/jsQR', 'jsQR.js'))
    })
        .catch(() => undefined);
    return await page
        .evaluate(() => {
        const buttonReload = document.querySelector('button.Jht5u');
        const canvas = document.querySelector('canvas') || null;
        if (canvas !== null && buttonReload === null) {
            const context = canvas.getContext('2d') || null;
            if (context !== null && buttonReload === null) {
                // @ts-ignore
                const code = jsQR(context.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height);
                return {
                    urlCode: code.data ? code.data : '',
                    base64Image: canvas.toDataURL()
                };
            }
        }
        return undefined;
    })
        .catch(() => undefined);
}
async function checkDisconnect(page, wpp) {
    while (true) {
        const erroBrowser = await page
            .evaluate(() => {
            const WebEncKeySalt = localStorage.getItem('WebEncKeySalt');
            const WANoiseInfo = localStorage.getItem('WANoiseInfo');
            if (WebEncKeySalt === null && WANoiseInfo === null) {
                return true;
            }
            return false;
        })
            .catch(() => { });
        if (erroBrowser) {
            await wpp.delProfile();
        }
        await (0, sleep_js_1.sleep)(100);
    }
}
async function checkStore(page, client) {
    while (true) {
        const result = await page
            .evaluate(() => {
            const checkStore = typeof window.Store !== 'undefined'
                ? Object.keys(window.Store).length
                : undefined;
            if (!checkStore || !window.WAPI) {
                if (window['webpackChunkwhatsapp_web_client'] &&
                    Array.isArray(window['webpackChunkwhatsapp_web_client'])) {
                    let last = window['webpackChunkwhatsapp_web_client'].length - 1;
                    let check = window['webpackChunkwhatsapp_web_client'] &&
                        window['webpackChunkwhatsapp_web_client'][last] &&
                        window['webpackChunkwhatsapp_web_client'][last][0]
                        ? []
                        : undefined;
                    if (check !== undefined) {
                        window.Store = undefined;
                        window.WAPI = undefined;
                        return false;
                    }
                }
            }
            return true;
        })
            .catch(() => { });
        if (result === false) {
            await client.initService();
            // await injectApi(page).catch(() => {});
        }
        await (0, sleep_js_1.sleep)(100);
    }
}
//# sourceMappingURL=auth.js.map