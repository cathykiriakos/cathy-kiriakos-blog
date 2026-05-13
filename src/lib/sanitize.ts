import DOMPurify from 'dompurify';

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 's', 'span', 'div',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'a', 'img',
  'blockquote', 'code', 'pre',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'hr', 'sub', 'sup',
];

const ALLOWED_ATTR = ['href', 'src', 'alt', 'title', 'class', 'style', 'target', 'rel', 'id'];

/**
 * Sanitize untrusted HTML before rendering with dangerouslySetInnerHTML.
 * Strips <script>, event handlers, javascript: URLs, etc.
 */
export const sanitizeHtml = (html: string): string =>
  DOMPurify.sanitize(html ?? '', {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: /^(?:https?|mailto|tel|#|\/):/i,
  });
