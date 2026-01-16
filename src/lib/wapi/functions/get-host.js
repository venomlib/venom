export async function getHost() {
  const fromwWid = await WAPI.getMeUser();
  if (fromwWid) {
    const wid = window.Store.WidFactory.createWid(fromwWid._serialized);
    try {
      const { chat } = await window.Store.FindOrCreateChat.findOrCreateLatestChat(wid);
      if (chat && chat.status !== 404) {
        const infoUser = await Store.Contacts.ContactCollection.get(
          fromwWid._serialized
        );
        if (infoUser) {
          return await WAPI._serializeMeObj(infoUser);
        }
      }
    } catch (err) {
      window.onLog(`getHost error: ${err?.message || err}`);
    }
  }
}
