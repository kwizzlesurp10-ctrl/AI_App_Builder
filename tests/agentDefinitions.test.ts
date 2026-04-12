import { describe, it, expect } from 'vitest';
import { getAgentByRole, getAgentById, AGENT_DEFINITIONS } from '../services/swarm/agents/definitions';

describe('Agent Definitions', () => {
  it('should have at least 8 agents defined', () => {
    expect(AGENT_DEFINITIONS.length).toBeGreaterThanOrEqual(8);
  });

  it('should have unique agent IDs', () => {
    const ids = AGENT_DEFINITIONS.map(a => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have unique agent roles', () => {
    const roles = AGENT_DEFINITIONS.map(a => a.role);
    expect(new Set(roles).size).toBe(roles.length);
  });

  it('should find agent by role', () => {
    const agent = getAgentByRole('ui_designer');
    expect(agent).toBeDefined();
    expect(agent!.name).toBe('Aria (UI Designer)');
  });

  it('should find agent by ID', () => {
    const agent = getAgentById('orchestrator-prime');
    expect(agent).toBeDefined();
    expect(agent!.role).toBe('orchestrator');
  });

  it('should return undefined for unknown role', () => {
    expect(getAgentByRole('nonexistent')).toBeUndefined();
  });

  it('should return undefined for unknown ID', () => {
    expect(getAgentById('nonexistent')).toBeUndefined();
  });

  it('should have non-empty capabilities for all agents', () => {
    for (const agent of AGENT_DEFINITIONS) {
      expect(agent.capabilities.length).toBeGreaterThan(0);
    }
  });

  it('should have system prompt extensions for all agents', () => {
    for (const agent of AGENT_DEFINITIONS) {
      expect(agent.systemPromptExtension.length).toBeGreaterThan(0);
    }
  });
});
