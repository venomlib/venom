import { Browser } from 'puppeteer';
import { CreateConfig } from '../../config/create-config.js';

export async function checkingCloses(
  browser: Browser | string,
  mergedOptions: CreateConfig,
  callStatus: (e: string) => void
): Promise<void> {
  if (typeof browser === 'string') {
    return;
  }

  while (true) {
    await new Promise((r) => setTimeout(r, 2000));

    if (
      browser['isClose'] ||
      (mergedOptions.browserWS && !browser.isConnected())
    ) {
      if (mergedOptions.browserWS) {
        await browser.disconnect();
        if (callStatus) callStatus('serverClose');
      }
      if (browser['isClose']) {
        await browser.close();
        if (callStatus) callStatus('browserClose');
      }
      return;
    }
  }
}
