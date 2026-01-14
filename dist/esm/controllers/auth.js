import * as path from 'path';
import { generateASCIIQR } from '../utils/qr-generator.js';
import { sleep } from '../utils/sleep.js';
export const getInterfaceStatus = async (waPage) => {
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
// };
/**
 * Validates if client is authenticated
 * @returns true if is authenticated, false otherwise
 * @param waPage
 */
export const isAuthenticated = async (waPage) => {
    const status = await getInterfaceStatus(waPage);
    if (typeof status === 'object') {
        return status;
    }
    if (typeof status !== 'string') {
        return null;
    }
    return ['CONNECTED', 'PAIRING'].includes(status);
};
export const needsToScan = async (waPage) => {
    const status = await getInterfaceStatus(waPage);
    if (typeof status !== 'string') {
        return null;
    }
    return status === 'UNPAIRED';
};
export const isInsideChats = async (waPage) => {
    const status = await getInterfaceStatus(waPage);
    if (typeof status !== 'string') {
        return null;
    }
    return status === 'CONNECTED';
};
export const isConnectingToPhone = async (waPage) => {
    const status = await getInterfaceStatus(waPage);
    if (typeof status !== 'string') {
        return null;
    }
    return status === 'PAIRING';
};
export async function asciiQr(code) {
    try {
        return await generateASCIIQR(code, { small: true });
    }
    catch (e) {
        console.error(e);
        return '';
    }
}
export async function retrieveQR(page) {
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
export async function checkDisconnect(page, wpp) {
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
        await sleep(100);
    }
}
export async function checkStore(page, client) {
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
        await sleep(100);
    }
}
//# sourceMappingURL=auth.js.map