import { Whatsapp } from '../api/whatsapp.js';
import { CreateConfig, defaultOptions } from '../config/create-config.js';
import { initWhatsapp, initBrowser, statusLog } from './browser.js';
import { welcomeScreen } from './welcome.js';
import { getSpinnies } from '../utils/spinnies.js';
import {
  SocketState,
  SocketStream,
  InterfaceMode,
  InterfaceState
} from '../api/model/enum/index.js';
import { InterfaceChangeMode } from '../api/model/index.js';
import { checkingCloses } from '../api/helpers/index.js';
import { Browser, Page } from 'puppeteer';

declare global {
  interface Window {
    updater;
  }
}
/**
 * A callback will be received, informing the status of the qrcode
 */
export type CatchQR = (
  qrCode: string,
  asciiQR: string,
  attempt?: number,
  urlCode?: string
) => void;

/**
 * A callback will be received, informing the customer's status
 */
export type StatusFind = (
  statusGet: string,
  session: string,
  info?: string
) => void;

/**
 * A callback will be received, informing user about browser and page instance
 */
export type BrowserInstance = (
  browser: string | Browser,
  waPage: false | Page,
  client: Whatsapp
) => void;

export type interfaceChange = (
  statusGet: InterfaceStateChange | string,
  session: string
) => void;

export enum InterfaceStateChange {
  /**
   * Client interface is loading page from qrcode
   */
  qrcodeOpening = 'qrcodeOpening',
  /**
   * Client interface is loading qrcode
   */
  qrcodeLoading = 'qrcodeLoading',
  /**
   * QR code ready to be read!
   */
  qrcodeNormal = 'qrcodeNormal',
  /**
   * Client interface is loading page from syncing
   */
  syncingOpening = 'syncingOpening',
  /**
   * Client interface is loading syncing
   */
  syncingLoading = 'syncingLoading',
  /**
   * Syncing ready to be read!
   */
  syncingNormal = 'syncingNormal',
  /**
   * The customer is in the chat
   */
  chatsAvailable = 'chatsAvailable'
}

export type ReconnectQrcode = (client: Whatsapp) => void;

export interface CreateOptions extends CreateConfig {
  /**
   * You must pass a string type parameter, this parameter will be the name of the client's session. If the parameter is not passed, the section name will be "session".
   */
  session: string;
  /**
   * A callback will be received, informing the status of the qrcode
   */
  catchQR?: CatchQR;
  /**
   * A callback will be received, informing the customer's status
   */
  statusFind?: StatusFind;
  /**
   * A callback will be received, informing user about browser and page instance
   */
  browserInstance?: BrowserInstance;
  /**
   * A callback will be received, customer interface information
   */
  interfaceChange?: interfaceChange;
}

/**
 * Start the bot
 * @returns Whatsapp page, with this parameter you will be able to access the bot functions
 */
export async function create(createOption: CreateOptions): Promise<Whatsapp>;
/**
 * Start the bot
 * You must pass a string type parameter, this parameter will be the name of the client's session. If the parameter is not passed, the section name will be "session".
 * @returns Whatsapp page, with this parameter you will be able to access the bot functions
 */

export async function create(
  sessionName: string,
  catchQR?: CatchQR,
  statusFind?: StatusFind,
  options?: CreateConfig,
  browserInstance?: BrowserInstance,
  reconnectQrcode?: ReconnectQrcode,
  interfaceChange?: interfaceChange
): Promise<Whatsapp>;

