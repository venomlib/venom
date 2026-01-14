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
exports.SenderLayer = void 0;
const path = __importStar(require("path"));
const helpers_1 = require("../helpers");
const filename_from_mimetype_js_1 = require("../helpers/filename-from-mimetype.js");
const layers_interface_js_1 = require("../helpers/layers-interface.js");
const listener_layer_js_1 = require("./listener.layer.js");
class SenderLayer extends listener_layer_js_1.ListenerLayer {
    browser;
    page;
    constructor(browser, page, session, options) {
        super(browser, page, session, options);
        this.browser = browser;
        this.page = page;
    }
    async createCommunity(name, description) {
        return await this.page.evaluate(({ name, description }) => {
            return WAPI.createCommunity(name, description);
        }, { name, description });
    }
    /**
     * Send List menu
     * @param to the numberid xxx@c.us
     * @param title the titulo
     * @param subTitle
     * @param description the description
     * @param buttonText the name button
     * @param menu List menu
     */
    async sendListMenu(to, title, subTitle, description, buttonText, menu) {
        const result = await this.page.evaluate(({ to, title, subTitle, description, buttonText, menu }) => {
            return WAPI.sendListMenu(to, title, subTitle, description, buttonText, menu);
        }, { to, title, subTitle, description, buttonText, menu });
        if (result['erro'] == true) {
            throw result;
        }
        return result;
    }
    //*PRO_
    /**
     * Send status text
     * @param text The text for the status
     */
    async sendStatusText(text) {
        const typeFunction = 'sendText';
        const type = 'string';
        const check = [
            {
                param: 'text',
                type: type,
                value: text,
                function: typeFunction,
                isUser: true
            }
        ];
        const validating = (0, layers_interface_js_1.checkValuesSender)(check);
        if (typeof validating === 'object') {
            throw validating;
        }
        const to = 'status@broadcast';
        const result = await this.page.evaluate(({ to, text }) => {
            return WAPI.sendMessage(to, text, true);
        }, { to, text });
        if (result['erro'] == true) {
            throw result;
        }
        return result;
    }
    /**
     * Create poll
     * @param idUser chat id: xxxxx@us.c
     * @param poll
     */
    async sendPollCreation(idUser, poll) {
        const result = await this.page.evaluate(({ idUser, poll }) => {
            return WAPI.sendPollCreation(idUser, poll);
        }, { idUser, poll });
        if (result['erro'] == true) {
            throw result;
        }
        return result;
    }
    //*PRO_
    /**
     * @param filePath path, http link or base64Encoded
     * @param description
     */
    async sendImageStatus(filePath, description) {
        let base64 = await (0, helpers_1.downloadFileToBase64)(filePath, [
            'image/gif',
            'image/png',
            'image/jpg',
            'image/jpeg',
            'image/webp'
        ]);
        if (!base64) {
            base64 = await (0, helpers_1.fileToBase64)(filePath);
        }
        if (!base64) {
            throw {
                erro: true,
                to: 'status',
                text: 'No such file or directory, open "' + filePath + '"'
            };
        }
        let filename = path.basename(filePath);
        let mimeType = (0, helpers_1.base64MimeType)(base64);
        if (!mimeType) {
            throw {
                erro: true,
                to: 'status',
                text: 'Invalid base64!'
            };
        }
        if (!mimeType.includes('image')) {
            throw {
                erro: true,
                to: 'status',
                text: 'Not an image, allowed formats gif, png, jpg, jpeg and webp'
            };
        }
        const to = 'status@broadcast';
        filename = (0, filename_from_mimetype_js_1.filenameFromMimeType)(filename, mimeType);
        const result = await this.page.evaluate(({ to, base64, filename, description }) => {
            return WAPI.sendImage(base64, to, filename, description, 'sendImageStatus');
        }, { to, base64, filename, description });
        if (result['erro'] == true) {
            throw result;
        }
        return result;
    }
    /**
     * Sends file from path
     * @param filePath File path
     * @param description
     */
    async sendVideoStatus(filePath, description) {
        let base64 = await (0, helpers_1.downloadFileToBase64)(filePath, ['video/mp4']);
        if (!base64) {
            base64 = await (0, helpers_1.fileToBase64)(filePath);
        }
        if (!base64) {
            throw {
                erro: true,
                to: 'status',
                text: 'No such file or directory, open "' + filePath + '"'
            };
        }
        let filename = path.basename(filePath);
        let mimeType = (0, helpers_1.base64MimeType)(base64);
        if (!mimeType) {
            throw {
                erro: true,
                to: 'status',
                text: 'Invalid base64!'
            };
        }
        if (!mimeType.includes('video')) {
            throw {
                erro: true,
                to: 'status',
                text: 'Not an video, allowed format mp4'
            };
        }
        filename = (0, filename_from_mimetype_js_1.filenameFromMimeType)(filename, mimeType);
        const to = 'status@broadcast';
        const result = await this.page.evaluate(({ to, base64, filename, description }) => {
            return WAPI.sendFile(base64, to, filename, description, 'sendVideoStatus', true);
        }, { to, base64, filename, description });
        if (result['erro'] == true) {
            throw result;
        }
        return result;
    }
    /**
     * Sends a text message to given chat
     * @param to chat id: xxxxx@us.c
     * @param title
     * @param subtitle
     * @param buttons
     */
    async sendButtons(to, title, subtitle, buttons) {
        const typeFunction = 'sendButtons';
        const type = 'string';
        const obj = 'object';
        const check = [
            {
                param: 'to',
                type: type,
                value: to,
                function: typeFunction,
                isUser: true
            },
            {
                param: 'title',
                type: type,
                value: title,
                function: typeFunction,
                isUser: true
            },
            {
                param: 'subtitle',
                type: type,
                value: subtitle,
                function: typeFunction,
                isUser: true
            },
            {
                param: 'buttons',
                type: obj,
                value: buttons,
                function: typeFunction,
                isUser: true
            }
        ];
        const validating = (0, layers_interface_js_1.checkValuesSender)(check);
        if (typeof validating === 'object') {
            throw validating;
        }
        const result = await this.page.evaluate(({ to, title, subtitle, buttons }) => {
            return WAPI.sendButtons(to, title, subtitle, buttons);
        }, { to, title, subtitle, buttons });
        if (result['erro'] == true) {
            throw result;
        }
        return result;
    }
    async sendTypeButtons(to, title, subtitle, footer, buttons) {
        const result = await this.page.evaluate(({ to, title, subtitle, footer, buttons }) => {
            return WAPI.sendTypeButtons(to, title, subtitle, footer, buttons);
        }, { to, title, subtitle, footer, buttons });
        if (result['erro'] == true) {
            throw result;
        }
        return result;
    }
    /**
     * Sends a text message to given chat
     * @param to chat id: xxxxx@us.c
     * @param content text message
     * @param passId new id
     * @param checkNumber the number when submitting!
     * @param forcingReturn return without sending the message to the server!
     * @param delSend
     */
    async sendText(to, content, passId, checkNumber, forcingReturn, delSend) {
        const typeFunction = 'sendText';
        const type = 'string';
        const check = [
            {
                param: 'to',
                type: type,
                value: to,
                function: typeFunction,
                isUser: true
            },
            {
                param: 'content',
                type: type,
                value: content,
                function: typeFunction,
                isUser: true
            }
        ];
        const validating = (0, layers_interface_js_1.checkValuesSender)(check);
        if (typeof validating === 'object') {
            throw validating;
        }
        const result = await this.page.evaluate(({ to, content, passId, checkNumber, forcingReturn, delSend }) => {
            return WAPI.sendMessage(to, content, undefined, passId, checkNumber, forcingReturn, delSend);
        }, { to, content, passId, checkNumber, forcingReturn, delSend });
        if (result['erro'] == true) {
            throw result;
        }
        return result;
    }
    /**
     * Automatically sends a link with the auto generated link preview. You can also add a custom message to be added.
     * @param chatId chat id: xxxxx@us.c
     * @param url string A link, for example for youtube. e.g https://www.youtube.com/watch?v=Zi_XLOBDo_Y&list=RDEMe12_MlgO8mGFdeeftZ2nOQ&start_radio=1
     * @param title custom text as the message body, this includes the link or will be attached after the link
     * @param message
     */
    async sendLinkPreview(chatId, url, title, message) {
        const typeFunction = 'sendLinkPreview';
        const type = 'string';
        const check = [
            {
                param: 'chatId',
                type: type,
                value: chatId,
                function: typeFunction,
                isUser: true
            },
            {
                param: 'url',
                type: type,
                value: url,
                function: typeFunction,
                isUser: true
            },
            {
                param: 'title',
                type: type,
                value: title,
                function: typeFunction,
                isUser: false
            },
            {
                param: 'message',
                type: type,
                value: message,
                function: typeFunction,
                isUser: false
            }
        ];
        const validating = (0, layers_interface_js_1.checkValuesSender)(check);
        if (typeof validating === 'object') {
            throw validating;
        }
        const thumbnail = await (0, helpers_1.dowloadMetaFileBase64)(url);
        const result = await this.page.evaluate(({ chatId, url, title, message, thumbnail }) => {
            return WAPI.sendLinkPreview(chatId, url, title, message, thumbnail);
        }, { chatId, url, title, message, thumbnail });
        if (result['erro'] == true) {
            throw result;
        }
        return result;
    }
    /**
     * Sends image message base64
     * @param to Chat id
     * @param base64 File path, http link or base64Encoded
     * @param filename
     * @param caption
     * @param status
     */
    async sendImageFromBase64(to, base64, filename, caption, status) {
        const typeFunction = 'sendImageFromBase64';
        const type = 'string';
        const check = [
            {
                param: 'to',
                type: type,
                value: to,
                function: typeFunction,
                isUser: true
            },
            {
                param: 'base64',
                type: type,
                value: base64,
                function: typeFunction,
                isUser: true
            },
            {
                param: 'filename',
                type: type,
                value: filename,
                function: typeFunction,
                isUser: false
            }
        ];
        const validating = (0, layers_interface_js_1.checkValuesSender)(check);
        if (typeof validating === 'object') {
            throw validating;
        }
        let mimeType = (0, helpers_1.base64MimeType)(base64);
        if (!mimeType) {
            throw {
                erro: true,
                to: to,
                text: 'Invalid base64!'
            };
        }
        if (!mimeType.includes('image')) {
            throw {
                erro: true,
                to: to,
                text: 'Not an image, allowed formats gif, png, jpg, jpeg and webp'
            };
        }
        filename = (0, filename_from_mimetype_js_1.filenameFromMimeType)(filename, mimeType);
        const result = await this.page.evaluate(({ to, base64, filename, caption, status }) => {
            return WAPI.sendImage(base64, to, filename, caption, status);
        }, { to, base64, filename, caption, status });
        if (result['erro'] == true) {
            throw result;
        }
        return result;
    }
    /**
     * only admin send messages
     * @param chatId Group
     * @param {boolean} type 'true' only admin can send messages or 'false' everyone can send
     */
    async onlySendAdmin(chatId, type) {
        const result = await this.page
            .evaluate(({ chatId, type }) => {
            return WAPI.onlySendAdmin(chatId, type);
        }, { chatId, type })
            .catch(() => { });
        if (result?.erro == true) {
            throw result;
        }
        return result;
    }
    async sendMessageOptions(chat, content, options) {
        const messageId = await this.page.evaluate(({ chat, content, options }) => {
            return WAPI.sendMessageOptions(chat, content, options);
        }, { chat, content, options });
        return (await this.page.evaluate((messageId) => WAPI.getMessageById(messageId), messageId));
    }
    /**
     * Sends image message
     * @param to Chat id
     * @param filePath File path or http link
     * @param filename
     * @param caption
     * @param passId
     */
    async sendImage(to, filePath, filename, caption, passId) {
        let base64 = await (0, helpers_1.downloadFileToBase64)(filePath, [
            'image/gif',
            'image/png',
            'image/jpg',
            'image/jpeg',
            'image/webp'
        ]);
        if (!base64) {
            base64 = await (0, helpers_1.fileToBase64)(filePath);
        }
        if (!base64) {
            throw {
                erro: true,
                to: to,
                text: 'No such file or directory, open "' + filePath + '"'
            };
        }
        if (!filename) {
            filename = path.basename(filePath);
        }
        let mimeType = (0, helpers_1.base64MimeType)(base64);
        if (!mimeType) {
            throw {
                erro: true,
                to: to,
                text: 'Invalid base64!'
            };
        }
        if (!mimeType.includes('image')) {
            throw {
                erro: true,
                to: to,
                text: 'Not an image, allowed formats gif, png, jpg, jpeg and webp'
            };
        }
        filename = (0, filename_from_mimetype_js_1.filenameFromMimeType)(filename, mimeType);
        const result = await this.page.evaluate(({ to, base64, filename, caption, passId }) => {
            return WAPI.sendImage(base64, to, filename, caption, 'sendImage', false, passId);
        }, { to, base64, filename, caption, passId });
        if (result['erro'] == true) {
            throw result;
        }
        return result;
    }
    /**
     * Sends message with thumbnail
     * @param thumb
     * @param url
     * @param title
     * @param description
     * @param chatId
     */
    async sendMessageWithThumb(thumb, url, title, description, chatId) {
        return await this.page.evaluate(({ thumb, url, title, description, chatId }) => {
            WAPI.sendMessageWithThumb(thumb, url, title, description, chatId);
        }, {
            thumb,
            url,
            title,
            description,
            chatId
        });
    }
    /**
     * Replies to given mesage id of given chat id
     * @param to Chat id
     * @param content Message body
     * @param quotedMsg Message id to reply to.
     */
    async reply(to, content, quotedMsg) {
        const typeFunction = 'reply';
        const type = 'string';
        const check = [
            {
                param: 'to',
                type: type,
                value: to,
                function: typeFunction,
                isUser: true
            },
            {
                param: 'content',
                type: type,
                value: content,
                function: typeFunction,
                isUser: true
            },
            {
                param: 'quotedMsg',
                type: type,
                value: quotedMsg,
                function: typeFunction,
                isUser: false
            }
        ];
        const validating = (0, layers_interface_js_1.checkValuesSender)(check);
        if (typeof validating === 'object') {
            throw validating;
        }
        const result = await this.page.evaluate(({ to, content, quotedMsg }) => {
            return WAPI.reply(to, content, quotedMsg);
        }, { to, content, quotedMsg });
        if (result['erro'] == true) {
            throw result;
        }
        return result;
    }
    /**
     * Send audio base64
     * @param to Chat id
     * @param base64 base64 data
     * @param passId new id
     */
    async sendVoiceBase64(to, base64, passId) {
        const mimeType = (0, helpers_1.base64MimeType)(base64);
        if (!mimeType) {
            throw {
                erro: true,
                to: to,
                text: 'Invalid base64!'
            };
        }
        if (!mimeType ||
            mimeType.includes('audio/mpeg') ||
            mimeType.includes('audio/mp3') ||
            mimeType.includes('audio/ogg')) {
            const result = await this.page.evaluate(({ to, base64, passId }) => {
                return WAPI.sendPtt(base64, to, passId);
            }, { to, base64, passId });
            if (result['erro'] == true) {
                throw result;
            }
            return result;
        }
        else {
            throw {
                erro: true,
                to: to,
                text: 'Use the MP3 format to be able to send an audio!'
            };
        }
    }
    /**
     * Send audio file
     * @param to Chat id
     * @param filePath Path file
     * @param passId new id
     * @param checkNumber the number when submitting!
     * @param forcingReturn return without sending the message to the server!
     * @param delSend
     */
    async sendVoice(to, filePath, passId, checkNumber, forcingReturn, delSend) {
        let base64 = await (0, helpers_1.downloadFileToBase64)(filePath, [
            'audio/mpeg',
            'audio/mp3',
            'audio/ogg'
        ]);
        if (!base64) {
            base64 = await (0, helpers_1.fileToBase64)(filePath);
        }
        if (!base64) {
            throw {
                erro: true,
                to: to,
                text: 'No such file or directory, open "' + filePath + '"'
            };
        }
        const mimeInfo = (0, helpers_1.base64MimeType)(base64);
        if (!mimeInfo ||
            mimeInfo.includes('audio/mpeg') ||
            mimeInfo.includes('audio/mp3') ||
            mimeInfo.includes('audio/ogg')) {
            const result = await this.page.evaluate(({ to, base64, passId, checkNumber, forcingReturn, delSend }) => {
                return WAPI.sendPtt(base64, to, passId, checkNumber, forcingReturn, delSend);
            }, { to, base64, passId, checkNumber, forcingReturn, delSend });
            if (result['erro'] == true) {
                throw result;
            }
            return result;
        }
        else {
            throw {
                erro: true,
                to: to,
                text: 'Use the MP3 format to be able to send an audio!'
            };
        }
    }
    /**
     * Sends file
     * base64 parameter should have mime type already defined
     * @param to Chat id
     * @param base64 base64 data
     * @param filename
     * @param caption
     * @param passId
     */
    async sendFileFromBase64(to, base64, filename, caption, passId) {
        let mimeType = (0, helpers_1.base64MimeType)(base64);
        if (!mimeType) {
            throw {
                erro: true,
                to: to,
                text: 'Invalid base64!'
            };
        }
        filename = (0, filename_from_mimetype_js_1.filenameFromMimeType)(filename, mimeType);
        const type = 'FileFromBase64';
        const result = await this.page.evaluate(({ to, base64, filename, caption, type, passId }) => {
            return WAPI.sendFile(base64, to, filename, caption, type, undefined, passId);
        }, { to, base64, filename, caption, type, passId });
        if (result['erro'] == true) {
            throw result;
        }
        return result;
    }
    /**
     * Sends file from path
     * @param to Chat id
     * @param filePath File path
     * @param filename
     * @param caption
     * @param passId
     * @param checkNumber
     * @param forcingReturn
     * @param delSend
     */
    async sendFile(to, filePath, filename, caption, passId, checkNumber, forcingReturn, delSend) {
        let base64 = await (0, helpers_1.downloadFileToBase64)(filePath);
        if (!base64) {
            base64 = await (0, helpers_1.fileToBase64)(filePath);
        }
        if (!base64) {
            throw {
                erro: true,
                to: to,
                text: 'No such file or directory, open "' + filePath + '"'
            };
        }
        if (!filename && typeof filename !== 'string') {
            filename = path.basename(filePath);
        }
        let mimeType = (0, helpers_1.base64MimeType)(base64);
        if (!mimeType) {
            throw {
                erro: true,
                to: to,
                text: 'Invalid base64!'
            };
        }
        filename = (0, filename_from_mimetype_js_1.filenameFromMimeType)(filename, mimeType);
        const result = await this.page.evaluate(({ to, base64, filename, caption, passId, checkNumber, forcingReturn, delSend }) => {
            return WAPI.sendFile(base64, to, filename, caption, 'sendFile', undefined, passId, checkNumber, forcingReturn, delSend);
        }, {
            to,
            base64,
            filename,
            caption,
            passId,
            checkNumber,
            forcingReturn,
            delSend
        });
        if (result['erro'] == true) {
            throw result;
        }
        return result;
    }
    /**
     * Sends a video to given chat as a gif, with caption or not, using base64
     * @param to chat id xxxxx@us.c
     * @param path
     * @param filename string xxxxx
     * @param caption string xxxxx
     */
    async sendVideoAsGif(to, path, filename, caption) {
        const base64 = await (0, helpers_1.fileToBase64)(path);
        if (base64) {
            return this.sendVideoAsGifFromBase64(to, base64, filename, caption);
        }
    }
    /**
     * Sends a video to given chat as a gif, with caption or not, using base64
     * @param to chat id xxxxx@us.c
     * @param base64 base64 data:video/xxx;base64,xxx
     * @param filename string xxxxx
     * @param caption string xxxxx
     */
    async sendVideoAsGifFromBase64(to, base64, filename, caption) {
        return await this.page.evaluate(({ to, base64, filename, caption }) => {
            WAPI.sendVideoAsGif(base64, to, filename, caption);
        }, { to, base64, filename, caption });
    }
    /**
     * Sends contact card to iven chat id
     * @param to Chat id
     * @param contactsId Example: 0000@c.us | [000@c.us, 1111@c.us]
     * @param name
     */
    async sendContactVcard(to, contactsId, name) {
        const result = await this.page.evaluate(({ to, contactsId, name }) => {
            return WAPI.sendContactVcard(to, contactsId, name);
        }, { to, contactsId, name });
        if (result['erro'] == true) {
            throw result;
        }
        return result;
    }
    /**
     * Send a list of contact cards
     * @param to Chat id
     * @param contacts Example: | [000@c.us, 1111@c.us]
     */
    async sendContactVcardList(to, contacts) {
        const result = await this.page.evaluate(({ to, contacts }) => {
            return WAPI.sendContactVcardList(to, contacts);
        }, { to, contacts });
        if (result['erro'] == true) {
            throw result;
        }
        return result;
    }
    /**
     * Forwards array of messages (could be ids or message objects)
     * @param to Chat id
     * @param messages Array of messages ids to be forwarded
     * @param skipMyMessages
     */
    async forwardMessages(to, messages, skipMyMessages) {
        const result = await this.page.evaluate(({ to, messages, skipMyMessages }) => {
            return WAPI.forwardMessages(to, messages, skipMyMessages).catch((e) => e);
        }, { to, messages, skipMyMessages });
        if (typeof result['erro'] !== 'undefined' && result['erro'] == true) {
            throw result;
        }
        return result;
    }
    /**
     * Generates sticker from the provided animated gif image and sends it (Send image as animated sticker)
     *  @param path image path imageBase64 A valid gif image is required. You can also send via http/https (http://www.website.com/img.gif)
     *  @param to chatId '000000000000@c.us'
     */
    async sendImageAsStickerGif(to, path) {
        let b64 = await (0, helpers_1.downloadFileToBase64)(path, ['image/gif', 'image/webp']);
        if (!b64) {
            b64 = await (0, helpers_1.fileToBase64)(path);
        }
        if (b64) {
            const buff = Buffer.from(b64.replace(/^data:image\/(gif|webp);base64,/, ''), 'base64');
            const mimeInfo = (0, helpers_1.base64MimeType)(b64);
            if (!mimeInfo || mimeInfo.includes('image')) {
                let obj = await (0, helpers_1.stickerSelect)(buff, 1);
                if (typeof obj == 'object') {
                    let _webb64 = obj['webpBase64'];
                    let _met = obj['metadata'];
                    const result = await this.page.evaluate(({ _webb64, to, _met }) => {
                        return WAPI.sendImageAsSticker(_webb64, to, _met, 'StickerGif');
                    }, { _webb64, to, _met });
                    if (result['erro'] == true) {
                        throw result;
                    }
                    return result;
                }
                else {
                    throw {
                        error: true,
                        message: 'Error with sharp library, check the console log'
                    };
                }
            }
            else {
                console.log('Not an image, allowed format gif');
                return false;
            }
        }
    }
    /**
     * Generates sticker from given image and sends it (Send Image As Sticker)
     * @param path image path imageBase64 A valid png, jpg and webp image is required. You can also send via http/https (http://www.website.com/img.gif)
     * @param to chatId '000000000000@c.us'
     */
    async sendImageAsSticker(to, path) {
        let b64 = await (0, helpers_1.downloadFileToBase64)(path, [
            'image/gif',
            'image/png',
            'image/jpg',
            'image/jpeg',
            'image/webp'
        ]);
        if (!b64) {
            b64 = await (0, helpers_1.fileToBase64)(path);
        }
        if (b64) {
            const buff = Buffer.from(b64.replace(/^data:image\/(png|jpe?g|webp|gif);base64,/, ''), 'base64');
            const mimeInfo = (0, helpers_1.base64MimeType)(b64);
            if (!mimeInfo || mimeInfo.includes('image')) {
                let obj = await (0, helpers_1.stickerSelect)(buff, 0);
                if (typeof obj == 'object') {
                    let _webb64 = obj['webpBase64'];
                    let _met = obj['metadata'];
                    const result = await this.page.evaluate(({ _webb64, to, _met }) => {
                        return WAPI.sendImageAsSticker(_webb64, to, _met, 'Sticker');
                    }, { _webb64, to, _met });
                    if (result['erro'] == true) {
                        throw result;
                    }
                    return result;
                }
                else {
                    throw {
                        error: true,
                        message: 'Error with sharp library, check the console log'
                    };
                }
            }
            else {
                console.log('Not an image, allowed formats png, jpeg and webp');
                return false;
            }
        }
    }
    /**
     * TODO: Fix message not being delivered
     * Sends location to given chat id
     * @param to Chat id
     * @param latitude Latitude
     * @param longitude Longitude
     * @param title Text caption
     */
    async sendLocation(to, latitude, longitude, title) {
        const result = await this.page.evaluate(({ to, latitude, longitude, title }) => {
            return WAPI.sendLocation(to, latitude, longitude, title);
        }, { to, latitude, longitude, title });
        if (result['erro'] == true) {
            throw result;
        }
        return result;
    }
    /**
     * Starts typing ('Typing...' state)
     * @param chatId chat id: xxxxx@us.c
     * @param checkNumber the number when submitting!
     */
    async startTyping(chatId, checkNumber) {
        const typeFunction = 'startTyping';
        const type = 'string';
        const check = [
            {
                param: 'chatId',
                type: type,
                value: chatId,
                function: typeFunction,
                isUser: true
            }
        ];
        const validating = (0, layers_interface_js_1.checkValuesSender)(check);
        if (typeof validating === 'object') {
            throw validating;
        }
        const result = await this.page.evaluate(({ chatId, checkNumber }) => WAPI.startTyping(chatId, checkNumber), { chatId, checkNumber });
        if (result['erro'] == true) {
            throw result;
        }
        return result;
    }
    /**
     * Start Recording
     * @param chatId Chat id
     * @param checkNumber the number when submitting!
     */
    async startRecording(chatId, checkNumber) {
        const typeFunction = 'startRecording';
        const type = 'string';
        const check = [
            {
                param: 'chatId',
                type: type,
                value: chatId,
                function: typeFunction,
                isUser: true
            }
        ];
        const validating = (0, layers_interface_js_1.checkValuesSender)(check);
        if (typeof validating === 'object') {
            throw validating;
        }
        const result = await this.page.evaluate(({ chatId, checkNumber }) => WAPI.startRecording(chatId, checkNumber), { chatId, checkNumber });
        if (result['erro'] == true) {
            throw result;
        }
        return result;
    }
    /**
     * Mark Paused
     * @param chatId Chat id
     * @param checkNumber the number when submitting!
     */
    async markPaused(chatId, checkNumber) {
        const typeFunction = 'startRecording';
        const type = 'string';
        const check = [
            {
                param: 'chatId',
                type: type,
                value: chatId,
                function: typeFunction,
                isUser: true
            }
        ];
        const validating = (0, layers_interface_js_1.checkValuesSender)(check);
        if (typeof validating === 'object') {
            throw validating;
        }
        const result = await this.page.evaluate(({ chatId, checkNumber }) => WAPI.markPaused(chatId, checkNumber), { chatId, checkNumber });
        if (result['erro'] == true) {
            throw result;
        }
        return result;
    }
    /**
     * Clear Presence
     * @param chatId Chat id
     */
    async clearPresence(chatId) {
        const typeFunction = 'clearPresence';
        const type = 'string';
        const check = [
            {
                param: 'chatId',
                type: type,
                value: chatId,
                function: typeFunction,
                isUser: true
            }
        ];
        const validating = (0, layers_interface_js_1.checkValuesSender)(check);
        if (typeof validating === 'object') {
            throw validating;
        }
        const result = await this.page.evaluate(({ chatId }) => WAPI.clearPresence(chatId), { chatId });
        if (result['erro'] == true) {
            throw result;
        }
        return result;
    }
    /**
     * Presence Available
     */
    async presenceAvailable() {
        return this.page.evaluate(() => WAPI.presenceAvailable());
    }
    /**
     * Presence Available
     */
    async presenceUnavailable() {
        return this.page.evaluate(() => WAPI.presenceUnavailable());
    }
    /**
     * Sends text with tags
     *
     */
    async sendMentioned(to, message, mentioned) {
        return await this.page.evaluate(({ to, message, mentioned }) => {
            WAPI.sendMessageMentioned(to, message, mentioned);
        }, { to, message, mentioned });
    }
    /**
     * Sets the chat state
     * @param chatState
     * @param chatId
     */
    async setChatState(chatId, chatState) {
        return await this.page.evaluate(({ chatState, chatId }) => {
            return WAPI.sendChatstate(chatState, chatId);
        }, { chatState, chatId });
    }
    async sendReactions(IdMessage, emoji) {
        return await this.page.evaluate(({ IdMessage, emoji }) => {
            WAPI.sendReactions(IdMessage, emoji);
        }, { IdMessage, emoji });
    }
}
exports.SenderLayer = SenderLayer;
//# sourceMappingURL=sender.layer.js.map