import { Page, Browser } from 'puppeteer';
import { CreateConfig, defaultOptions } from '../../config/create-config.js';
import { SocketState } from '../model/enum/index.js';
//import { injectApi } from '../../controllers/browser';
import { ScrapQrcode } from '../model/qrcode.js';
import { scrapeImg } from '../helpers/index.js';
import {
  asciiQr,
  isAuthenticated,
  isInsideChats,
  needsToScan,
  retrieveQR
} from '../../controllers/auth.js';
import { sleep } from '../../utils/sleep.js';
import { logInfo, logSuccess, logFail } from '../../utils/logger.js';

export class HostLayer {
  readonly session: string;
  readonly options: CreateConfig;

  protected spinStatus = {
    apiInject: '',
    autoCloseRemain: 0,
    state: ''
  };

  protected autoCloseInterval = null;
  protected statusFind?: (statusGet: string, session: string) => void = null;

  constructor(
    public browser: Browser,
    public page: Page,
    session?: string,
    options?: CreateConfig
  ) {
    this.session = session;
    this.options = { ...defaultOptions, ...options };

    // this.spin('Initializing...', 'spinning');
    //this._initialize(this.page);
  }

  protected log(text: string, status: 'info' | 'success' | 'fail' = 'info') {
    const fullText = `[instance: ${this.session}]: ${text}`;

    if (status === 'success') {
      logSuccess(fullText);
    } else if (status === 'fail') {
      logFail(fullText);
    } else {
      logInfo(fullText);
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

  protected tryAutoClose() {
    if (
      this.options.autoClose > 0 &&
      !this.autoCloseInterval &&
      !this.page.isClosed()
    ) {
      if (this.statusFind) this.statusFind('autocloseCalled', this.session);
      this.page.close().catch(() => {});
      this.browser.close().catch(() => {});
    }
  }

  protected startAutoClose() {
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
      } catch (e) {}
    }
  }

  public cancelAutoClose() {
    clearInterval(this.autoCloseInterval);
    this.autoCloseInterval = null;
  }

  public async getQrCode() {
    let qrResult: ScrapQrcode | undefined | any;

    qrResult = await scrapeImg(this.page).catch((e) => console.log(e));
    if (!qrResult || !qrResult.urlCode) {
      qrResult = await retrieveQR(this.page).catch((e) => console.log(e));
    }
    return qrResult;
  }

  public async waitForQrCodeScan(
    catchQR?: (
      qrCode: string,
      asciiQR: string,
      attempt: number,
      urlCode?: string
    ) => void
  ) {
    let urlCode = null;
    let attempt = 0;

    while (true) {
      let needsScan = await needsToScan(this.page).catch(() => null);
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
          qr = await asciiQr(urlCode).catch(() => undefined);
        }

        if (this.options.logQR) {
          console.log(qr);
        } else {
          this.log(`Waiting for QRCode Scan: Attempt ${attempt}`);
        }

        if (catchQR) {
          catchQR(result.base64Image, qr, attempt, result.urlCode);
        }
      }
      await sleep(200).catch(() => undefined);
    }
  }

  public async waitForInChat() {
    let inChat = await isInsideChats(this.page);

    while (inChat === false) {
      await sleep(200);
      inChat = await isInsideChats(this.page);
    }
    return inChat;
  }

  public async waitForLogin(
    catchQR?: (
      qrCode: string,
      asciiQR: string,
      attempt: number,
      urlCode?: string
    ) => void,
    statusFind?: (statusGet: string, session?: string) => void
  ) {
    this.statusFind = statusFind;

    this.log('Waiting page load');

    this.log('Checking is logged...');
    let authenticated = await isAuthenticated(this.page).catch(() => null);

    if (typeof authenticated === 'object' && authenticated.type) {
      this.log(`Error http: ${authenticated.type}`, 'fail');
      this.page.close().catch(() => {});
      this.browser.close().catch(() => {});
      throw `Error http: ${authenticated.type}`;
    }

    this.startAutoClose();

    if (authenticated === false) {
      this.log('Waiting for QRCode Scan...');
      if (this.statusFind) statusFind('notLogged', this.session);

      await this.waitForQrCodeScan(catchQR).catch(() => undefined);

      this.log('Checking QRCode status...');

      // Wait for interface update
      await sleep(200);
      authenticated = await isAuthenticated(this.page).catch(() => null);

      if (authenticated === null || JSON.stringify(authenticated) === '{}') {
        this.log('Failed to authenticate');
        if (this.statusFind) statusFind('qrReadFail', this.session);
      } else if (authenticated) {
        this.log('QRCode Success', 'success');
        if (this.statusFind) statusFind('qrReadSuccess', this.session);
      } else {
        this.log('QRCode Fail', 'fail');
        if (this.statusFind) statusFind('qrReadFail', this.session);
        this.cancelAutoClose();
        this.tryAutoClose();
        throw 'Failed to read the QRCode';
      }
    } else if (authenticated === true) {
      this.log('Authenticated', 'success');
      if (this.statusFind) statusFind('isLogged', this.session);
    }

    if (authenticated === true) {
      // Reinicia o contador do autoclose
      this.cancelAutoClose();
      this.startAutoClose();
      // Wait for interface update
      await sleep(200);
      this.log('Checking phone is connected...');
      const inChat = await this.waitForInChat();

      if (!inChat) {
        this.log('Phone not connected', 'fail');
        if (this.statusFind) statusFind('phoneNotConnected', this.session);
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
  public async setPresenceOffline() {
    return await this.page.evaluate(() => WAPI.setPresenceOffline());
  }

  //Pro
  /**
   * Set online
   */
  public async setPresenceOnline() {
    return await this.page.evaluate(() => WAPI.setPresenceOnline());
  }

  /**
   * Delete the Service Workers
   */
  public async killServiceWorker() {
    return await this.page.evaluate(() => WAPI.killServiceWorker());
  }

  /**
   * Load the service again
   */
  public async restartService() {
    return await this.page.evaluate(() => WAPI.restartService());
  }

  /**
   * @returns Current host device details
   */
  public async getHostDevice(): Promise<object> {
    return await this.page.evaluate(() => WAPI.getHost());
  }

  /**
   * Retrieves WA version
   */
  public async getWAVersion() {
    return await this.page.evaluate(() => WAPI.getWAVersion());
  }

  /**
   * Retrieves the connecction state
   */
  public async getConnectionState(): Promise<SocketState> {
    return await this.page.evaluate(() => {
      //@ts-ignore
      return Store.State.Socket.state;
    });
  }

  /**
   * Retrieves if the phone is online. Please note that this may not be real time.
   */
  public async isConnected() {
    return await this.page.evaluate(() => WAPI.isConnected());
  }

  /**
   * Retrieves if the phone is online. Please note that this may not be real time.
   */
  public async isLoggedIn() {
    return await this.page.evaluate(() => WAPI.isLoggedIn());
  }

  /**
   * Retrieves information about the host including who is logged in
   */
  public async getHost() {
    return await this.page.evaluate(() => WAPI.getHost());
  }

  /**
   * Retrieves Battery Level
   */
  public async getBatteryLevel() {
    return await this.page.evaluate(() => WAPI.getBatteryLevel());
  }
}