export async function create(
  sessionOrOption: string | CreateOptions,
  catchQR?: CatchQR,
  statusFind?: StatusFind,
  options?: CreateConfig,
  browserInstance?: BrowserInstance,
  reconnectQrcode?: ReconnectQrcode,
  interfaceChange?: interfaceChange
): Promise<any> {
  let session = 'session';
  return new Promise(async (resolve, reject) => {
    if (
      typeof sessionOrOption === 'string' &&
      sessionOrOption.replace(/\s/g, '').length
    ) {
      session = sessionOrOption.replace(/\s/g, '');
      options['session'] = session;
    } else if (typeof sessionOrOption === 'object') {
      session = sessionOrOption.session || session;
      catchQR = sessionOrOption.catchQR || catchQR;
      statusFind = sessionOrOption.statusFind || statusFind;
      browserInstance = sessionOrOption.browserInstance || browserInstance;
      options = sessionOrOption;
    }

    const spinnies = getSpinnies({
      disableSpins: options ? options.disableSpins : false
    });

    spinnies.add(`node-version-${session}`, {
      text: `check nodeJs version...`
    });

    const requiredNodeVersion = 22;
    const currentNodeVersion = Number(process.versions.node.split('.')[0]);
    if (currentNodeVersion < requiredNodeVersion) {
      spinnies.fail(`node-version-${session}`, {
        text: `update Node.js, the version you are using doesn't work for this system!`
      });
      return reject(
        `Outdated Node.js version. Node.js ${requiredNodeVersion} or higher is required. Please update Node.js.`
      );
    }

    spinnies.succeed(`node-version-${session}`, {
      text: `Node.js version verified successfully!`
    });

    const mergedOptions = { ...defaultOptions, ...options };

    if (!mergedOptions.disableWelcome) {
      welcomeScreen();
    }

    if (statusFind) statusFind('initBrowser', session);

    // Initialize whatsapp
    if (mergedOptions.browserWS) {
      spinnies.add(`browser-${session}`, {
        text: `Waiting... checking the wss server...`
      });
    } else {
      spinnies.add(`browser-${session}`, {
        text: 'Waiting... checking the browser...'
      });
    }

    const browser: Browser | boolean = await initBrowser(
      mergedOptions,
      spinnies
    );

    if (typeof browser === 'boolean') {
      spinnies.fail(`browser-${session}`, {
        text: `Error no open browser....`
      });
      if (statusFind) statusFind('noOpenBrowser', session);
      return reject(`Error no open browser....`);
    }

    if (mergedOptions.browserWS) {
      if (statusFind) statusFind('connectBrowserWs', session);
      spinnies.succeed(`browser-${session}`, {
        text: `Has been properly connected to the wss server`
      });
    } else {
      if (statusFind) statusFind('openBrowser', session);
      spinnies.succeed(`browser-${session}`, {
        text: `Browser successfully opened`
      });
    }

    if (!mergedOptions.browserWS) {
      spinnies.add(`browser-${session}`, {
        text: 'checking headless...'
      });

      if (mergedOptions.headless) {
        spinnies.succeed(`browser-${session}`, {
          text: 'headless option is active, browser hidden'
        });
      } else {
        spinnies.succeed(`browser-${session}`, {
          text: 'headless option is disabled, browser visible'
        });
      }
    }

    if (typeof browser === 'object') {
      if (!mergedOptions.browserWS && browser['_process']) {
        browser['_process'].once('close', () => {
          browser['isClose'] = true;
        });
      }

      checkingCloses(browser, mergedOptions, (result) => {
        if (statusFind) statusFind(result, session);
      }).catch(() => {
        spinnies.fail(`whatzapp-${session}-close`, {
          text: 'Closed Browser'
        });
        return reject('The client has been closed');
      });
      console.log('Calling initWhatsapp');
      if (statusFind) statusFind('initWhatsapp', session);
      // Initialize whatsapp
      const page: false | Page = await initWhatsapp(mergedOptions, browser);
      console.log('initWhatsApp returned');
      if (page === false) {
        spinnies.fail(`whatzapp-${session}`, {
          text: 'Error accessing the page: "https://web.whatsapp.com"'
        });
        if (statusFind) statusFind('erroPageWhatsapp', session);
        return reject(
          'Error when trying to access the page: "https://web.whatsapp.com"'
        );
      }

      console.log('Calling statusFind');
      if (statusFind) statusFind('successPageWhatsapp', session);
      console.log('Page successfully accessed');
      console.log('Waiting for introduction');

      statusLog(page, spinnies, session, (event) => {
        try {
          spinnies.add(`whatzapp-intro-${session}`, {
            text: event
          });
        } catch {}
        if (statusFind) statusFind('introductionHistory', session, event);
      });

      console.log('Creating WhatsApp Object');
      const client = new Whatsapp(browser, page, session, mergedOptions);

      if (browserInstance) {
        browserInstance(browser, page, client);
      }

      console.log('Setting onInterfaceChange');
      client.onInterfaceChange(async (interFace: InterfaceChangeMode) => {
        try {
          if (interFace.mode === InterfaceMode.MAIN) {
            if (interfaceChange) interfaceChange('chatsAvailable', session);
            spinnies.add(`whatzapp-mode-main-${session}`, {
              text: 'opening main page...'
            });

            spinnies.succeed(`whatzapp-mode-main-${session}`, {
              text: 'Successfully main page!'
            });

            spinnies.succeed(`whatzapp-mode-syncing-${session}`, {
              text: 'Successfully sync!'
            });

            await client.initService();
            await client.addChatWapi();
          }

          if (interFace.mode === InterfaceMode.SYNCING) {
            if (interFace.info === InterfaceState.OPENING) {
              if (interfaceChange) interfaceChange('syncingOpening', session);
              spinnies.add(`whatzapp-mode-syncing-${session}`, {
                text: 'opening sync page...'
              });
            }

            if (interFace.info === InterfaceState.PAIRING) {
              if (interfaceChange) interfaceChange('syncingLoading', session);
              spinnies.add(`whatzapp-mode-syncing-${session}`, {
                text: 'Loading sync...'
              });
            }

            if (interFace.info === InterfaceState.NORMAL) {
              if (interfaceChange) interfaceChange('syncingNormal', session);
              spinnies.succeed(`whatzapp-mode-syncing-${session}`, {
                text: 'Successfully sync!'
              });
            }
          }

          if (interFace.mode === InterfaceMode.QR) {
            if (interFace.info === InterfaceState.OPENING) {
              if (interfaceChange) interfaceChange('qrcodeOpening', session);
              console.log('Opening QR Code page...');
            }

            if (interFace.info === InterfaceState.PAIRING) {
              if (interfaceChange) interfaceChange('qrcodeLoading', session);
              console.log('Loading QR Code...');
            }

            if (interFace.info === InterfaceState.NORMAL) {
              if (interfaceChange) interfaceChange('qrcodeNormal', session);
              console.log('Successfully loaded QR Code!');
            }
          }
        } catch {}
      });

      client
        .onStreamChange(async (stateStream: SocketStream) => {
          if (stateStream === SocketStream.CONNECTED) {
            try {
              spinnies.succeed(`whatzapp-intro-${session}`, {
                text: 'Successfully connected!'
              });
            } catch {}
          }

          if (stateStream === SocketStream.DISCONNECTED) {
            const mode = await page
              .evaluate(() => window?.Store?.Stream?.mode)
              .catch(() => {});
            if (
              mode === InterfaceMode.QR
              // && checkFileJson(mergedOptions, session)
            ) {
              if (statusFind) {
                spinnies.add(`whatzapp-qr-${session}`, {
                  text: 'check....'
                });
                statusFind('desconnectedMobile', session);
                spinnies.fail(`whatzapp-qr-${session}`, {
                  text: 'Disconnected by cell phone!'
                });
              }
            }
          }
        })
        .catch();

      client
        .onStateChange(async (state) => {
          if (state === SocketState.PAIRING) {
            const device: boolean = await page
              .evaluate(() => {
                if (
                  document.querySelector('[tabindex="-1"]') &&
                  window?.Store?.Stream?.mode === InterfaceMode.SYNCING &&
                  window?.Store?.Stream?.obscurity === 'SHOW'
                ) {
                  return true;
                }
                return false;
              })
              .catch(() => undefined);
            if (device === true) {
              if (statusFind) {
                statusFind('deviceNotConnected', session);
              }
            }
          }
        })
        .catch();

      page.on('dialog', async (dialog) => {
        await dialog.accept();
      });

      if (mergedOptions.waitForLogin) {
        const isLogged = await client
          .waitForLogin(catchQR, statusFind)
          .catch(() => undefined);

        if (statusFind) statusFind('waitForLogin', session);

        if (!isLogged) {
          return reject('Not Logged');
        }

        let waitLoginPromise = null;
        client
          .onStateChange(async (state) => {
            if (
              state === SocketState.UNPAIRED ||
              state === SocketState.UNPAIRED_IDLE
            ) {
              if (!waitLoginPromise) {
                waitLoginPromise = client
                  .waitForLogin(catchQR, statusFind)
                  .then(() => {
                    if (reconnectQrcode) {
                      reconnectQrcode(client);
                    }
                  })
                  .catch(() => {})
                  .finally(() => {
                    waitLoginPromise = null;
                  });
              }
              await waitLoginPromise;
            }
          })
          .catch();
      }

      if (statusFind) statusFind('waitChat', session);

      await page
        .waitForSelector('#app .two', { visible: true })
        .catch(() => {});

      try {
        spinnies.succeed(`whatzapp-intro-${session}`, {
          text: 'Successfully connected!'
        });
      } catch {}

      await client.initService();
      await client.addChatWapi();

      if (statusFind) statusFind('successChat', session);

      return resolve(client);
    }
  });
}
