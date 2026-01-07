import { Browser } from 'puppeteer';
import { CreateConfig } from '../../config/create-config.js';
export declare function checkingCloses(browser: Browser | string, mergedOptions: CreateConfig, callStatus: (e: string) => void): Promise<void>;
