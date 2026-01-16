import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setupWapiTestEnv, type WapiTestEnv } from './setup.js';
import { createChatMock } from './mocks/store-mock.js';
import { checkChat } from '../../../src/lib/wapi/functions/check-chat.js';

describe('WAPI checkChat', () => {
  let env: WapiTestEnv;

  beforeEach(() => {
    env = setupWapiTestEnv();
  });

  afterEach(() => {
    env.cleanup();
  });

  describe('valid ID formats', () => {
    it('should accept @c.us (contact) IDs', async () => {
      const chatId = '1234567890@c.us';
      const mockChat = createChatMock(chatId);
      env.storeMock.Chat.get.mockResolvedValue(mockChat);

      const result = await checkChat(chatId);

      expect(result.erro).toBe(false);
      expect(result.status).toBe(200);
      expect(env.storeMock.Chat.get).toHaveBeenCalledWith(chatId);
    });

    it('should accept @g.us (group) IDs', async () => {
      const chatId = '1234567890-1234567890@g.us';
      const mockChat = createChatMock(chatId);
      env.storeMock.Chat.get.mockResolvedValue(mockChat);

      const result = await checkChat(chatId);

      expect(result.erro).toBe(false);
      expect(result.status).toBe(200);
    });

    it('should accept @broadcast IDs', async () => {
      const chatId = 'status@broadcast';
      const mockChat = createChatMock(chatId);
      env.storeMock.Chat.get.mockResolvedValue(mockChat);

      const result = await checkChat(chatId);

      expect(result.erro).toBe(false);
      expect(result.status).toBe(200);
    });
  });

  describe('invalid ID formats', () => {
    it('should reject IDs without valid suffix', async () => {
      const result = await checkChat('1234567890');

      expect(result.erro).toBe(true);
      expect(result.status).toBe(400);
      expect(result.text).toBe('Was not found');
    });

    it('should reject non-string IDs', async () => {
      const result = await checkChat(12345 as unknown as string);

      expect(result.erro).toBe(true);
      expect(result.status).toBe(400);
    });

    it('should reject empty strings', async () => {
      const result = await checkChat('');

      expect(result.erro).toBe(true);
      expect(result.status).toBe(400);
    });
  });

  describe('chat not found', () => {
    it('should return 404 when chat does not exist', async () => {
      const chatId = '1234567890@c.us';
      env.storeMock.Chat.get.mockResolvedValue(null);

      const result = await checkChat(chatId);

      expect(result.erro).toBe(true);
      expect(result.status).toBe(404);
      expect(result.text).toBe('Was not found');
    });

    it('should return 404 when chat has no timestamp', async () => {
      const chatId = '1234567890@c.us';
      const mockChat = createChatMock(chatId);
      mockChat.t = 0; // falsy timestamp
      env.storeMock.Chat.get.mockResolvedValue(mockChat);

      const result = await checkChat(chatId);

      expect(result.erro).toBe(true);
      expect(result.status).toBe(404);
    });
  });

  describe('successful lookup', () => {
    it('should return serialized chat object', async () => {
      const chatId = '1234567890@c.us';
      const mockChat = createChatMock(chatId);
      env.storeMock.Chat.get.mockResolvedValue(mockChat);

      const result = await checkChat(chatId);

      expect(result.erro).toBe(false);
      expect(result.status).toBe(200);
      expect(env.wapiMock._serializeChatObj).toHaveBeenCalledWith(mockChat);
    });
  });
});
