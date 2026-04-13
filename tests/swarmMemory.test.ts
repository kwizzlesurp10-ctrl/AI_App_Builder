import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SwarmMemory } from '../services/swarm/memory/swarmMemory';

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

describe('SwarmMemory', () => {
  let memory: SwarmMemory;

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    memory = new SwarmMemory();
  });

  it('should set and get values', () => {
    memory.set('key1', 'value1', 'agent-1');
    expect(memory.get('key1')).toBe('value1');
  });

  it('should return undefined for missing keys', () => {
    expect(memory.get('nonexistent')).toBeUndefined();
  });

  it('should check key existence', () => {
    memory.set('exists', true, 'agent-1');
    expect(memory.has('exists')).toBe(true);
    expect(memory.has('missing')).toBe(false);
  });

  it('should delete keys', () => {
    memory.set('key1', 'value1', 'agent-1');
    expect(memory.delete('key1')).toBe(true);
    expect(memory.get('key1')).toBeUndefined();
  });

  it('should filter entries by agent', () => {
    memory.set('a', 1, 'agent-1');
    memory.set('b', 2, 'agent-2');
    memory.set('c', 3, 'agent-1');

    const entries = memory.getByAgent('agent-1');
    expect(entries).toHaveLength(2);
    expect(entries.map(e => e.key).sort()).toEqual(['a', 'c']);
  });

  it('should clear all entries', () => {
    memory.set('a', 1, 'agent-1');
    memory.set('b', 2, 'agent-2');
    memory.clear();
    expect(memory.has('a')).toBe(false);
    expect(memory.has('b')).toBe(false);
  });

  it('should expire entries with TTL', () => {
    // Set an entry with a very short TTL
    memory.set('temp', 'value', 'agent-1', 1); // 1ms TTL

    // Wait for expiry
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(memory.get('temp')).toBeUndefined();
        resolve();
      }, 10);
    });
  });

  it('should persist to localStorage', () => {
    memory.set('persist', 'data', 'agent-1');
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should provide a snapshot', () => {
    memory.set('x', 1, 'a');
    memory.set('y', 2, 'b');
    const snap = memory.snapshot();
    expect(snap.size).toBe(2);
  });
});
