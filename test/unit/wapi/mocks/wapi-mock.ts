import { vi } from 'vitest';

export interface ScopeResult {
  me: string;
  to: unknown;
  erro: boolean;
  text: string | null;
  status: unknown;
}

export function createWapiMock() {
  const scopeFn = vi.fn(
    async (
      id: unknown,
      erro: boolean,
      status: unknown,
      text: string | null = null
    ): Promise<ScopeResult> => ({
      me: 'me@c.us',
      to: id,
      erro,
      text,
      status
    })
  );

  return {
    scope: scopeFn,
    getHost: vi.fn(() => ({
      id: { _serialized: 'me@c.us' },
      pushname: 'Test User'
    })),
    _serializeChatObj: vi.fn((chat: { id?: { _serialized?: string } }) => ({
      id: chat?.id?._serialized,
      name: 'Test Chat'
    })),
    _serializeContactObj: vi.fn(
      (contact: { id?: { _serialized?: string } }) => ({
        id: contact?.id?._serialized,
        name: 'Test Contact'
      })
    ),
    _serializeMessageObj: vi.fn((msg: { id?: string }) => ({
      id: msg?.id,
      body: 'Test message'
    })),
    _serializeForcing: vi.fn((result: unknown) => result),
    getNewMessageId: vi.fn(() => ({
      _serialized: `true_me@c.us_${Date.now()}`
    })),
    setNewMessageId: vi.fn((id: string) => ({
      _serialized: id
    })),
    sendExist: vi.fn(() => ({
      status: 200,
      erro: false,
      isUser: true
    })),
    getchatId: vi.fn((chatId: unknown) => {
      // chatId can be an object with _serialized or a string
      // Must return a Promise so .catch() can be called
      const idStr =
        typeof chatId === 'object' && chatId !== null
          ? (chatId as { _serialized?: string })._serialized || ''
          : String(chatId);
      return Promise.resolve({
        _serialized: idStr,
        id: idStr.split('@')[0]
      });
    }),
    getChatById: vi.fn(),
    sleep: vi.fn(() => Promise.resolve()),
    deleteMessages: vi.fn(() => Promise.resolve(true))
  };
}

export type WapiMock = ReturnType<typeof createWapiMock>;
