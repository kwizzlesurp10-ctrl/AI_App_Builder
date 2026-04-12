/**
 * Swarm Memory
 *
 * Provides shared persistent memory for the agent swarm.
 * Agents can store and retrieve key-value data that persists
 * across sessions via localStorage.
 */

import type { SwarmMemoryEntry } from '../types';

const STORAGE_KEY = 'ai-app-builder:swarm-memory';

export class SwarmMemory {
  private entries = new Map<string, SwarmMemoryEntry>();

  constructor() {
    this.load();
  }

  /**
   * Store a value in shared memory.
   */
  set(key: string, value: unknown, agentId: string, ttl?: number): void {
    const entry: SwarmMemoryEntry = {
      key,
      value,
      agentId,
      timestamp: Date.now(),
      ttl,
    };
    this.entries.set(key, entry);
    this.persist();
  }

  /**
   * Retrieve a value from shared memory.
   * Returns undefined if the entry does not exist or has expired.
   */
  get<T = unknown>(key: string): T | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;

    if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
      this.entries.delete(key);
      this.persist();
      return undefined;
    }

    return entry.value as T;
  }

  /**
   * Check if a key exists and is not expired.
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * Remove a specific key.
   */
  delete(key: string): boolean {
    const result = this.entries.delete(key);
    if (result) this.persist();
    return result;
  }

  /**
   * Get all entries for a specific agent.
   */
  getByAgent(agentId: string): SwarmMemoryEntry[] {
    return Array.from(this.entries.values()).filter(e => e.agentId === agentId);
  }

  /**
   * Clear all memory.
   */
  clear(): void {
    this.entries.clear();
    this.persist();
  }

  /**
   * Get a snapshot of all current entries.
   */
  snapshot(): ReadonlyMap<string, SwarmMemoryEntry> {
    return new Map(this.entries);
  }

  private persist(): void {
    try {
      const data = Array.from(this.entries.entries());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // localStorage may be unavailable in some environments
    }
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data: [string, SwarmMemoryEntry][] = JSON.parse(raw);
        this.entries = new Map(data);
        this.pruneExpired();
      }
    } catch {
      this.entries = new Map();
    }
  }

  private pruneExpired(): void {
    const now = Date.now();
    let changed = false;
    for (const [key, entry] of this.entries) {
      if (entry.ttl && now - entry.timestamp > entry.ttl) {
        this.entries.delete(key);
        changed = true;
      }
    }
    if (changed) this.persist();
  }
}
