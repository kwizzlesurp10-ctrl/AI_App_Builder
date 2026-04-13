/**
 * Swarm Orchestrator
 *
 * The central coordinator that manages the agent swarm lifecycle.
 * It routes user requests to the appropriate specialized agents,
 * tracks agent states, and provides swarm status to the UI.
 */

import type {
  AgentRole,
  AgentState,
  SwarmEvent,
  SwarmTask,
} from './types';
import { MessageBus } from './messageBus';
import { SwarmMemory } from './memory/swarmMemory';
import { AGENT_DEFINITIONS, getAgentByRole } from './agents/definitions';
import type { ArtifactType } from '../../types';

export class SwarmOrchestrator {
  readonly bus: MessageBus;
  readonly memory: SwarmMemory;
  private agentStates: Map<string, AgentState>;
  private taskQueue: SwarmTask[] = [];
  private taskIdCounter = 0;

  constructor() {
    this.bus = new MessageBus();
    this.memory = new SwarmMemory();
    this.agentStates = new Map();

    // Initialize agent states from definitions
    for (const def of AGENT_DEFINITIONS) {
      this.agentStates.set(def.id, {
        agentId: def.id,
        status: 'idle',
        currentTask: null,
        lastActivity: Date.now(),
        tasksCompleted: 0,
        errors: 0,
      });
    }

    this.bus.emit({
      type: 'swarm:initialized',
      agentId: 'orchestrator-prime',
      timestamp: Date.now(),
      payload: { agentCount: AGENT_DEFINITIONS.length },
    });
  }

  /**
   * Determine which agent role should handle a given artifact type.
   */
  routeByArtifactType(artifactType: ArtifactType): AgentRole {
    const routingMap: Record<ArtifactType, AgentRole> = {
      ui_mockup: 'ui_designer',
      schema: 'schema_architect',
      frontend_code: 'frontend_engineer',
      backend_code: 'backend_engineer',
      theme: 'theme_stylist',
      text: 'orchestrator',
    };
    return routingMap[artifactType] ?? 'orchestrator';
  }

  /**
   * Assign a task to an agent by role.
   */
  assignTask(role: AgentRole, instruction: string, context: Record<string, unknown> = {}): SwarmTask {
    const task: SwarmTask = {
      id: `task-${++this.taskIdCounter}`,
      targetRole: role,
      instruction,
      context,
      priority: 1,
      createdAt: Date.now(),
    };

    this.taskQueue.push(task);

    const agentDef = getAgentByRole(role);
    if (agentDef) {
      this.updateAgentStatus(agentDef.id, 'working', instruction);
      this.bus.emit({
        type: 'task:assigned',
        agentId: agentDef.id,
        timestamp: Date.now(),
        payload: { taskId: task.id, instruction },
      });
    }

    return task;
  }

  /**
   * Mark a task as completed by an agent.
   */
  completeTask(taskId: string, agentId: string, result: Record<string, unknown> = {}): void {
    this.taskQueue = this.taskQueue.filter(t => t.id !== taskId);

    const state = this.agentStates.get(agentId);
    if (state) {
      state.status = 'completed';
      state.currentTask = null;
      state.lastActivity = Date.now();
      state.tasksCompleted += 1;
    }

    this.bus.emit({
      type: 'task:completed',
      agentId,
      timestamp: Date.now(),
      payload: { taskId, ...result },
    });

    // Reset to idle after a short delay for UI visibility
    setTimeout(() => {
      if (state && state.status === 'completed') {
        state.status = 'idle';
        state.currentTask = null;
      }
    }, 2000);
  }

  /**
   * Mark a task as failed.
   */
  failTask(taskId: string, agentId: string, error: string): void {
    this.taskQueue = this.taskQueue.filter(t => t.id !== taskId);

    const state = this.agentStates.get(agentId);
    if (state) {
      state.status = 'error';
      state.currentTask = null;
      state.lastActivity = Date.now();
      state.errors += 1;
    }

    this.bus.emit({
      type: 'task:failed',
      agentId,
      timestamp: Date.now(),
      payload: { taskId, error },
    });
  }

  /**
   * Get the current state of all agents.
   */
  getSwarmStatus(): ReadonlyMap<string, AgentState> {
    return this.agentStates;
  }

  /**
   * Get agent states as an array (useful for rendering).
   */
  getAgentStates(): AgentState[] {
    return Array.from(this.agentStates.values());
  }

  /**
   * Get the system prompt extension for an agent by artifact type.
   */
  getAgentPrompt(artifactType: ArtifactType): string {
    const role = this.routeByArtifactType(artifactType);
    const def = getAgentByRole(role);
    return def?.systemPromptExtension ?? '';
  }

  /**
   * Subscribe to swarm events.
   */
  onEvent(listener: (event: SwarmEvent) => void): () => void {
    return this.bus.on('*', listener);
  }

  /**
   * Reset the entire swarm to initial state.
   */
  reset(): void {
    this.taskQueue = [];
    this.taskIdCounter = 0;

    for (const [, state] of this.agentStates) {
      state.status = 'idle';
      state.currentTask = null;
      state.tasksCompleted = 0;
      state.errors = 0;
    }

    this.memory.clear();

    this.bus.emit({
      type: 'swarm:reset',
      agentId: 'orchestrator-prime',
      timestamp: Date.now(),
      payload: {},
    });
  }

  private updateAgentStatus(agentId: string, status: AgentState['status'], task: string | null): void {
    const state = this.agentStates.get(agentId);
    if (state) {
      state.status = status;
      state.currentTask = task;
      state.lastActivity = Date.now();
    }
  }
}

/**
 * Singleton swarm orchestrator instance.
 */
let orchestratorInstance: SwarmOrchestrator | null = null;

export function getOrchestrator(): SwarmOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new SwarmOrchestrator();
  }
  return orchestratorInstance;
}
