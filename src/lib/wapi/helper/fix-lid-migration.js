export async function createWidWrapper(chatId) {
  let gate = window
    .require('WAWebLid1X1MigrationGating')
    .Lid1X1MigrationUtils.isLidMigrated();

  let chatWid = window.Store.WidFactory.createWid(chatId);
  if (gate) {
    const isChannel = /@\w*newsletter\b/.test(chatId);

    let chat;

    if (isChannel) {
      try {
        chat = window.Store.NewsletterCollection.get(chatId);
        if (!chat) {
          await window.Store.ChannelUtils.loadNewsletterPreviewChat(chatId);
          chat = await window.Store.NewsletterCollection.find(chatWid);
        }
      } catch (err) {
        chat = null;
      }
    } else {
      chat = await window.Store.FindOrCreateChat.findOrCreateLatestChat(chatWid)
        .then((chat) => chat.chat)
        .catch(async (_) => {
          let actions;
          actions = [
            {
              type: 'add',
              phoneNumber: chatWid.user
            }
          ];
          let query = window
            .require('WAWebContactSyncUtils')
            .constructUsyncDeltaQuery(actions);
          let result = await query.execute();
          chatWid = window.Store.WidFactory.createWid(result.list[0].lid);
        });
    }
  }
  return chatWid;
}
