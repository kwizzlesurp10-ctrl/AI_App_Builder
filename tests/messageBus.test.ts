import { describe, it, expect, beforeEach } from 'vitest';
import { MessageBus } from '../services/swarm/messageBus';
import type { SwarmEvent } from '../services/swarm/types';

describe('MessageBus', () => {
  let bus: MessageBus;

  beforeEach(() => {
    bus = new MessageBus();
  });

  it('should emit and receive events for specific type', () => {
    const received: SwarmEvent[] = [];
    bus.on('task:assigned', (event) => received.push(event));

    const event: SwarmEvent = {
      type: 'task:assigned',
      agentId: 'test-agent',
      timestamp: Date.now(),
      payload: { taskId: 'task-1' },
    };
    bus.emit(event);

    expect(received).toHaveLength(1);
    expect(received[0].agentId).toBe('test-agent');
  });

  it('should receive all events with wildcard listener', () => {
    const received: SwarmEvent[] = [];
    bus.on('*', (event) => received.push(event));

    bus.emit({
      type: 'task:assigned',
      agentId: 'a',
      timestamp: Date.now(),
      payload: {},
    });
    bus.emit({
      type: 'task:completed',
      agentId: 'b',
      timestamp: Date.now(),
      payload: {},
    });

    expect(received).toHaveLength(2);
  });

  it('should unsubscribe correctly', () => {
    const received: SwarmEvent[] = [];
    const unsubscribe = bus.on('task:assigned', (event) => received.push(event));

    bus.emit({
      type: 'task:assigned',
      agentId: 'a',
      timestamp: Date.now(),
      payload: {},
    });

    unsubscribe();

    bus.emit({
      type: 'task:assigned',
      agentId: 'b',
      timestamp: Date.now(),
      payload: {},
    });

    expect(received).toHaveLength(1);
    expect(received[0].agentId).toBe('a');
  });

  it('should maintain event log', () => {
    bus.emit({
      type: 'task:assigned',
      agentId: 'a',
      timestamp: Date.now(),
      payload: {},
    });

    const log = bus.getLog();
    expect(log).toHaveLength(1);
  });

  it('should filter event log by type', () => {
    bus.emit({ type: 'task:assigned', agentId: 'a', timestamp: Date.now(), payload: {} });
    bus.emit({ type: 'task:completed', agentId: 'b', timestamp: Date.now(), payload: {} });

    expect(bus.getLog('task:assigned')).toHaveLength(1);
    expect(bus.getLog('task:completed')).toHaveLength(1);
  });

  it('should respect max log size', () => {
    const smallBus = new MessageBus(3);
    for (let i = 0; i < 5; i++) {
      smallBus.emit({ type: 'task:assigned', agentId: `agent-${i}`, timestamp: i, payload: {} });
    }
    expect(smallBus.getLog()).toHaveLength(3);
  });

  it('should reset cleanly', () => {
    bus.on('task:assigned', () => {});
    bus.emit({ type: 'task:assigned', agentId: 'a', timestamp: Date.now(), payload: {} });
    bus.reset();
    expect(bus.getLog()).toHaveLength(0);
  });
});
