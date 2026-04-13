/**
 * State Persistence Service
 *
 * Handles saving and restoring application state (messages, app specification)
 * to localStorage so users don't lose work on page refresh.
 */

import type { Message, AppSpecification } from '../types';
import { INITIAL_APP_SPEC, INITIAL_MESSAGES } from '../constants';

const STORAGE_KEYS = {
  messages: 'ai-app-builder:messages',
  appSpec: 'ai-app-builder:app-specification',
} as const;

/**
 * Save the current session state to localStorage.
 */
export function saveSession(messages: Message[], appSpec: AppSpecification): void {
  try {
    localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages));
    localStorage.setItem(STORAGE_KEYS.appSpec, JSON.stringify(appSpec));
  } catch {
    // Silently fail if localStorage is unavailable or full
  }
}

/**
 * Load a previously saved session from localStorage.
 * Returns null if no saved session exists.
 */
export function loadSession(): { messages: Message[]; appSpec: AppSpecification } | null {
  try {
    const messagesRaw = localStorage.getItem(STORAGE_KEYS.messages);
    const appSpecRaw = localStorage.getItem(STORAGE_KEYS.appSpec);

    if (!messagesRaw || !appSpecRaw) return null;

    const messages: Message[] = JSON.parse(messagesRaw);
    const appSpec: AppSpecification = JSON.parse(appSpecRaw);

    // Basic validation
    if (!Array.isArray(messages) || messages.length === 0) return null;
    if (!appSpec.theme || !appSpec.uiMockup) return null;

    return { messages, appSpec };
  } catch {
    return null;
  }
}

/**
 * Clear saved session data.
 */
export function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.messages);
    localStorage.removeItem(STORAGE_KEYS.appSpec);
  } catch {
    // Silently fail
  }
}

/**
 * Get default session state.
 */
export function getDefaultSession(): { messages: Message[]; appSpec: AppSpecification } {
  return {
    messages: [...INITIAL_MESSAGES],
    appSpec: { ...INITIAL_APP_SPEC },
  };
}
