export const getAllChats = async function (done) {
  const fromwWid = await WAPI.getMeUser();
  if (fromwWid) {
    const idUser = await WAPI.findChat(fromwWid._serialized);
    if (idUser && idUser.status !== 404) {
      const chats = window.Store.Chat.map((chat) =>
        WAPI._serializeChatObj(chat)
      );

      if (done !== undefined) done(chats);
      return chats;
    }
  }
};
