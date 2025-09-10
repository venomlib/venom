export async function promoteParticipant(groupId, contactsId, done) {
  const chat = Store.Chat.get(groupId);

  if (!Array.isArray(contactsId)) {
    contactsId = [contactsId];
  }

  contactsId = await Promise.all(contactsId.map((c) => WAPI.sendExist(c)));
  contactsId = contactsId
    .filter((c) => !c.erro && c.isUser)
    .map((c) => chat.groupMetadata.participants.get(c.id))
    .filter((c) => typeof c !== 'undefined')
    .map((c) => c.id);

  if (!contactsId.length) {
    if (typeof done === 'function') done(false);
    return false;
  }

  // await window.Store.WapQuery.promoteParticipants(chat.id, contactsId);

  const participants = contactsId.map((c) =>
    chat.groupMetadata.participants.get(c)
  );

  await Store.Participants.promoteParticipants(chat, participants);

  if (typeof done === 'function') done(false);
  return true;
}
