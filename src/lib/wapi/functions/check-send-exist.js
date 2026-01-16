export async function scope(id, erro, status, text = null) {
  const me = await WAPI.getHost();
  let e = {
    me: me,
    to: id,
    erro: erro,
    text: text,
    status: status
  };
  return e;
}

export async function getchatId(chatId) {
  if (chatId) {
    let to = await WAPI.getChatById(chatId);
    if (to && typeof to === 'object') {
      let objTo = to.lastReceivedKey;
      if (objTo && typeof objTo === 'object') {
        let extend = {
          formattedName: to.contact.formattedName,
          isBusiness: to.contact.isBusiness,
          isMyContact: to.contact.isMyContact,
          verifiedName: to.contact.verifiedName,
          pushname: to.contact.pushname,
          isOnline: to.isOnline
        };
        Object.assign(objTo, extend);
        return objTo;
      }
    }
  }
  return undefined;
}

export function sendCheckType(chatId = undefined) {
  if (!chatId) {
    return WAPI.scope(chatId, true, 404, 'It is necessary to pass a number!');
  }
  if (typeof chatId === 'string') {
    const contact = '@c.us';
    const broadcast = '@broadcast';
    const grup = '@g.us';
    const lid = '@lid';
    if (
      contact !== chatId.substr(-contact.length, contact.length) &&
      broadcast !== chatId.substr(-broadcast.length, broadcast.length) &&
      grup !== chatId.substr(-grup.length, grup.length) &&
      lid !== chatId.substr(-lid.length, lid.length)
    ) {
      return WAPI.scope(
        chatId,
        true,
        404,
        'The chat number must contain the parameters @c.us, @broadcast, @g.us, or @lid at the end of the number!'
      );
    }
    if (
      contact === chatId.substr(-contact.length, contact.length) &&
      ((chatId.match(/(@c.us)/g) && chatId.match(/(@c.us)/g).length > 1) ||
        !chatId.match(/^(\d+(\d)*@c.us)$/g))
    ) {
      return WAPI.scope(
        chatId,
        true,
        404,
        'incorrect parameters! Use as an example: 000000000000@c.us'
      );
    }

    if (
      broadcast === chatId.substr(-broadcast.length, broadcast.length) &&
      (chatId.match(/(@broadcast)/g).length > 1 ||
        (!chatId.match(/^(\d+(\d)*@broadcast)$/g) &&
          !chatId.match(/^(status@broadcast)$/g)))
    ) {
      return WAPI.scope(
        chatId,
        true,
        404,
        'incorrect parameters! Use as an example: 0000000000@broadcast'
      );
    }

    if (
      grup === chatId.substr(-grup.length, grup.length) &&
      ((chatId.match(/(@g.us)/g) && chatId.match(/(@g.us)/g).length > 1) ||
        !chatId.match(/^(\d+(-)+(\d)|\d+(\d))*@g.us$/g))
    ) {
      return WAPI.scope(
        chatId,
        true,
        404,
        'incorrect parameters! Use as an example: 00000000-000000@g.us or 00000000000000@g.us'
      );
    }
  }
}

export async function findChat(chatId) {
  const checkType = WAPI.sendCheckType(chatId);
  if (checkType && checkType.status === 404) {
    return checkType;
  }

  try {
    const wid = window.Store.WidFactory.createWid(chatId);
    const { chat } = await window.Store.FindOrCreateChat.findOrCreateLatestChat(wid);
    if (chat) {
      return chat;
    }
  } catch (err) {
    window.onLog(`findChat error for ${chatId}: ${err?.message || err}`);
  }

  return WAPI.scope(chatId, true, 404, 'Chat not found');
}
