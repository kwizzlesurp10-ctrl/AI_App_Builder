import { describe, it, expect } from 'vitest';
import {
  escapeHtml,
  sanitizeInput,
  safeBoldMarkdown,
  newlinesToBreaks,
  sanitizeForDisplay,
} from '../services/sanitize';

describe('sanitize', () => {
  describe('escapeHtml', () => {
    it('should escape HTML entities', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
    });

    it('should escape ampersands', () => {
      expect(escapeHtml('a & b')).toBe('a &amp; b');
    });

    it('should escape single quotes', () => {
      expect(escapeHtml("it's")).toBe('it&#x27;s');
    });

    it('should handle empty string', () => {
      expect(escapeHtml('')).toBe('');
    });

    it('should not modify clean strings', () => {
      expect(escapeHtml('hello world')).toBe('hello world');
    });
  });

  describe('sanitizeInput', () => {
    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello');
    });

    it('should remove control characters', () => {
      expect(sanitizeInput('hello\x00world')).toBe('helloworld');
    });

    it('should preserve newlines', () => {
      expect(sanitizeInput('line1\nline2')).toBe('line1\nline2');
    });

    it('should enforce max length', () => {
      expect(sanitizeInput('hello world', 5)).toBe('hello');
    });

    it('should handle empty input', () => {
      expect(sanitizeInput('')).toBe('');
    });
  });

  describe('safeBoldMarkdown', () => {
    it('should convert bold markers to strong tags', () => {
      expect(safeBoldMarkdown('this is **bold** text')).toBe(
        'this is <strong>bold</strong> text'
      );
    });

    it('should handle multiple bold sections', () => {
      expect(safeBoldMarkdown('**a** and **b**')).toBe(
        '<strong>a</strong> and <strong>b</strong>'
      );
    });

    it('should not affect unmatched asterisks', () => {
      expect(safeBoldMarkdown('a * b')).toBe('a * b');
    });
  });

  describe('newlinesToBreaks', () => {
    it('should convert newlines to br tags', () => {
      expect(newlinesToBreaks('a\nb')).toBe('a<br />b');
    });
  });

  describe('sanitizeForDisplay', () => {
    it('should escape HTML and format markdown', () => {
      const result = sanitizeForDisplay('Hello **world**\n<script>xss</script>');
      expect(result).toContain('<strong>world</strong>');
      expect(result).toContain('&lt;script&gt;');
      expect(result).toContain('<br />');
      expect(result).not.toContain('<script>');
    });
  });
});
