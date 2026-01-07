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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileLayer = void 0;
const host_layer_js_1 = require("./host.layer.js");
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const index_js_1 = require("../helpers/index.js");
class ProfileLayer extends host_layer_js_1.HostLayer {
    browser;
    page;
    constructor(browser, page, session, options) {
        super(browser, page, session, options);
        this.browser = browser;
        this.page = page;
    }
    async clearToken() {
        await this.page.evaluate(() => {
            localStorage.clear();
            window.location.reload();
        });
    }
    /**
     * @param contactsId Example: 0000@c.us | [000@c.us, 1111@c.us]
     * @param time duration of silence
     * @param type kind of silence "hours" "minutes" "year"
     * To remove the silence, just enter the contact parameter
     */
    async sendMute(id, time, type) {
        const result = await this.page.evaluate((id, time, type) => WAPI.sendMute(id, time, type), id, time, type);
        if (result['erro'] == true) {
            throw result;
        }
        return result;
    }
    /**
     * Change the theme
     * @param string types "dark" or "light"
     */
    setTheme(type) {
        return this.page.evaluate((type) => WAPI.setTheme(type), type);
    }
    /**
     * Sets current user profile status
     * @param status
     */
    async setProfileStatus(status) {
        return await this.page.evaluate(({ status }) => {
            WAPI.setMyStatus(status);
        }, { status });
    }
    /**
     * Sets the user's current profile photo
     * @param name
     */
    async setProfilePic(path, to) {
        let b64 = await (0, index_js_1.downloadFileToBase64)(path, [
            'image/gif',
            'image/png',
            'image/jpg',
            'image/jpeg',
            'image/webp'
        ]);
        if (!b64) {
            b64 = await (0, index_js_1.fileToBase64)(path);
        }
        if (b64) {
            const buff = Buffer.from(b64.replace(/^data:image\/(png|jpe?g|webp);base64,/, ''), 'base64');
            const mimeInfo = (0, index_js_1.base64MimeType)(b64);
            if (!mimeInfo || mimeInfo.includes('image')) {
                let _webb64_96 = await (0, index_js_1.resizeImg)(buff, { width: 96, height: 96 }), _webb64_640 = await (0, index_js_1.resizeImg)(buff, { width: 640, height: 640 });
                let obj = { a: _webb64_640, b: _webb64_96 };
                return await this.page.evaluate(({ obj, to }) => WAPI.setProfilePic(obj, to), {
                    obj,
                    to
                });
            }
            else {
                console.log('Not an image, allowed formats png, jpeg and webp');
                return false;
            }
        }
    }
    /**
     * Sets current user profile name
     * @param name
     */
    async setProfileName(name) {
        return this.page.evaluate(({ name }) => {
            WAPI.setMyName(name);
        }, { name });
    }
    async delProfile() {
        if (!this.page.isClosed()) {
            await this.page.evaluate(() => WAPI.logout()).catch(() => { });
            await this.page.close().catch(() => { });
            await this.browser.close().catch(() => { });
            const folderSession = path.join(path.resolve(process.cwd(), this.options.mkdirFolderToken, this.options.folderNameToken, this.session));
            if (fs_1.default.existsSync(folderSession)) {
                try {
                    fs_1.default.rmSync(folderSession, {
                        recursive: true,
                        force: true
                    });
                }
                catch {
                    (0, child_process_1.exec)(`rm -Rf ${folderSession}`);
                }
            }
        }
    }
}
exports.ProfileLayer = ProfileLayer;
//# sourceMappingURL=profile.layer.js.map