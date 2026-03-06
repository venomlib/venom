import { ControlsLayer } from './layers/controls.layer.js';
import { magix, timeout, makeOptions } from './helpers/decrypt.js';
import { useragentOverride } from '../config/WAuserAgente.js';
import axios from 'axios';
import * as path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
// Cross-platform __dirname for CJS/ESM dual builds
// eval hides import.meta from the CJS parser to avoid SyntaxError
const getDirname = () => {
    if (typeof __dirname !== 'undefined') {
        return __dirname;
    }
    // @ts-ignore
    return dirname(fileURLToPath(eval('import.meta.url')));
};
async function checkFileExists(filePath) {
    try {
        await fs.access(filePath, fs.constants.F_OK); // F_OK checks existence
        return true;
    }
    catch (error) {
        // Type the error as NodeJS.ErrnoException if needed for more specifics
        return false;
    }
}
export class Whatsapp extends ControlsLayer {
    browser;
    page;
    constructor(browser, page, session, options) {
        super(browser, page, session, options);
        this.browser = browser;
        this.page = page;
        this.page.on('load', async () => {
            await page
                .waitForSelector('#app .two', { visible: true })
                .catch(() => { });
            await this.initService();
            await this.addChatWapi();
        });
    }
    async initService() {
        try {
            // Allow backwards compatibility without specifying any specific options
            // The assumption is that WA switched away from Webpack at/after 2.3
            // This can be removed when all browsers have rolled over to new non-webpack version
            let useWebpack = false;
            if (this.options.forceWebpack === false &&
                this.options.webVersion === false) {
                const actualWebVersion = await this.page.evaluate(() => {
                    return window['Debug'] && window['Debug'].VERSION
                        ? window['Debug'].VERSION
                        : '';
                });
                const versionNumber = parseFloat(actualWebVersion);
                useWebpack = versionNumber < 2.3;
            }
            if (this.options.forceWebpack === false && !useWebpack) {
                await this.page.evaluate(() => {
                    window['__debug'] = eval("require('__debug');");
                });
            }
            else {
                await this.page
                    .waitForFunction('webpackChunkwhatsapp_web_client.length')
                    .catch();
            }
            let js = '';
            //works differently in dev or production
            if (await checkFileExists(path.join(getDirname(), '../../lib/wapi/', 'wapi.js'))) {
                js = await fs.readFile(path.join(getDirname(), '../../lib/wapi/', 'wapi.js'), 'utf-8');
            }
            else {
                js = await fs.readFile(path.join(process.cwd(), 'node_modules/venom-bot/dist/lib/wapi', 'wapi.js'), 'utf-8');
            }
            await this.page.evaluate(js);
            await this.initialize();
            let middleware_script = '';
            if (await checkFileExists(path.join(getDirname(), '../../lib/middleware/', 'middleware.js'))) {
                middleware_script = await fs.readFile(path.join(getDirname(), '../../lib/middleware', 'middleware.js'), 'utf-8');
            }
            else {
                middleware_script = await fs.readFile(path.join(process.cwd(), 'node_modules/venom-bot/dist/lib/middleware', 'middleware.js'), 'utf-8');
            }
            await this.page.evaluate(middleware_script);
        }
        catch (e) {
            console.log(e);
        }
    }
    async addChatWapi() {
        await this.page.evaluate(() => WAPI.addChatWapi());
    }
    /**
     * Decrypts message file
     * @param data Message object
     * @returns Decrypted file buffer (null otherwise)
     */
    async downloadFile(data) {
        return await this.page.evaluate((data) => WAPI.downloadFile(data), data);
    }
    /**
     * Download and returns the media content in base64 format
     * @param messageId Message ou id
     * @returns Base64 of media
     */
    async downloadMedia(messageId) {
        if (typeof messageId !== 'string') {
            messageId = messageId.id;
        }
        const result = await this.page
            .evaluate((messageId) => WAPI.downloadMedia(messageId).catch((e) => ({
            __error: e
        })), messageId)
            .catch(() => undefined);
        if (typeof result === 'object' && result.__error) {
            throw result.__error;
        }
        return result;
    }
    /**
     * Get the puppeteer page instance
     * @returns The Whatsapp page
     */
    get waPage() {
        return this.page;
    }
    /**
     * Clicks on 'use here' button (When it get unlaunched)
     * This method tracks the class of the button
     * Whatsapp web might change this class name over the time
     * Dont rely on this method
     */
    async useHere() {
        return await this.page.evaluate(() => WAPI.takeOver());
    }
    /**
     * Logout whastapp
     * @returns boolean
     */
    async logout() {
        return await this.page.evaluate(() => WAPI.logout());
    }
    /**
     * Closes page and browser
     * @internal
     */
    async close() {
        try {
            if (!this.page.isClosed()) {
                await this.page.close();
                await this.browser.close();
                return true;
            }
        }
        catch (e) {
            return false;
        }
    }
    /**
     * Get message by id
     * @param messageId string
     * @returns Message object
     */
    async getMessageById(messageId) {
        return (await this.page.evaluate((messageId) => WAPI.getMessageById(messageId), messageId));
    }
    /**
     * Decrypts message file
     * @param message Message object
     * @returns Decrypted file buffer (null otherwise)
     */
    async decryptFile(message) {
        const options = makeOptions(useragentOverride);
        message.clientUrl =
            message.clientUrl !== undefined
                ? message.clientUrl
                : message.deprecatedMms3Url;
        if (!message.clientUrl) {
            throw new Error('message is missing critical data needed to download the file.');
        }
        let haventGottenImageYet = true, res;
        try {
            while (haventGottenImageYet) {
                res = await axios.get(message.clientUrl.trim(), options);
                if (res.status == 200) {
                    haventGottenImageYet = false;
                }
                else {
                    await timeout(2000);
                }
            }
        }
        catch (error) {
            console.error(error);
            throw 'Error trying to download the file.';
        }
        const buff = Buffer.from(res.data, 'binary');
        return magix(buff, message.mediaKey, message.type, message.size);
    }
}
//# sourceMappingURL=whatsapp.js.map