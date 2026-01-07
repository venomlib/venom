import { Page, Browser } from 'puppeteer';
import { CreateConfig } from '../../config/create-config.js';
import { SocketState } from '../model/enum/index.js';
export declare class HostLayer {
    browser: Browser;
    page: Page;
    readonly session: string;
    readonly options: CreateConfig;
    protected spinStatus: {
        apiInject: string;
        autoCloseRemain: number;
        state: string;
    };
    protected autoCloseInterval: any;
    protected statusFind?: (statusGet: string, session: string) => void;
    constructor(browser: Browser, page: Page, session?: string, options?: CreateConfig);
    protected log(text: string, status?: 'info' | 'success' | 'fail'): void;
    protected tryAutoClose(): void;
    protected startAutoClose(): void;
    cancelAutoClose(): void;
    getQrCode(): Promise<any>;
    waitForQrCodeScan(catchQR?: (qrCode: string, asciiQR: string, attempt: number, urlCode?: string) => void): Promise<void>;
    waitForInChat(): Promise<true>;
    waitForLogin(catchQR?: (qrCode: string, asciiQR: string, attempt: number, urlCode?: string) => void, statusFind?: (statusGet: string, session?: string) => void): Promise<boolean>;
    /**
     * Set offline
     */
    setPresenceOffline(): Promise<boolean>;
    /**
     * Set online
     */
    setPresenceOnline(): Promise<boolean>;
    /**
     * Delete the Service Workers
     */
    killServiceWorker(): Promise<boolean>;
    /**
     * Load the service again
     */
    restartService(): Promise<boolean>;
    /**
     * @returns Current host device details
     */
    getHostDevice(): Promise<object>;
    /**
     * Retrieves WA version
     */
    getWAVersion(): Promise<string>;
    /**
     * Retrieves the connecction state
     */
    getConnectionState(): Promise<SocketState>;
    /**
     * Retrieves if the phone is online. Please note that this may not be real time.
     */
    isConnected(): Promise<boolean>;
    /**
     * Retrieves if the phone is online. Please note that this may not be real time.
     */
    isLoggedIn(): Promise<boolean>;
    /**
     * Retrieves information about the host including who is logged in
     */
    getHost(): Promise<any>;
    /**
     * Retrieves Battery Level
     */
    getBatteryLevel(): Promise<number>;
}
