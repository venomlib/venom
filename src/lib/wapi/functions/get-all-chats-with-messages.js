export async function getAllChatsWithMessages(newOnly) {
  let x = [];
  if (newOnly) {
    x = (await WAPI.getAllChats()).filter((x) => x.unreadCount > 0);
  } else {
    x = await WAPI.getAllChats();
  }
  const result = JSON.stringify(x);
  return JSON.parse(result);
}
