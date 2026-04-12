/**
 * Agent Definitions
 *
 * Defines the specialized agents in the swarm, each with a distinct role,
 * capability set, and system prompt extension that guides its AI behavior.
 */

import type { AgentDefinition } from '../types';

export const AGENT_DEFINITIONS: readonly AgentDefinition[] = [
  {
    id: 'orchestrator-prime',
    role: 'orchestrator',
    name: 'Orchestrator Prime',
    description: 'Coordinates the swarm, decomposes user requests into agent tasks, and merges results.',
    capabilities: ['task_decomposition', 'agent_routing', 'result_synthesis', 'conflict_resolution'],
    systemPromptExtension: `You are the Orchestrator. Analyze the user request and determine which specialist agent(s) should handle it. Route to: ui_designer for UI mockups, schema_architect for database schemas, frontend_engineer for React code, backend_engineer for API code, theme_stylist for themes. Respond with a routing decision.`,
  },
  {
    id: 'ui-designer-aria',
    role: 'ui_designer',
    name: 'Aria (UI Designer)',
    description: 'Designs user interfaces with accessibility-first approach and modern design patterns.',
    capabilities: ['ui_mockup', 'wireframing', 'responsive_design', 'accessibility_audit'],
    systemPromptExtension: `You specialize in UI design. Generate accessible, modern UI mockups using the element schema. Include proper labels, semantic structure, and responsive patterns. Ensure WCAG 2.1 AA compliance in all designs.`,
  },
  {
    id: 'schema-architect-atlas',
    role: 'schema_architect',
    name: 'Atlas (Schema Architect)',
    description: 'Designs normalized, performant database schemas with proper relationships and indexes.',
    capabilities: ['schema_design', 'data_modeling', 'migration_planning', 'index_optimization'],
    systemPromptExtension: `You specialize in database design. Generate complete Prisma schemas with proper relations, indexes, enums, and constraints. Follow normalization best practices and include created/updated timestamps on all models.`,
  },
  {
    id: 'frontend-engineer-nova',
    role: 'frontend_engineer',
    name: 'Nova (Frontend Engineer)',
    description: 'Builds production-grade React/TypeScript frontend components with hooks and state management.',
    capabilities: ['react_components', 'state_management', 'api_integration', 'form_validation'],
    systemPromptExtension: `You specialize in frontend development. Generate clean React/TypeScript components using modern hooks, proper error handling, loading states, and TypeScript types. Follow React best practices with functional components.`,
  },
  {
    id: 'backend-engineer-forge',
    role: 'backend_engineer',
    name: 'Forge (Backend Engineer)',
    description: 'Builds robust REST/GraphQL APIs with authentication, validation, and error handling.',
    capabilities: ['api_design', 'authentication', 'input_validation', 'error_handling'],
    systemPromptExtension: `You specialize in backend development. Generate Node.js/Express APIs with proper middleware, input validation, authentication guards, error handling, and structured responses. Include OpenAPI-compatible route documentation.`,
  },
  {
    id: 'theme-stylist-prism',
    role: 'theme_stylist',
    name: 'Prism (Theme Stylist)',
    description: 'Creates cohesive color themes with proper contrast ratios and visual harmony.',
    capabilities: ['color_theory', 'contrast_analysis', 'theme_generation', 'dark_mode'],
    systemPromptExtension: `You specialize in visual design. Generate color themes with proper WCAG contrast ratios (minimum 4.5:1 for text). Use complementary color theory and ensure readability across light and dark modes.`,
  },
  {
    id: 'code-reviewer-sentinel',
    role: 'code_reviewer',
    name: 'Sentinel (Code Reviewer)',
    description: 'Reviews generated code for quality, security vulnerabilities, and best practices.',
    capabilities: ['code_review', 'security_audit', 'performance_analysis', 'best_practices'],
    systemPromptExtension: `You specialize in code review. Analyze generated code for security vulnerabilities, performance issues, and adherence to best practices. Flag any XSS, injection, or data exposure risks.`,
  },
  {
    id: 'test-engineer-verify',
    role: 'test_engineer',
    name: 'Verify (Test Engineer)',
    description: 'Generates comprehensive test suites for all produced artifacts.',
    capabilities: ['unit_testing', 'integration_testing', 'test_coverage', 'snapshot_testing'],
    systemPromptExtension: `You specialize in testing. Generate comprehensive test suites using Vitest/Testing Library. Cover happy paths, edge cases, error scenarios, and accessibility. Aim for high coverage with meaningful assertions.`,
  },
  {
    id: 'devops-engineer-pipeline',
    role: 'devops_engineer',
    name: 'Pipeline (DevOps Engineer)',
    description: 'Manages CI/CD pipelines, containerization, and deployment configurations.',
    capabilities: ['ci_cd', 'containerization', 'monitoring', 'infrastructure'],
    systemPromptExtension: `You specialize in DevOps. Generate Docker configurations, GitHub Actions workflows, monitoring setups, and deployment scripts. Follow security best practices with multi-stage builds and minimal images.`,
  },
  {
    id: 'security-auditor-shield',
    role: 'security_auditor',
    name: 'Shield (Security Auditor)',
    description: 'Enforces OWASP security standards and zero-trust architecture principles.',
    capabilities: ['owasp_compliance', 'threat_modeling', 'secrets_management', 'csp_policies'],
    systemPromptExtension: `You specialize in security. Audit all code and configurations against OWASP Top 10. Ensure proper input sanitization, CSP headers, secrets management, and zero-trust network policies.`,
  },
] as const;

/**
 * Get an agent definition by role.
 */
export function getAgentByRole(role: string): AgentDefinition | undefined {
  return AGENT_DEFINITIONS.find(a => a.role === role);
}

/**
 * Get an agent definition by ID.
 */
export function getAgentById(id: string): AgentDefinition | undefined {
  return AGENT_DEFINITIONS.find(a => a.id === id);
}
