import { GroupLayer } from './group.layer.js';
import { checkValuesSender } from '../helpers/layers-interface.js';
export class UILayer extends GroupLayer {
    browser;
    page;
    constructor(browser, page, session, options) {
        super(browser, page, session, options);
        this.browser = browser;
        this.page = page;
    }
    /**
     * MouveMouse
     */
    async mouseMove(x, y) {
        await this.page.mouse.move(0, 0);
        await this.page.mouse.down();
        await this.page.mouse.move(0, 100);
        await this.page.mouse.up();
    }
    /**
     * checks and returns whether a message and a reply
     * @param messages
     */
    async returnReply(messages) {
        return await this.page.evaluate(({ messages }) => WAPI.returnReply(messages), {
            messages
        });
    }
    /**
     * Opens given chat at last message (bottom)
     * Will fire natural workflow events of whatsapp web
     * @param chatId
     */
    async openChat(chatId, force) {
        const typeFunction = 'openChat';
        const type = 'string';
        const check = [
            {
                param: 'text',
                type: type,
                value: chatId,
                function: typeFunction,
                isUser: true
            }
        ];
        const validating = checkValuesSender(check);
        if (typeof validating === 'object') {
            throw validating;
        }
        const result = await this.page.evaluate(({ chatId, force }) => WAPI.openChat(chatId, force), { chatId, force });
        if (result['erro'] == true) {
            throw result;
        }
        return result;
    }
    /**
     * Opens chat at given message position
     * @param chatId Chat id
     * @param messageId Message id (For example: '06D3AB3D0EEB9D077A3F9A3EFF4DD030')
     */
    async openChatAt(chatId, messageId) {
        return this.page.evaluate((chatId) => WAPI.openChatAt(chatId, messageId), chatId);
    }
}
//# sourceMappingURL=ui.layer.js.map