import { processFiles } from './process-files';
import { base64ToFile } from '../helper';

/**
 * Sends product with product image to given chat id
 * @param {string} imgBase64 Base64 image data
 * @param {string} chatid Chat id
 * @param {string} caption Caption
 * @param {string} bizNumber string the @c.us number of the business account from which you want to grab the product
 * @param {string} productId string the id of the product within the main catalog of the aforementioned business
 * @param {Function} done Optional callback
 */
export async function sendImageWithProduct(
  imgBase64,
  chatid,
  caption,
  bizNumber,
  productId,
  done
) {
  const cat = await Store.Catalog.findCarouselCatalog(bizNumber);
  if (cat && cat[0]) {
    const product = cat[0].productCollection.get(productId);
    const temp = {
      productMsgOptions: {
        businessOwnerJid: product.catalogWid.toString({
          legacy: !0
        }),
        productId: product.id.toString(),
        url: product.url,
        productImageCount: product.productImageCollection.length,
        title: product.name,
        description: product.description,
        currencyCode: product.currency,
        priceAmount1000: product.priceAmount1000,
        type: 'product'
      },
      caption
    };

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
      var mediaBlob = base64ToFile(imgBase64, product.name);
      processFiles(chat, mediaBlob).then((mc) => {
        var media = mc.models[0];
        Object.entries(temp.productMsgOptions).map(
          ([k, v]) => (media.mediaPrep._mediaData[k] = v)
        );
        media.mediaPrep.sendToChat(chat, temp);
        if (done !== undefined) done(true);
      });
      return WAPI.scope(chatid, false, null, null);
    } else {
      if (done !== undefined) done(false);
      return WAPI.scope(chatid, true, 404, 'Chat not found');
    }
  }
  if (done !== undefined) done(false);
  return WAPI.scope(chatid, true, 404, 'Catalog not found');
}
