export async function checkingCloses(browser, mergedOptions, callStatus) {
    if (typeof browser === 'string') {
        return;
    }
    while (true) {
        await new Promise((r) => setTimeout(r, 2000));
        if (browser['isClose'] ||
            (mergedOptions.browserWS && !browser.isConnected())) {
            if (mergedOptions.browserWS) {
                await browser.disconnect();
                if (callStatus)
                    callStatus('serverClose');
            }
            if (browser['isClose']) {
                await browser.close();
                if (callStatus)
                    callStatus('browserClose');
            }
            return;
        }
    }
}
//# sourceMappingURL=closes-browser.js.map