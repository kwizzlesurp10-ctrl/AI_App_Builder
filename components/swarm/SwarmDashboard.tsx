import React, { useState, useEffect, useCallback } from 'react';
import { getOrchestrator, AGENT_DEFINITIONS } from '../../services/swarm';
import type { AgentState, SwarmEvent } from '../../services/swarm';

const statusColors: Record<string, string> = {
  idle: 'bg-gray-600',
  working: 'bg-amber-500 animate-pulse',
  completed: 'bg-green-500',
  error: 'bg-red-500',
};

const statusLabels: Record<string, string> = {
  idle: 'Idle',
  working: 'Working',
  completed: 'Done',
  error: 'Error',
};

const AgentCard: React.FC<{ state: AgentState }> = ({ state }) => {
  const definition = AGENT_DEFINITIONS.find(d => d.id === state.agentId);
  if (!definition) return null;

  return (
    <div className="flex items-center gap-3 p-2 rounded-md bg-gray-800/50 border border-gray-700/50">
      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusColors[state.status]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-200 truncate">{definition.name}</p>
        {state.currentTask && (
          <p className="text-[10px] text-gray-500 truncate">{state.currentTask}</p>
        )}
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-[10px] text-gray-500">{statusLabels[state.status]}</span>
        {state.tasksCompleted > 0 && (
          <span className="text-[10px] bg-gray-700 text-gray-400 px-1.5 rounded-full">
            {state.tasksCompleted}
          </span>
        )}
      </div>
    </div>
  );
};

interface SwarmDashboardProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export const SwarmDashboard: React.FC<SwarmDashboardProps> = ({ isExpanded, onToggle }) => {
  const [agentStates, setAgentStates] = useState<AgentState[]>([]);
  const [recentEvents, setRecentEvents] = useState<SwarmEvent[]>([]);

  const refreshStates = useCallback(() => {
    const orchestrator = getOrchestrator();
    setAgentStates(orchestrator.getAgentStates());
  }, []);

  useEffect(() => {
    refreshStates();

    const orchestrator = getOrchestrator();
    const unsubscribe = orchestrator.onEvent((event) => {
      refreshStates();
      setRecentEvents(prev => [...prev.slice(-19), event]);
    });

    return unsubscribe;
  }, [refreshStates]);

  const activeCount = agentStates.filter(a => a.status === 'working').length;
  const totalTasks = agentStates.reduce((sum, a) => sum + a.tasksCompleted, 0);

  return (
    <div className="border-t border-gray-800 bg-gray-900">
      {/* Header - always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-800/50 transition-colors"
        aria-expanded={isExpanded}
        aria-label="Toggle agent swarm dashboard"
      >
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <span className="text-xs font-medium text-gray-300">Agent Swarm</span>
          <span className="text-[10px] bg-gray-700 text-gray-400 px-1.5 rounded-full">
            {AGENT_DEFINITIONS.length} agents
          </span>
          {activeCount > 0 && (
            <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 rounded-full animate-pulse">
              {activeCount} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500">{totalTasks} tasks completed</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-3 space-y-1.5 max-h-64 overflow-y-auto">
          {agentStates.map(state => (
            <AgentCard key={state.agentId} state={state} />
          ))}

          {recentEvents.length > 0 && (
            <div className="mt-3 pt-2 border-t border-gray-800">
              <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider">Recent Activity</p>
              <div className="space-y-0.5 max-h-20 overflow-y-auto">
                {recentEvents.slice(-5).reverse().map((event, i) => (
                  <p key={i} className="text-[10px] text-gray-600 truncate">
                    <span className="text-gray-500">{new Date(event.timestamp).toLocaleTimeString()}</span>
                    {' · '}
                    {event.type.replace(':', ' ')}
                    {' · '}
                    {event.agentId}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
