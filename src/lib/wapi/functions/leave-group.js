export async function leaveGroup(groupId) {
  groupId = typeof groupId == 'string' ? groupId : groupId._serialized;
  let wid = window.Store.WidFactory.createWid(groupId);
  let group = null;
  try {
    group = (await window.Store.FindOrCreateChat.findOrCreateLatestChat(wid))
      .chat;
  } catch (err) {
    window.onLog(`Invalid group : ${groupId.toString()}`);
    return WAPI.scope(
      groupId,
      true,
      null,
      `Invalid group : ${groupId.toString()}`
    );
  }

  if (!group || !group.id) {
    return WAPI.scope(groupId, true, 404, 'Group not found');
  }

  return Store.GroupActions.sendExitGroup(group);
}
