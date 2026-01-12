export async function deleteConversation(chatId, done) {
  let wid = window.Store.WidFactory.createWid(chatId);
  let conversation = null;
  try {
    conversation = (
      await window.Store.FindOrCreateChat.findOrCreateLatestChat(wid)
    ).chat;
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

  if (!conversation || !conversation.id) {
    if (done !== undefined) {
      done(false);
    }
    return WAPI.scope(chatId, true, 404, 'Chat not found');
  }

  window.Store.sendDelete(conversation, false)
    .then(() => {
      if (done !== undefined) {
        done(true);
      }
    })
    .catch(() => {
      if (done !== undefined) {
        done(false);
      }
    });

  return WAPI.scope(chatId, false, null, null);
}
