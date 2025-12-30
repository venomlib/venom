import { createWidWrapper } from '../helper/index.js';
export async function startTyping(chatId) {
  console.log(`startTyping: chatId ${chatId}`);
  const chat = createWidWrapper(chatId);
  if (!chat) {
    throw {
      error: true,
      code: 'chat_not_found',
      message: 'Chat not found',
      chatId: chatId
    };
  }
  await Store.ChatStates.sendChatStateComposing(chat);
  return { status: 200 };
}
