//import { Browser, Page } from 'puppeteer';
import { options, defaultOptions } from '../config/index.js';
//import { initWhatsapp, initBrowser } from './browser';
//import { CallbackOnStatus } from '../api/layers';

export async function connect(options?: options);

export async function connect(options?: options) {
  //const event = new CallbackOnStatus();
  const mergeOptionsDefault = { ...defaultOptions, ...options };

  if (!!mergeOptionsDefault.session && mergeOptionsDefault.session.length) {
    const sessionName = mergeOptionsDefault.session;
    const replaceSession = sessionName.replace(/[^0-9a-zA-Zs]/g, '');
    if (replaceSession.length) {
      mergeOptionsDefault.session = replaceSession;
    } else {
      mergeOptionsDefault.session = defaultOptions.session;
    }
  }

  if (mergeOptionsDefault.updatesLog) {
  }

  // const wpage: Browser | boolean = await initBrowser(mergeOptionsDefault);
  // if (typeof wpage !== 'boolean') {
  //   const page: boolean | Page = await initWhatsapp(mergeOptionsDefault, wpage);
  //   if (typeof page !== 'boolean') {
  //     console.log('New option');
  //   }
  // }
}
