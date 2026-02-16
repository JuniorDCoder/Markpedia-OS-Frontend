export function sanitizeRichText(html: string): string {
  if (!html) return '';

  let safe = html;

  // Remove script/style/iframe/object/embed tags and their content.
  safe = safe.replace(/<\s*(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '');

  // Remove inline event handlers: onclick=, onerror=, etc.
  safe = safe.replace(/\son[a-z]+\s*=\s*(["']).*?\1/gi, '');
  safe = safe.replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, '');

  // Block javascript: and data: URLs in href/src.
  safe = safe.replace(/\s(href|src)\s*=\s*(["'])\s*(javascript:|data:).*?\2/gi, '');

  return safe;
}

export function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isRichTextEmpty(html: string): boolean {
  return stripHtml(html).length === 0;
}

export function normalizeRichTextValue(value: string): string {
  if (!value) return '';
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(value);
  if (looksLikeHtml) return value;
  // Convert plain text line breaks to <br> for better first render in editor.
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}
