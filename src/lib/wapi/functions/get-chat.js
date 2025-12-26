import { createWidWrapper } from '../helper';

export async function getChat(id) {
  if (!id) {
    return false;
  }
  id = typeof id == 'string' ? id : id._serialized;

  let gate = window
    .require('WAWebLid1X1MigrationGating')
    .Lid1X1MigrationUtils.isLidMigrated();
  let found = false;
  if (gate) {
    console.info('Lid migration found');
    let chatWid = await createWidWrapper(id);
    found =
      await window.Store.FindOrCreateChat.findOrCreateLatestChat(chatWid).chat;
  } else {
    console.info('Lid migration not found');
    found = Store.Chat.get(id);
  }

  if (!found) {
    console.info('Validating Wid');
    if (Store.CheckWid.validateWid(id)) {
      const ConstructChat = new window.Store.UserConstructor(id, {
        intentionallyUsePrivateConstructor: !0
      });
      const chatWid = new Store.WidFactory.createWid(id);
      console.log('Adding chat');
      await Store.Chat.add(
        {
          createdLocally: true,
          id: chatWid
        },
        {
          merge: true
        }
      );
      found = Store.Chat.find(ConstructChat) || false;
    }
  } else {
    found.sendMessage = found.sendMessage
      ? found.sendMessage
      : function () {
          return window.Store.sendMessage.apply(this, arguments);
        };
  }
  return found;
}
