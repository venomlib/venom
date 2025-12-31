export async function startTyping(chatId) {
  console.log(`startTyping: chatId ${chatId}`);
  try {
    let chat = window.Store.WidFactory.createWid(chatId);
    if (!chat) {
      throw {
        error: true,
        code: 'chat_not_found',
        message: 'Chat not found',
        chatId: chatId
      };
    }
    await Store.ChatStates.sendChatStateComposing(chat);
  } catch (e) {
    window.onLog(`Error in startTyping: ${e}`);
    window.onLog(`ChatId ${chatId}`);
    return {
      status: 400,
      text: `Phone number not found ${chatId}`,
      erro: true
    };
  }

  return { status: 200, erro: false };
}
