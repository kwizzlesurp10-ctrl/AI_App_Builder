/**
 * Input Sanitization Utilities
 *
 * Provides functions to sanitize user input and prevent XSS attacks.
 */

const HTML_ENTITY_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
};

/**
 * Escape HTML entities to prevent XSS when rendering user content.
 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, char => HTML_ENTITY_MAP[char] ?? char);
}

/**
 * Sanitize user message input: trim, limit length, remove control characters.
 */
export function sanitizeInput(input: string, maxLength = 10_000): string {
  // Remove null bytes and other control characters (keep newlines and tabs)
  // eslint-disable-next-line no-control-regex
  const cleaned = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  return cleaned.trim().slice(0, maxLength);
}

/**
 * Convert markdown-like bold to <strong> tags safely.
 * Only allows bold markers in text content that has been escaped.
 */
export function safeBoldMarkdown(escaped: string): string {
  return escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

/**
 * Convert newlines to <br /> tags for safe HTML rendering.
 */
export function newlinesToBreaks(text: string): string {
  return text.replace(/\n/g, '<br />');
}

/**
 * Full sanitization pipeline for rendering user/model messages.
 */
export function sanitizeForDisplay(content: string): string {
  const escaped = escapeHtml(content);
  const withBold = safeBoldMarkdown(escaped);
  return newlinesToBreaks(withBold);
}
