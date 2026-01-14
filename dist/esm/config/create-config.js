import { puppeteerConfig } from './puppeteer.config.js';
export const defaultOptions = {
    folderNameToken: 'tokens',
    mkdirFolderToken: '',
    headless: 'old',
    devtools: false,
    debug: false,
    logQR: true,
    browserWS: '',
    browserArgs: puppeteerConfig.chromiumArgs,
    addBrowserArgs: [],
    puppeteerOptions: {},
    logger: null,
    disableWelcome: true,
    updatesLog: true,
    autoClose: 120000,
    createPathFileToken: true,
    waitForLogin: true,
    BrowserFetcher: true,
    forceConnect: false,
    attemptsForceConnectLoad: 5,
    forceConnectTime: 5000,
    addProxy: [],
    browserPathExecutable: null,
    forceWebpack: false,
    webVersion: false
};
//# sourceMappingURL=create-config.js.map