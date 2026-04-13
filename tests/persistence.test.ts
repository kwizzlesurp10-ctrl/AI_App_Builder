import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveSession, loadSession, clearSession, getDefaultSession } from '../services/persistenceService';
import { INITIAL_MESSAGES, INITIAL_APP_SPEC } from '../constants';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('persistenceService', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should save and load session', () => {
    const messages = [{ role: 'user' as const, content: 'hello' }];
    const appSpec = INITIAL_APP_SPEC;

    saveSession(messages, appSpec);
    const loaded = loadSession();

    expect(loaded).not.toBeNull();
    expect(loaded!.messages).toHaveLength(1);
    expect(loaded!.messages[0].content).toBe('hello');
  });

  it('should return null when no session saved', () => {
    expect(loadSession()).toBeNull();
  });

  it('should clear session', () => {
    saveSession(INITIAL_MESSAGES, INITIAL_APP_SPEC);
    clearSession();
    expect(loadSession()).toBeNull();
  });

  it('should return default session', () => {
    const defaults = getDefaultSession();
    expect(defaults.messages).toHaveLength(INITIAL_MESSAGES.length);
    expect(defaults.appSpec.theme).toBeDefined();
  });

  it('should return null for invalid stored data', () => {
    localStorageMock.setItem('ai-app-builder:messages', 'invalid json');
    localStorageMock.setItem('ai-app-builder:app-specification', 'invalid json');
    expect(loadSession()).toBeNull();
  });
});
