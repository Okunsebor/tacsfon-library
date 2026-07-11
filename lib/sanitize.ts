/**
 * Safely sanitizes an HTML string by stripping script tags, event handlers (on*),
 * and other dangerous elements to prevent Cross-Site Scripting (XSS).
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  // Remove script tags and their content
  let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers (e.g., onload, onerror, onclick) inside tags
  cleaned = cleaned.replace(/on\w+\s*=\s*(['"])(.*?)\1/gi, '');
  cleaned = cleaned.replace(/on\w+\s*=\s*([^>\s]+)/gi, '');

  // Remove javascript: pseudo-protocol links
  cleaned = cleaned.replace(/href\s*=\s*(['"])javascript:(.*?)\1/gi, 'href="#"');
  cleaned = cleaned.replace(/href\s*=\s*javascript:([^>\s]+)/gi, 'href="#"');

  // Strip iframe, embed, object, and meta tags
  cleaned = cleaned.replace(/<(iframe|embed|object|meta|link)\b[^>]*>/gi, '');
  cleaned = cleaned.replace(/<\/(iframe|embed|object|meta|link)>/gi, '');

  return cleaned;
}
