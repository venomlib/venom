import { vi } from 'vitest';
import { createStoreMock, type StoreMock } from './mocks/store-mock.js';
import { createWapiMock, type WapiMock } from './mocks/wapi-mock.js';

export interface WapiTestEnv {
  storeMock: StoreMock;
  wapiMock: WapiMock;
  cleanup: () => void;
}

export function setupWapiTestEnv(): WapiTestEnv {
  const storeMock = createStoreMock();
  const wapiMock = createWapiMock();

  // Set up global window object with Store and WAPI
  (global as Record<string, unknown>).window = {
    Store: storeMock,
    WAPI: wapiMock,
    onLog: vi.fn()
  };

  // Also expose at global level (some WAPI functions use Store directly)
  (global as Record<string, unknown>).Store = storeMock;
  (global as Record<string, unknown>).WAPI = wapiMock;

  const cleanup = () => {
    delete (global as Record<string, unknown>).window;
    delete (global as Record<string, unknown>).Store;
    delete (global as Record<string, unknown>).WAPI;
  };

  return { storeMock, wapiMock, cleanup };
}
