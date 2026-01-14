"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterfaceStateChange = void 0;
exports.create = create;
const whatsapp_js_1 = require("../api/whatsapp.js");
const create_config_js_1 = require("../config/create-config.js");
const browser_js_1 = require("./browser.js");
const welcome_js_1 = require("./welcome.js");
const logger_js_1 = require("../utils/logger.js");
const index_js_1 = require("../api/model/enum/index.js");
const index_js_2 = require("../api/helpers/index.js");
var InterfaceStateChange;
(function (InterfaceStateChange) {
    /**
     * Client interface is loading page from qrcode
     */
    InterfaceStateChange["qrcodeOpening"] = "qrcodeOpening";
    /**
     * Client interface is loading qrcode
     */
    InterfaceStateChange["qrcodeLoading"] = "qrcodeLoading";
    /**
     * QR code ready to be read!
     */
    InterfaceStateChange["qrcodeNormal"] = "qrcodeNormal";
    /**
     * Client interface is loading page from syncing
     */
    InterfaceStateChange["syncingOpening"] = "syncingOpening";
    /**
     * Client interface is loading syncing
     */
    InterfaceStateChange["syncingLoading"] = "syncingLoading";
    /**
     * Syncing ready to be read!
     */
    InterfaceStateChange["syncingNormal"] = "syncingNormal";
    /**
     * The customer is in the chat
     */
    InterfaceStateChange["chatsAvailable"] = "chatsAvailable";
})(InterfaceStateChange || (exports.InterfaceStateChange = InterfaceStateChange = {}));
async function create(sessionOrOption, catchQR, statusFind, options, browserInstance, reconnectQrcode, interfaceChange) {
    let session = 'session';
    if (typeof sessionOrOption === 'string' &&
        sessionOrOption.replace(/\s/g, '').length) {
        session = sessionOrOption.replace(/\s/g, '');
        options['session'] = session;
    }
    else if (typeof sessionOrOption === 'object') {
        session = sessionOrOption.session || session;
        catchQR = sessionOrOption.catchQR || catchQR;
        statusFind = sessionOrOption.statusFind || statusFind;
        browserInstance = sessionOrOption.browserInstance || browserInstance;
        options = sessionOrOption;
    }
    // Set up custom logger if provided
    if (options?.logger) {
        (0, logger_js_1.setLogger)(options.logger);
    }
    (0, logger_js_1.logInfo)('Checking Node.js version...');
    const requiredNodeVersion = 16;
    const currentNodeVersion = Number(process.versions.node.split('.')[0]);
    if (currentNodeVersion < requiredNodeVersion) {
        (0, logger_js_1.logFail)("Update Node.js, the version you are using doesn't work for this system!");
        throw new Error(`Outdated Node.js version. Node.js ${requiredNodeVersion} or higher is required. Please update Node.js.`);
    }
    (0, logger_js_1.logSuccess)('Node.js version verified successfully!');
    const mergedOptions = { ...create_config_js_1.defaultOptions, ...options };
    if (!mergedOptions.disableWelcome) {
        (0, welcome_js_1.welcomeScreen)();
    }
    if (statusFind)
        statusFind('initBrowser', session);
    // Initialize whatsapp
    if (mergedOptions.browserWS) {
        (0, logger_js_1.logInfo)('Waiting... checking the wss server...');
    }
    else {
        (0, logger_js_1.logInfo)('Waiting... checking the browser...');
    }
    const browser = await (0, browser_js_1.initBrowser)(mergedOptions);
    if (typeof browser === 'boolean') {
        (0, logger_js_1.logFail)('Error no open browser....');
        if (statusFind)
            statusFind('noOpenBrowser', session);
        throw new Error(`Error no open browser....`);
    }
    if (mergedOptions.browserWS) {
        if (statusFind)
            statusFind('connectBrowserWs', session);
        (0, logger_js_1.logSuccess)('Has been properly connected to the wss server');
    }
    else {
        if (statusFind)
            statusFind('openBrowser', session);
        (0, logger_js_1.logSuccess)('Browser successfully opened');
    }
    if (!mergedOptions.browserWS) {
        (0, logger_js_1.logInfo)('Checking headless...');
        if (mergedOptions.headless) {
            (0, logger_js_1.logSuccess)('Headless option is active, browser hidden');
        }
        else {
            (0, logger_js_1.logSuccess)('Headless option is disabled, browser visible');
        }
    }
    if (!mergedOptions.browserWS && browser['_process']) {
        browser['_process'].once('close', () => {
            browser['isClose'] = true;
        });
    }
    (0, index_js_2.checkingCloses)(browser, mergedOptions, (result) => {
        if (statusFind)
            statusFind(result, session);
    }).catch(() => {
        (0, logger_js_1.logFail)('Closed Browser');
    });
    (0, logger_js_1.logInfo)('Checking page to WhatsApp...');
    if (statusFind)
        statusFind('initWhatsapp', session);
    // Initialize whatsapp
    const page = await (0, browser_js_1.initWhatsapp)(mergedOptions, browser);
    if (page === false) {
        (0, logger_js_1.logFail)('Error accessing the page: "https://web.whatsapp.com"');
        if (statusFind)
            statusFind('erroPageWhatsapp', session);
        throw new Error('Error when trying to access the page: "https://web.whatsapp.com"');
    }
    if (statusFind)
        statusFind('successPageWhatsapp', session);
    (0, logger_js_1.logSuccess)('Page successfully accessed');
    (0, logger_js_1.logInfo)('Waiting for introduction');
    (0, browser_js_1.statusLog)(page, session, (event) => {
        (0, logger_js_1.logInfo)(event);
        if (statusFind)
            statusFind('introductionHistory', session, event);
    });
    const client = new whatsapp_js_1.Whatsapp(browser, page, session, mergedOptions);
    if (browserInstance) {
        browserInstance(browser, page, client);
    }
    client.onInterfaceChange(async (interFace) => {
        try {
            if (interFace.mode === index_js_1.InterfaceMode.MAIN) {
                if (interfaceChange)
                    interfaceChange('chatsAvailable', session);
                (0, logger_js_1.logInfo)('Opening main page...');
                (0, logger_js_1.logSuccess)('Successfully main page!');
                (0, logger_js_1.logSuccess)('Successfully sync!');
                await client.initService();
                await client.addChatWapi();
            }
            if (interFace.mode === index_js_1.InterfaceMode.SYNCING) {
                if (interFace.info === index_js_1.InterfaceState.OPENING) {
                    if (interfaceChange)
                        interfaceChange('syncingOpening', session);
                    (0, logger_js_1.logInfo)('Opening sync page...');
                }
                if (interFace.info === index_js_1.InterfaceState.PAIRING) {
                    if (interfaceChange)
                        interfaceChange('syncingLoading', session);
                    (0, logger_js_1.logInfo)('Loading sync...');
                }
                if (interFace.info === index_js_1.InterfaceState.NORMAL) {
                    if (interfaceChange)
                        interfaceChange('syncingNormal', session);
                    (0, logger_js_1.logSuccess)('Successfully sync!');
                }
            }
            if (interFace.mode === index_js_1.InterfaceMode.QR) {
                if (interFace.info === index_js_1.InterfaceState.OPENING) {
                    if (interfaceChange)
                        interfaceChange('qrcodeOpening', session);
                    (0, logger_js_1.logInfo)('Opening QR Code page...');
                }
                if (interFace.info === index_js_1.InterfaceState.PAIRING) {
                    if (interfaceChange)
                        interfaceChange('qrcodeLoading', session);
                    (0, logger_js_1.logInfo)('Loading QR Code...');
                }
                if (interFace.info === index_js_1.InterfaceState.NORMAL) {
                    if (interfaceChange)
                        interfaceChange('qrcodeNormal', session);
                    (0, logger_js_1.logSuccess)('Successfully loaded QR Code!');
                }
            }
        }
        catch { }
    });
    client
        .onStreamChange(async (stateStream) => {
        if (stateStream === index_js_1.SocketStream.CONNECTED) {
            (0, logger_js_1.logSuccess)('Successfully connected!');
        }
        if (stateStream === index_js_1.SocketStream.DISCONNECTED) {
            const mode = await page
                .evaluate(() => window?.Store?.Stream?.mode)
                .catch(() => { });
            if (mode === index_js_1.InterfaceMode.QR
            // && checkFileJson(mergedOptions, session)
            ) {
                if (statusFind) {
                    (0, logger_js_1.logInfo)('Checking...');
                    statusFind('desconnectedMobile', session);
                    (0, logger_js_1.logFail)('Disconnected by cell phone!');
                }
            }
        }
    })
        .catch();
    client
        .onStateChange(async (state) => {
        if (state === index_js_1.SocketState.PAIRING) {
            const device = await page
                .evaluate(() => {
                if (document.querySelector('[tabindex="-1"]') &&
                    window?.Store?.Stream?.mode === index_js_1.InterfaceMode.SYNCING &&
                    window?.Store?.Stream?.obscurity === 'SHOW') {
                    return true;
                }
                return false;
            })
                .catch(() => undefined);
            if (device === true) {
                if (statusFind) {
                    statusFind('deviceNotConnected', session);
                }
            }
        }
    })
        .catch();
    page.on('dialog', async (dialog) => {
        await dialog.accept();
    });
    if (mergedOptions.waitForLogin) {
        const isLogged = await client
            .waitForLogin(catchQR, statusFind)
            .catch(() => undefined);
        if (statusFind)
            statusFind('waitForLogin', session);
        if (!isLogged) {
            throw new Error('Not Logged');
        }
        let waitLoginPromise = null;
        client
            .onStateChange(async (state) => {
            if (state === index_js_1.SocketState.UNPAIRED ||
                state === index_js_1.SocketState.UNPAIRED_IDLE) {
                if (!waitLoginPromise) {
                    waitLoginPromise = client
                        .waitForLogin(catchQR, statusFind)
                        .then(() => {
                        if (reconnectQrcode) {
                            reconnectQrcode(client);
                        }
                    })
                        .catch(() => { })
                        .finally(() => {
                        waitLoginPromise = null;
                    });
                }
                await waitLoginPromise;
            }
        })
            .catch();
    }
    if (statusFind)
        statusFind('waitChat', session);
    await page.waitForSelector('#app .two', { visible: true }).catch(() => { });
    (0, logger_js_1.logSuccess)('Successfully connected!');
    await client.initService();
    await client.addChatWapi();
    if (statusFind)
        statusFind('successChat', session);
    return client;
}
//# sourceMappingURL=initializer.js.map