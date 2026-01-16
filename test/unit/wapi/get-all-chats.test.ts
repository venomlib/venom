import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setupWapiTestEnv, type WapiTestEnv } from './setup.js';
import { createChatMock } from './mocks/store-mock.js';
import { getAllChats } from '../../../src/lib/wapi/functions/get-all-chats.js';

describe('WAPI getAllChats', () => {
  let env: WapiTestEnv;

  beforeEach(() => {
    env = setupWapiTestEnv();
  });

  afterEach(() => {
    env.cleanup();
  });

  describe('successful retrieval', () => {
    it('should return array of serialized chats', async () => {
      const mockChats = [
        createChatMock('1234567890@c.us'),
        createChatMock('0987654321@c.us'),
        createChatMock('group123@g.us')
      ];

      env.storeMock.MaybeMeUser.getMaybeMePnUser.mockResolvedValue({
        _serialized: 'me@c.us'
      });
      env.wapiMock.sendExist.mockResolvedValue({ status: 200 });
      env.storeMock.Chat.map.mockImplementation((fn: (chat: unknown) => unknown) =>
        mockChats.map(fn)
      );

      const result = await getAllChats(undefined);

      expect(result).toHaveLength(3);
      expect(env.wapiMock._serializeChatObj).toHaveBeenCalledTimes(3);
    });

    it('should call done callback when provided', async () => {
      const mockChats = [createChatMock('1234567890@c.us')];
      const doneFn = vi.fn();

      env.storeMock.MaybeMeUser.getMaybeMePnUser.mockResolvedValue({
        _serialized: 'me@c.us'
      });
      env.wapiMock.sendExist.mockResolvedValue({ status: 200 });
      env.storeMock.Chat.map.mockImplementation((fn: (chat: unknown) => unknown) =>
        mockChats.map(fn)
      );

      await getAllChats(doneFn);

      expect(doneFn).toHaveBeenCalled();
    });

    it('should handle empty chat list', async () => {
      env.storeMock.MaybeMeUser.getMaybeMePnUser.mockResolvedValue({
        _serialized: 'me@c.us'
      });
      env.wapiMock.sendExist.mockResolvedValue({ status: 200 });
      env.storeMock.Chat.map.mockReturnValue([]);

      const result = await getAllChats(undefined);

      expect(result).toEqual([]);
    });
  });

  describe('user not found', () => {
    it('should return undefined when user is not authenticated', async () => {
      env.storeMock.MaybeMeUser.getMaybeMePnUser.mockResolvedValue(null);

      const result = await getAllChats(undefined);

      expect(result).toBeUndefined();
    });

    it('should return undefined when sendExist returns 404', async () => {
      env.storeMock.MaybeMeUser.getMaybeMePnUser.mockResolvedValue({
        _serialized: 'me@c.us'
      });
      env.wapiMock.sendExist.mockResolvedValue({ status: 404 });

      const result = await getAllChats(undefined);

      expect(result).toBeUndefined();
    });
  });
});

// Need to import vi for the doneFn mock
import { vi } from 'vitest';
