/**
 * Swarm Message Bus
 *
 * A lightweight publish/subscribe event bus that enables communication
 * between agents in the swarm. Supports typed events, wildcard
 * subscriptions, and automatic cleanup.
 */

import type { SwarmEvent, SwarmEventType, SwarmEventListener } from './types';

export class MessageBus {
  private listeners = new Map<string, Set<SwarmEventListener>>();
  private eventLog: SwarmEvent[] = [];
  private readonly maxLogSize: number;

  constructor(maxLogSize = 500) {
    this.maxLogSize = maxLogSize;
  }

  /**
   * Subscribe to a specific event type or '*' for all events.
   * Returns an unsubscribe function.
   */
  on(eventType: SwarmEventType | '*', listener: SwarmEventListener): () => void {
    const key = eventType;
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(listener);

    return () => {
      this.listeners.get(key)?.delete(listener);
    };
  }

  /**
   * Publish an event to all matching subscribers.
   */
  emit(event: SwarmEvent): void {
    this.eventLog.push(event);
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog = this.eventLog.slice(-this.maxLogSize);
    }

    // Notify specific listeners
    this.listeners.get(event.type)?.forEach(fn => {
      try {
        fn(event);
      } catch (err) {
        console.error(`[MessageBus] Listener error for ${event.type}:`, err);
      }
    });

    // Notify wildcard listeners
    this.listeners.get('*')?.forEach(fn => {
      try {
        fn(event);
      } catch (err) {
        console.error(`[MessageBus] Wildcard listener error:`, err);
      }
    });
  }

  /**
   * Get recent events, optionally filtered by type.
   */
  getLog(filter?: SwarmEventType): readonly SwarmEvent[] {
    if (filter) {
      return this.eventLog.filter(e => e.type === filter);
    }
    return [...this.eventLog];
  }

  /**
   * Clear all listeners and event log.
   */
  reset(): void {
    this.listeners.clear();
    this.eventLog = [];
  }
}
