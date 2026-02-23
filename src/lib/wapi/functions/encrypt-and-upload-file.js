import { generateMediaKey, getFileHash } from '../helper';

export async function encryptAndUploadFile(type, blob) {
  try {
    const filehash = await getFileHash(blob);
    const mediaKey = generateMediaKey(32);
    const controller = new AbortController();
    const signal = controller.signal;
    const uploadQpl = window.Store.MediaUploadQpl.startMediaUploadQpl({
      entryPoint: 'MediaUpload'
    });
    const encrypted = await window.Store.UploadUtils.encryptAndUpload({
      blob,
      type,
      signal,
      mediaKey,
      uploadQpl
    });
    return {
      ...encrypted,
      clientUrl: encrypted.url,
      filehash,
      id: filehash,
      uploadhash: encrypted.encFilehash,
      mediaBlob: blob
    };
  } catch (e) {
    window.onLog(`encryptAndUploadFile error: ${e}`);
    return false;
  }
}
