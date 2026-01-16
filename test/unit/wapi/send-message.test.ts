import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setupWapiTestEnv, type WapiTestEnv } from './setup.js';
import { createChatMock } from './mocks/store-mock.js';
import { sendMessage } from '../../../src/lib/wapi/functions/send-message.js';

describe('WAPI sendMessage', () => {
  let env: WapiTestEnv;

  beforeEach(() => {
    env = setupWapiTestEnv();
  });

  afterEach(() => {
    env.cleanup();
  });

  describe('input validation', () => {
    it('should reject empty content', async () => {
      const result = await sendMessage('1234567890@c.us', '');

      expect(result.erro).toBe(true);
      expect(result.text).toBe('It is necessary to write a text!');
    });

    it('should reject non-string content', async () => {
      const result = await sendMessage(
        '1234567890@c.us',
        123 as unknown as string
      );

      expect(result.erro).toBe(true);
      expect(result.text).toBe('It is necessary to write a text!');
    });

    it('should reject empty recipient', async () => {
      const result = await sendMessage('', 'Hello');

      expect(result.erro).toBe(true);
      expect(result.status).toBe(404);
      expect(result.text).toBe('Recipient number is required');
    });

    it('should reject non-string recipient', async () => {
      const result = await sendMessage(
        null as unknown as string,
        'Hello'
      );

      expect(result.erro).toBe(true);
      expect(result.status).toBe(404);
    });
  });

  describe('status message validation', () => {
    it('should reject status messages over 700 characters', async () => {
      const longMessage = 'a'.repeat(701);
      const result = await sendMessage('status@broadcast', longMessage, true);

      expect(result.erro).toBe(true);
      expect(result.text).toBe('Use a maximum of 700 characters');
    });

    it('should accept status messages at 700 characters', async () => {
      const message = 'a'.repeat(700);
      const chatId = 'status@broadcast';
      const mockChat = createChatMock(chatId);

      env.storeMock.FindOrCreateChat.findOrCreateLatestChat.mockResolvedValue({
        chat: mockChat
      });
      // addAndSendMsgToChat returns an array (not a promise) that gets passed to Promise.all
      env.storeMock.addAndSendMsgToChat.mockReturnValue([
        Promise.resolve(null),
        Promise.resolve('success')
      ]);

      const result = await sendMessage(chatId, message, true);

      expect(result.erro).toBe(false);
    });
  });

  describe('chat creation', () => {
    it('should create WID from recipient', async () => {
      const chatId = '1234567890@c.us';
      const mockChat = createChatMock(chatId);

      env.storeMock.FindOrCreateChat.findOrCreateLatestChat.mockResolvedValue({
        chat: mockChat
      });
      env.storeMock.addAndSendMsgToChat.mockReturnValue([
        Promise.resolve(null),
        Promise.resolve('success')
      ]);

      await sendMessage(chatId, 'Hello');

      expect(env.storeMock.WidFactory.createWid).toHaveBeenCalledWith(chatId);
    });

    it('should handle invalid number errors', async () => {
      const chatId = '1234567890@c.us';

      env.storeMock.FindOrCreateChat.findOrCreateLatestChat.mockRejectedValue(
        new Error('Invalid')
      );

      const result = await sendMessage(chatId, 'Hello');

      expect(result.erro).toBe(true);
      expect(result.text).toContain('Invalid number');
    });
  });

  describe('successful message send', () => {
    it('should send message and return success', async () => {
      const chatId = '1234567890@c.us';
      const content = 'Hello World';
      const mockChat = createChatMock(chatId);

      env.storeMock.FindOrCreateChat.findOrCreateLatestChat.mockResolvedValue({
        chat: mockChat
      });
      env.storeMock.addAndSendMsgToChat.mockReturnValue([
        Promise.resolve(null),
        Promise.resolve('success')
      ]);

      const result = await sendMessage(chatId, content);

      expect(result.erro).toBe(false);
      expect(env.storeMock.addAndSendMsgToChat).toHaveBeenCalled();
    });

    it('should handle OK response', async () => {
      const chatId = '1234567890@c.us';
      const mockChat = createChatMock(chatId);

      env.storeMock.FindOrCreateChat.findOrCreateLatestChat.mockResolvedValue({
        chat: mockChat
      });
      env.storeMock.addAndSendMsgToChat.mockReturnValue([
        Promise.resolve(null),
        Promise.resolve('OK')
      ]);

      const result = await sendMessage(chatId, 'Hello');

      expect(result.erro).toBe(false);
    });

    it('should handle messageSendResult OK response', async () => {
      const chatId = '1234567890@c.us';
      const mockChat = createChatMock(chatId);

      env.storeMock.FindOrCreateChat.findOrCreateLatestChat.mockResolvedValue({
        chat: mockChat
      });
      env.storeMock.addAndSendMsgToChat.mockReturnValue([
        Promise.resolve(null),
        Promise.resolve({ messageSendResult: 'OK' })
      ]);

      const result = await sendMessage(chatId, 'Hello');

      expect(result.erro).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle group removal error', async () => {
      const groupId = '1234567890@g.us';
      const mockChat = createChatMock(groupId);

      env.storeMock.FindOrCreateChat.findOrCreateLatestChat.mockResolvedValue({
        chat: mockChat
      });
      env.storeMock.addAndSendMsgToChat.mockReturnValue([
        Promise.resolve(null),
        Promise.resolve('ERROR_UNKNOWN')
      ]);

      const result = await sendMessage(groupId, 'Hello');

      expect(result.erro).toBe(true);
      expect(result.text).toContain('Could not send message to this group');
    });

    it('should handle message ID generation failure', async () => {
      const chatId = '1234567890@c.us';
      const mockChat = createChatMock(chatId);

      env.storeMock.FindOrCreateChat.findOrCreateLatestChat.mockResolvedValue({
        chat: mockChat
      });
      env.wapiMock.getNewMessageId.mockResolvedValue(null);

      const result = await sendMessage(chatId, 'Hello');

      expect(result.erro).toBe(true);
      expect(result.text).toBe('Error to gerate newId');
    });
  });
});
