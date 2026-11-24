/**
 * What counts as focusable (DS-0197): the selector a surface uses to find where focus goes when
 * it opens. A string only — the caller runs the query, so the core stays DOM-free.
 */
export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'summary',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')
