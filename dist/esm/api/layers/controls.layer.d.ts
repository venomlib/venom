import { Page, Browser } from 'puppeteer';
import { CreateConfig } from '../../config/create-config.js';
import { UILayer } from './ui.layer.js';
export declare class ControlsLayer extends UILayer {
    browser: Browser;
    page: Page;
    constructor(browser: Browser, page: Page, session?: string, options?: CreateConfig);
    /**
     * Unblock contact
     * @param contactId {string} id '000000000000@c.us'
     * @returns boolean
     */
    unblockContact(contactId: string): Promise<boolean>;
    /**
     * Block contact
     * @param contactId {string} id '000000000000@c.us'
     * @returns boolean
     */
    blockContact(contactId: string): Promise<boolean>;
    /**
     * Mark unread chat
     * @param contactId {string} id '000000000000@c.us'
     * @returns bollean
     */
    markUnseenMessage(contactId: string): Promise<boolean>;
    /**
     * Mark chat as read ✔️✔️
     * @param contactId {string} id '000000000000@c.us'
     * @returns boolean
     */
    markMarkSeenMessage(contactId: string): Promise<boolean>;
    /**
     * Deletes the given chat
     * @param chatId {string} id '000000000000@c.us'
     * @returns boolean
     */
    deleteChat(chatId: string): Promise<boolean>;
    /**
     * Archive and unarchive chat messages with true or false
     * @param chatId {string} id '000000000000@c.us'
     * @param option {boolean} true or false
     * @returns boolean
     */
    archiveChat(chatId: string, option: boolean): Promise<boolean>;
    /**
     * Pin and Unpin chat messages with true or false
     * @param chatId {string} id '000000000000@c.us'
     * @param option {boolean} true or false
     * @param nonExistent {boolean} Pin chat, non-existent (optional)
     * @returns object
     */
    pinChat(chatId: string, option: boolean, nonExistent?: boolean): Promise<object>;
    /**
     * Deletes all messages of given chat
     * @param chatId
     * @returns boolean
     */
    clearChatMessages(chatId: string): Promise<void>;
    /**
     * Deletes message of given message id
     * @param chatId The chat id from which to delete the message.
     * @param messageId The specific message id of the message to be deleted
     */
    deleteMessage(chatId: string, messageId: string[]): Promise<object>;
    /**
     * Archive and unarchive chat messages with true or false
     * @param chatId {string} id '000000000000@c.us'
     * @param option {boolean} true or false
     * @returns boolean
     */
    setMessagesAdminsOnly(chatId: string, option: boolean): Promise<boolean>;
    reload(): Promise<void>;
}
