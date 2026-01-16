import { vi } from 'vitest';

export interface MockChat {
  id: { _serialized: string };
  t: number;
  status?: number;
  msgs: { _models: unknown[] };
  lastReceivedKey?: { _serialized?: string; id?: string };
}

export interface MockContact {
  id: { _serialized: string };
  name?: string;
  pushname?: string;
}

export function createChatMock(
  id: string,
  overrides: Partial<MockChat> = {}
): MockChat {
  return {
    id: { _serialized: id },
    t: Math.floor(Date.now() / 1000),
    status: 200,
    msgs: { _models: [] },
    ...overrides
  };
}

export function createContactMock(
  id: string,
  overrides: Partial<MockContact> = {}
): MockContact {
  return {
    id: { _serialized: id },
    name: 'Test Contact',
    pushname: 'Test',
    ...overrides
  };
}

export function createStoreMock() {
  return {
    Chat: {
      get: vi.fn(),
      map: vi.fn(() => [])
    },
    Contact: {
      get: vi.fn()
    },
    Msg: vi.fn(),
    WidFactory: {
      createWid: vi.fn((id: string) => ({ _serialized: id }))
    },
    FindOrCreateChat: {
      findOrCreateLatestChat: vi.fn()
    },
    MaybeMeUser: {
      getMaybeMePnUser: vi.fn(() => ({ _serialized: 'me@c.us' }))
    },
    State: {
      Socket: {
        state: 'CONNECTED'
      }
    },
    addAndSendMsgToChat: vi.fn(),
    createGroup: vi.fn(),
    ProfilePicThumb: {
      get: vi.fn()
    },
    Presence: {
      subscribe: vi.fn()
    }
  };
}

export type StoreMock = ReturnType<typeof createStoreMock>;
