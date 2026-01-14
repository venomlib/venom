"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeDesconnected = scrapeDesconnected;
async function scrapeDesconnected(page) {
    const result = await page
        .evaluate(() => {
        const scrape = window.Store.State.Socket.on('change:state');
        if (scrape.__x_stream === 'DISCONNECTED' &&
            scrape.__x_state === 'CONNECTED') {
            return true;
        }
        else {
            return false;
        }
    })
        .catch(() => undefined);
    return result;
}
//# sourceMappingURL=scrape-desconnect.js.map