/**
 * Agent Swarm Type Definitions
 *
 * Defines the core contracts for the multi-agent orchestration layer.
 * Each agent is a specialized unit that can receive tasks, produce artifacts,
 * and communicate through a shared message bus.
 */

export type AgentRole =
  | 'orchestrator'
  | 'ui_designer'
  | 'schema_architect'
  | 'frontend_engineer'
  | 'backend_engineer'
  | 'theme_stylist'
  | 'code_reviewer'
  | 'test_engineer'
  | 'devops_engineer'
  | 'security_auditor';

export type AgentStatus = 'idle' | 'working' | 'completed' | 'error';

export type SwarmEventType =
  | 'task:assigned'
  | 'task:completed'
  | 'task:failed'
  | 'agent:status'
  | 'artifact:produced'
  | 'swarm:initialized'
  | 'swarm:reset';

export interface AgentDefinition {
  readonly id: string;
  readonly role: AgentRole;
  readonly name: string;
  readonly description: string;
  readonly capabilities: readonly string[];
  readonly systemPromptExtension: string;
}

export interface AgentState {
  readonly agentId: string;
  status: AgentStatus;
  currentTask: string | null;
  lastActivity: number;
  tasksCompleted: number;
  errors: number;
}

export interface SwarmEvent {
  readonly type: SwarmEventType;
  readonly agentId: string;
  readonly timestamp: number;
  readonly payload: Record<string, unknown>;
}

export type SwarmEventListener = (event: SwarmEvent) => void;

export interface SwarmTask {
  readonly id: string;
  readonly targetRole: AgentRole;
  readonly instruction: string;
  readonly context: Record<string, unknown>;
  readonly priority: number;
  readonly createdAt: number;
}

export interface SwarmMemoryEntry {
  readonly key: string;
  readonly value: unknown;
  readonly agentId: string;
  readonly timestamp: number;
  readonly ttl?: number;
}
