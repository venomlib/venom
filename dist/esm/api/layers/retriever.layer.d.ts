import { Browser, Page } from 'puppeteer';
import { CreateConfig } from '../../config/create-config.js';
import { Chat, WhatsappProfile } from '../model';
import { SenderLayer } from './sender.layer.js';
export declare class RetrieverLayer extends SenderLayer {
    browser: Browser;
    page: Page;
    constructor(browser: Browser, page: Page, session?: string, options?: CreateConfig);
    /**
     * Return messages by dates!
     * @param chatId
     * @param {string} type
     types:
     lowerThan: Return all messages after the date informed;
     higherThan: Return all messages before the date informed;
     equal: Return all messages from the informed date;
     full: Return all messages, with two new stringdate parameters, dateNumeric;
     * @param idateStart
     * @param time
     * @param limit
     */
    getAllMessagesDate(chatId: string, type: string, idateStart: string, time: string, limit: number): Promise<import("../model").Message[]>;
    getNewMessageId(chatId: string): Promise<object>;
    /**
     * Returns a list of mute and non-mute users
     * @param type return type: all, toMute and noMute.
     * @returns obj
     */
    getListMutes(type?: string): Promise<object>;
    /**
     * Returns state connection
     * @returns obj
     */
    getStateConnection(): Promise<string>;
    /**
     * Receive the current theme
     * @returns string light or dark
     */
    getTheme(): Promise<string>;
    /**
     * Receive all blocked contacts
     * @returns array of [0,1,2,3....]
     */
    getBlockList(): Promise<import("../model").Contact[]>;
    /**
     * Retrieves all chats
     * @returns array of [Chat]
     */
    getAllChats(): Promise<Chat[]>;
    /**
     * Retrieves all chats new messages
     * @returns array of [Chat]
     */
    getAllChatsNewMsg(): Promise<Chat[]>;
    /**
     * Retrieves all chats Contacts
     * @returns array of [Chat]
     */
    getAllChatsContacts(): Promise<Chat[]>;
    /**
     * Checks if a number is a valid WA number
     * @returns contact detial as promise
     * @param contactId
     */
    checkNumberStatus(contactId: string): Promise<WhatsappProfile>;
    /**
     * Retrieves all chats with messages
     * @returns array of [Chat]
     */
    getAllChatsWithMessages(withNewMessageOnly?: boolean): Promise<Chat[]>;
    /**
     * Retrieve all contact new messages
     * @returns array of groups
     */
    getChatContactNewMsg(): Promise<Chat[]>;
    /**
     * Retrieves contact detail object of given contact id
     * @param contactId
     * @returns contact detial as promise
     */
    getContact(contactId: string): Promise<import("../model").Contact>;
    /**
     * Retrieves all contacts
     * @returns array of [Contact]
     */
    getAllContacts(): Promise<import("../model").Contact[]>;
    /**
     * Retrieves all chats Transmission list
     * @returns array of [Chat]
     */
    getAllChatsTransmission(): Promise<Chat[]>;
    /**
     * Retrieves chat object of given contact id
     * @param contactId
     * @returns contact detial as promise
     */
    getChatById(contactId: string): Promise<Chat>;
    /**
     * Retrieves chat object of given contact id
     * @param contactId
     * @returns contact detial as promise
     * @deprecated
     */
    getChat(contactId: string): Promise<Chat>;
    /**
     * Retrieves chat picture
     * @param chatId Chat id
     * @returns url of the chat picture or undefined if there is no picture for the chat.
     */
    getProfilePicFromServer(chatId: string): Promise<string>;
    /**
     * Load more messages in chat object from server. Use this in a while loop
     * @param contactId
     * @returns contact detial as promise
     * @deprecated
     */
    loadEarlierMessages(contactId: string): Promise<import("../model").Message[]>;
    /**
     * Retrieves status of given contact
     * @param contactId
     */
    getStatus(contactId: string): Promise<import("../model").ContactStatus>;
    /**
     * Checks if a number is a valid whatsapp number
     * @returns contact detail as promise
     * @param contactId
     */
    getNumberProfile(contactId: string): Promise<object>;
    /**
     * check if it's beta
     * @returns boolean
     */
    isBeta(): Promise<boolean>;
    /**
     * Retrieves all undread Messages
     */
    getUnreadMessages(unread?: boolean): Promise<any>;
    /**
     * Retrieves all messages already loaded in a chat
     * For loading every message use loadAndGetAllMessagesInChat
     * @param chatId
     * @param includeMe
     * @param includeNotifications
     * @returns any
     */
    getAllMessagesInChat(chatId: string, includeMe: boolean, includeNotifications: boolean): Promise<import("../model").Message[]>;
    /**
     * Loads and Retrieves all Messages in a chat
     * @param chatId
     * @param includeMe
     * @param includeNotifications
     * @returns any
     */
    loadAndGetAllMessagesInChat(chatId: string, includeMe?: boolean, includeNotifications?: boolean): Promise<import("../model").Message[]>;
    /**
     * Checks if a CHAT contact is online.
     * @param chatId chat id: xxxxx@c.us
     */
    getChatIsOnline(chatId: string): Promise<boolean>;
    /**
     * Retrieves the last seen of a CHAT.
     * @param chatId chat id: xxxxx@c.us
     */
    getLastSeen(chatId: string): Promise<number | boolean>;
}
