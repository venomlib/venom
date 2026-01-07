import { puppeteerConfig } from './puppeteer.config.js';
export const defaultOptions = {
    session: 'name-session',
    folderNameToken: 'tokens',
    disableWelcome: false,
    BrowserFetcher: true,
    updatesLog: true,
    headless: 'old',
    logQR: true,
    devtools: false,
    mkdirFolderToken: '',
    browserWS: '',
    browserArgs: puppeteerConfig.chromiumArgs,
    addBrowserArgs: [],
    autoClose: 120000,
    addProxy: [],
    browserPathExecutable: '',
    forceWebpack: false,
    webVersion: false
};
//# sourceMappingURL=options.js.map