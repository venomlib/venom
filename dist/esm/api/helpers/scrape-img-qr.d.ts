import { Page } from 'puppeteer';
import { ScrapQrcode } from '../model/qrcode.js';
export declare function scrapeImg(page: Page): Promise<ScrapQrcode | undefined>;
