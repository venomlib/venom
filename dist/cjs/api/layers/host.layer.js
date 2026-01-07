"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HostLayer = void 0;
const create_config_js_1 = require("../../config/create-config.js");
const index_js_1 = require("../helpers/index.js");
const auth_js_1 = require("../../controllers/auth.js");
const sleep_js_1 = require("../../utils/sleep.js");
const logger_js_1 = require("../../utils/logger.js");
class HostLayer {
    browser;
    page;
    session;
    options;
    spinStatus = {
        apiInject: '',
        autoCloseRemain: 0,
        state: ''
    };
    autoCloseInterval = null;
    statusFind = null;
    constructor(browser, page, session, options) {
        this.browser = browser;
        this.page = page;
        this.session = session;
        this.options = { ...create_config_js_1.defaultOptions, ...options };
        // this.spin('Initializing...', 'spinning');
        //this._initialize(this.page);
    }
    log(text, status = 'info') {
        const fullText = `[instance: ${this.session}]: ${text}`;
        if (status === 'success') {
            (0, logger_js_1.logSuccess)(fullText);
        }
        else if (status === 'fail') {
            (0, logger_js_1.logFail)(fullText);
        }
        else {
            (0, logger_js_1.logInfo)(fullText);
        }
    }
    // public async _initialize(page: Page) {
    //   this.spinStatus.apiInject = 'injecting';
    //   await injectApi(page)
    //     .then(() => {
    //       this.spinStatus.apiInject = 'injected';
    //     })
    //     .catch(() => {
    //       this.spinStatus.apiInject = 'failed';
    //     });
    // }
    tryAutoClose() {
        if (this.options.autoClose > 0 &&
            !this.autoCloseInterval &&
            !this.page.isClosed()) {
            if (this.statusFind)
                this.statusFind('autocloseCalled', this.session);
            this.page.close().catch(() => { });
            this.browser.close().catch(() => { });
        }
    }
    startAutoClose() {
        if (this.options.autoClose > 0 && !this.autoCloseInterval) {
            let remain = this.options.autoClose;
            try {
                this.autoCloseInterval = setInterval(() => {
                    if (this.page.isClosed()) {
                        this.cancelAutoClose();
                        return;
                    }
                    remain -= 1000;
                    this.spinStatus.autoCloseRemain = Math.round(remain / 1000);
                    if (remain <= 0) {
                        this.cancelAutoClose();
                        this.tryAutoClose();
                    }
                }, 1000);
            }
            catch (e) { }
        }
    }
    cancelAutoClose() {
        clearInterval(this.autoCloseInterval);
        this.autoCloseInterval = null;
    }
    async getQrCode() {
        let qrResult;
        qrResult = await (0, index_js_1.scrapeImg)(this.page).catch((e) => console.log(e));
        if (!qrResult || !qrResult.urlCode) {
            qrResult = await (0, auth_js_1.retrieveQR)(this.page).catch((e) => console.log(e));
        }
        return qrResult;
    }
    async waitForQrCodeScan(catchQR) {
        let urlCode = null;
        let attempt = 0;
        while (true) {
            let needsScan = await (0, auth_js_1.needsToScan)(this.page).catch(() => null);
            if (!needsScan) {
                break;
            }
            const result = await this.getQrCode().catch(() => null);
            if (!result.urlCode) {
                break;
            }
            if (urlCode !== result.urlCode) {
                urlCode = result.urlCode;
                attempt++;
                let qr = '';
                if (this.options.logQR || catchQR) {
                    qr = await (0, auth_js_1.asciiQr)(urlCode).catch(() => undefined);
                }
                if (this.options.logQR) {
                    console.log(qr);
                }
                else {
                    this.log(`Waiting for QRCode Scan: Attempt ${attempt}`);
                }
                if (catchQR) {
                    catchQR(result.base64Image, qr, attempt, result.urlCode);
                }
            }
            await (0, sleep_js_1.sleep)(200).catch(() => undefined);
        }
    }
    async waitForInChat() {
        let inChat = await (0, auth_js_1.isInsideChats)(this.page);
        while (inChat === false) {
            await (0, sleep_js_1.sleep)(200);
            inChat = await (0, auth_js_1.isInsideChats)(this.page);
        }
        return inChat;
    }
    async waitForLogin(catchQR, statusFind) {
        this.statusFind = statusFind;
        this.log('Waiting page load');
        this.log('Checking is logged...');
        let authenticated = await (0, auth_js_1.isAuthenticated)(this.page).catch(() => null);
        if (typeof authenticated === 'object' && authenticated.type) {
            this.log(`Error http: ${authenticated.type}`, 'fail');
            this.page.close().catch(() => { });
            this.browser.close().catch(() => { });
            throw `Error http: ${authenticated.type}`;
        }
        this.startAutoClose();
        if (authenticated === false) {
            this.log('Waiting for QRCode Scan...');
            if (this.statusFind)
                statusFind('notLogged', this.session);
            await this.waitForQrCodeScan(catchQR).catch(() => undefined);
            this.log('Checking QRCode status...');
            // Wait for interface update
            await (0, sleep_js_1.sleep)(200);
            authenticated = await (0, auth_js_1.isAuthenticated)(this.page).catch(() => null);
            if (authenticated === null || JSON.stringify(authenticated) === '{}') {
                this.log('Failed to authenticate');
                if (this.statusFind)
                    statusFind('qrReadFail', this.session);
            }
            else if (authenticated) {
                this.log('QRCode Success', 'success');
                if (this.statusFind)
                    statusFind('qrReadSuccess', this.session);
            }
            else {
                this.log('QRCode Fail', 'fail');
                if (this.statusFind)
                    statusFind('qrReadFail', this.session);
                this.cancelAutoClose();
                this.tryAutoClose();
                throw 'Failed to read the QRCode';
            }
        }
        else if (authenticated === true) {
            this.log('Authenticated', 'success');
            if (this.statusFind)
                statusFind('isLogged', this.session);
        }
        if (authenticated === true) {
            // Reinicia o contador do autoclose
            this.cancelAutoClose();
            this.startAutoClose();
            // Wait for interface update
            await (0, sleep_js_1.sleep)(200);
            this.log('Checking phone is connected...');
            const inChat = await this.waitForInChat();
            if (!inChat) {
                this.log('Phone not connected', 'fail');
                if (this.statusFind)
                    statusFind('phoneNotConnected', this.session);
                this.cancelAutoClose();
                this.tryAutoClose();
                throw new Error('Phone not connected');
            }
            this.cancelAutoClose();
            this.log('Connected', 'success');
            //   statusFind && statusFind('inChat', this.session);
            return true;
        }
        if (authenticated === false) {
            this.cancelAutoClose();
            this.tryAutoClose();
            this.log('Not logged', 'fail');
            throw new Error('Not logged');
        }
        this.cancelAutoClose();
        this.tryAutoClose();
        this.log('Unknown error', 'fail');
    }
    //Pro
    /**
     * Set offline
     */
    async setPresenceOffline() {
        return await this.page.evaluate(() => WAPI.setPresenceOffline());
    }
    //Pro
    /**
     * Set online
     */
    async setPresenceOnline() {
        return await this.page.evaluate(() => WAPI.setPresenceOnline());
    }
    /**
     * Delete the Service Workers
     */
    async killServiceWorker() {
        return await this.page.evaluate(() => WAPI.killServiceWorker());
    }
    /**
     * Load the service again
     */
    async restartService() {
        return await this.page.evaluate(() => WAPI.restartService());
    }
    /**
     * @returns Current host device details
     */
    async getHostDevice() {
        return await this.page.evaluate(() => WAPI.getHost());
    }
    /**
     * Retrieves WA version
     */
    async getWAVersion() {
        return await this.page.evaluate(() => WAPI.getWAVersion());
    }
    /**
     * Retrieves the connecction state
     */
    async getConnectionState() {
        return await this.page.evaluate(() => {
            //@ts-ignore
            return Store.State.Socket.state;
        });
    }
    /**
     * Retrieves if the phone is online. Please note that this may not be real time.
     */
    async isConnected() {
        return await this.page.evaluate(() => WAPI.isConnected());
    }
    /**
     * Retrieves if the phone is online. Please note that this may not be real time.
     */
    async isLoggedIn() {
        return await this.page.evaluate(() => WAPI.isLoggedIn());
    }
    /**
     * Retrieves information about the host including who is logged in
     */
    async getHost() {
        return await this.page.evaluate(() => WAPI.getHost());
    }
    /**
     * Retrieves Battery Level
     */
    async getBatteryLevel() {
        return await this.page.evaluate(() => WAPI.getBatteryLevel());
    }
}
exports.HostLayer = HostLayer;
//# sourceMappingURL=host.layer.js.map