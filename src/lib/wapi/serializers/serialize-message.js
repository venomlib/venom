export const _serializeMessageObj = async (obj) => {
  if (obj === undefined) {
    return null;
  }
  const _chat = obj['chat'] ? await WAPI._serializeChatObj(obj['chat']) : {};
  const isGroupMsg =
    obj?.to?.server === 'g.us' || obj?.from?.server === 'g.us';

  // Only fetch group info if this is a group message - avoid getAllChats()
  let groupInfo = null;
  if (isGroupMsg && obj?.from?._serialized) {
    const groupChat = window.Store.Chat.get(obj.from._serialized);
    if (groupChat?.contact) {
      groupInfo = await WAPI._serializeContactObj(groupChat.contact);
    }
  }

  return {
    ...window.WAPI._serializeRawObj(obj),
    id: obj?.id?._serialized,
    from: obj?.from?._serialized,
    quotedParticipant: obj?.quotedParticipant?._serialized || undefined,
    author: obj?.author?._serialized || undefined,
    chatId: obj?.id?.remote || obj?.chatId?._serialized || undefined,
    to: obj?.to?._serialized || undefined,
    fromMe: obj?.id?.fromMe,
    sender: obj?.senderObj
      ? await WAPI._serializeContactObj(obj?.senderObj)
      : null,
    timestamp: obj?.t,
    content: obj?.body,
    body: obj?.body,
    isLink: obj?.isLink,
    isMMS: obj?.isMMS,
    isMedia: obj?.isMedia,
    isNotification: obj?.isNotification,
    isPSA: obj?.isPSA,
    type: obj?.type,
    chat: _chat,
    isOnline: _chat?.isOnline,
    lastSeen: _chat?.lastSeen,
    quotedMsgObj: obj?.quotedMsg,
    quotedStanzaId: obj?.quotedStanzaID || undefined,
    mediaData: window.WAPI._serializeRawObj(obj?.mediaData),
    caption: obj?.caption,
    deprecatedMms3Url: obj?.deprecatedMms3Url,
    directPath: obj?.directPath,
    encFilehash: obj?.encFilehash,
    filehash: obj?.filehash,
    filename: obj?.filename,
    mimetype: obj?.mimetype,
    clientUrl: obj?.clientUrl,
    mediaKey: obj?.mediaKey,
    size: obj?.size,
    t: obj?.t,
    isNewMsg: obj?.isNewMsg,
    linkPreview: obj?.linkPreview,
    text: obj?.text,
    height: obj?.height,
    width: obj?.width,
    self: obj?.self,
    initialPageSize: obj?.initialPageSize,
    lat: obj?.lat || undefined,
    lng: obj?.lng || undefined,
    ack: obj?.ack,
    isGroupMsg,
    groupInfo,
    reply: (body) => window.WAPI.reply(_chat.id._serialized, body, obj)
  };
};
