import { processFiles } from './process-files';
import { base64ToFile } from '../helper';

/**
 * Sends video as a gif to given chat id
 * @param {string} dataBase64
 * @param {string} chatid
 * @param {string} filename
 * @param {string} caption
 * @param {Function} done Optional callback
 */
export async function sendVideoAsGif(
  dataBase64,
  chatid,
  filename,
  caption,
  done
) {
  let wid = window.Store.WidFactory.createWid(chatid);
  let chat = null;
  try {
    chat = (await window.Store.FindOrCreateChat.findOrCreateLatestChat(wid))
      .chat;
  } catch (err) {
    window.onLog(`Invalid number : ${chatid.toString()}`);
    if (done !== undefined) done(false);
    return WAPI.scope(
      chatid,
      true,
      null,
      `Invalid number : ${chatid.toString()}`
    );
  }

  if (chat && chat.id) {
    var mediaBlob = base64ToFile(dataBase64, filename);
    processFiles(chat, mediaBlob).then((mc) => {
      var media = mc.models[0];
      media.mediaPrep._mediaData.isGif = true;
      media.mediaPrep._mediaData.gifAttribution = 1;
      media.mediaPrep.sendToChat(chat, { caption: caption });
      if (done !== undefined) done(true);
    });
    return WAPI.scope(chatid, false, null, null);
  } else {
    if (done !== undefined) done(false);
    return WAPI.scope(chatid, true, 404, 'Chat not found');
  }
}
