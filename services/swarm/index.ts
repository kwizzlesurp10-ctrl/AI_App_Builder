/**
 * Swarm Module Public API
 *
 * Re-exports the core swarm components for use throughout the application.
 */

export { SwarmOrchestrator, getOrchestrator } from './orchestrator';
export { MessageBus } from './messageBus';
export { SwarmMemory } from './memory/swarmMemory';
export { AGENT_DEFINITIONS, getAgentByRole, getAgentById } from './agents/definitions';
export type {
  AgentRole,
  AgentStatus,
  AgentDefinition,
  AgentState,
  SwarmEvent,
  SwarmEventType,
  SwarmEventListener,
  SwarmTask,
  SwarmMemoryEntry,
} from './types';
