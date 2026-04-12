import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SwarmOrchestrator } from '../services/swarm/orchestrator';
import { AGENT_DEFINITIONS } from '../services/swarm/agents/definitions';

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

describe('SwarmOrchestrator', () => {
  let orchestrator: SwarmOrchestrator;

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    orchestrator = new SwarmOrchestrator();
  });

  it('should initialize with all agents in idle state', () => {
    const states = orchestrator.getAgentStates();
    expect(states).toHaveLength(AGENT_DEFINITIONS.length);
    expect(states.every(s => s.status === 'idle')).toBe(true);
  });

  it('should route artifact types to correct agent roles', () => {
    expect(orchestrator.routeByArtifactType('ui_mockup')).toBe('ui_designer');
    expect(orchestrator.routeByArtifactType('schema')).toBe('schema_architect');
    expect(orchestrator.routeByArtifactType('frontend_code')).toBe('frontend_engineer');
    expect(orchestrator.routeByArtifactType('backend_code')).toBe('backend_engineer');
    expect(orchestrator.routeByArtifactType('theme')).toBe('theme_stylist');
    expect(orchestrator.routeByArtifactType('text')).toBe('orchestrator');
  });

  it('should assign tasks and update agent status', () => {
    const task = orchestrator.assignTask('ui_designer', 'Design a login form');
    expect(task.id).toMatch(/^task-/);
    expect(task.targetRole).toBe('ui_designer');

    const uiAgent = orchestrator.getAgentStates().find(
      a => a.agentId === 'ui-designer-aria'
    );
    expect(uiAgent?.status).toBe('working');
    expect(uiAgent?.currentTask).toBe('Design a login form');
  });

  it('should complete tasks and increment counter', () => {
    const task = orchestrator.assignTask('orchestrator', 'test task');
    orchestrator.completeTask(task.id, 'orchestrator-prime');

    const state = orchestrator.getAgentStates().find(a => a.agentId === 'orchestrator-prime');
    expect(state?.tasksCompleted).toBe(1);
    expect(state?.status).toBe('completed');
  });

  it('should handle task failures', () => {
    const task = orchestrator.assignTask('orchestrator', 'failing task');
    orchestrator.failTask(task.id, 'orchestrator-prime', 'Something went wrong');

    const state = orchestrator.getAgentStates().find(a => a.agentId === 'orchestrator-prime');
    expect(state?.errors).toBe(1);
    expect(state?.status).toBe('error');
  });

  it('should emit events on task lifecycle', () => {
    const events: string[] = [];
    orchestrator.onEvent((event) => events.push(event.type));

    const task = orchestrator.assignTask('orchestrator', 'test');
    orchestrator.completeTask(task.id, 'orchestrator-prime');

    expect(events).toContain('task:assigned');
    expect(events).toContain('task:completed');
  });

  it('should return agent prompt for artifact type', () => {
    const prompt = orchestrator.getAgentPrompt('ui_mockup');
    expect(prompt).toContain('UI design');
  });

  it('should reset the swarm', () => {
    orchestrator.assignTask('orchestrator', 'test');
    orchestrator.reset();

    const states = orchestrator.getAgentStates();
    expect(states.every(s => s.status === 'idle')).toBe(true);
    expect(states.every(s => s.tasksCompleted === 0)).toBe(true);
  });
});
