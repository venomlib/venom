export async function sendMessageWithThumb(
  thumb,
  url,
  title,
  description,
  chatId,
  done
) {
  let wid = window.Store.WidFactory.createWid(chatId);
  let chatSend = null;
  try {
    chatSend = (await window.Store.FindOrCreateChat.findOrCreateLatestChat(wid))
      .chat;
  } catch (err) {
    window.onLog(`Invalid number : ${chatId.toString()}`);
    if (done !== undefined) done(false);
    return WAPI.scope(
      chatId,
      true,
      null,
      `Invalid number : ${chatId.toString()}`
    );
  }

  if (!chatSend || !chatSend.id) {
    if (done !== undefined) done(false);
    return WAPI.scope(chatId, true, 404, 'Chat not found');
  }

  var linkPreview = {
    canonicalUrl: url,
    description: description,
    matchedText: url,
    title: title,
    thumbnail: thumb
  };
  chatSend.sendMessage(url, {
    linkPreview: linkPreview,
    mentionedJidList: [],
    quotedMsg: null,
    quotedMsgAdminGroupJid: null
  });
  if (done !== undefined) done(true);
  return WAPI.scope(chatId, false, null, null);
}
