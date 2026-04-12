/**
 * Enhanced Gemini Service with Swarm Integration
 *
 * Wraps the base Gemini API with retry logic, rate limiting,
 * and integration with the agent swarm orchestrator.
 */

import { getAIResponse, isGeminiConfigured } from './geminiService';
import { getOrchestrator } from './swarm';
import type { Message, GeminiResponse, ArtifactType } from '../types';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;

const requestTimestamps: number[] = [];

function isRateLimited(): boolean {
  const now = Date.now();
  // Remove timestamps older than the window
  while (requestTimestamps.length > 0 && now - requestTimestamps[0] > RATE_LIMIT_WINDOW_MS) {
    requestTimestamps.shift();
  }
  return requestTimestamps.length >= MAX_REQUESTS_PER_WINDOW;
}

function recordRequest(): void {
  requestTimestamps.push(Date.now());
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get an AI response with automatic retry, rate limiting, and swarm orchestration.
 */
export async function getSwarmAIResponse(history: Message[]): Promise<GeminiResponse> {
  if (!isGeminiConfigured()) {
    throw new Error('Gemini API key is not configured.');
  }

  if (isRateLimited()) {
    throw new Error('Rate limit exceeded. Please wait a moment before sending another request.');
  }

  const orchestrator = getOrchestrator();
  const task = orchestrator.assignTask('orchestrator', 'Processing user request');

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      recordRequest();
      const response = await getAIResponse(history);

      // Route to the appropriate specialist agent based on artifact type
      if (response.artifact?.type) {
        const artifactType = response.artifact.type as ArtifactType;
        const role = orchestrator.routeByArtifactType(artifactType);
        const specialistTask = orchestrator.assignTask(role, `Generating ${artifactType} artifact`);
        orchestrator.completeTask(specialistTask.id, specialistTask.targetRole === role ? `${role}-agent` : specialistTask.targetRole);
      }

      orchestrator.completeTask(task.id, 'orchestrator-prime', {
        artifactType: response.artifact?.type,
      });

      // Store the response in swarm memory for context
      orchestrator.memory.set(
        `last-response-${Date.now()}`,
        { type: response.artifact?.type, echo: response.intentEcho },
        'orchestrator-prime',
        300_000 // 5 min TTL
      );

      return response;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempt < MAX_RETRIES) {
        const backoff = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(`[SwarmService] Attempt ${attempt}/${MAX_RETRIES} failed, retrying in ${backoff}ms...`);
        await delay(backoff);
      }
    }
  }

  orchestrator.failTask(task.id, 'orchestrator-prime', lastError?.message ?? 'Unknown error');
  throw lastError ?? new Error('Failed after maximum retries.');
}

export { isGeminiConfigured };
