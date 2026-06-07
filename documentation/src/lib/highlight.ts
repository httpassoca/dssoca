import Prism from './prism-setup.js';

// Common fence aliases → the registered Prism language ids.
const ALIAS: Record<string, string> = {
  sh: 'bash',
  shell: 'bash',
  js: 'javascript',
  ts: 'typescript',
  html: 'markup',
  svelte: 'svelte',
};

/**
 * Highlight a code string into Prism token markup (the inner HTML of a
 * `<code>` element). Token colours come from the `--ss-code-*` CSS variables
 * via `code.css`, so highlighting follows the theme axis automatically. Falls
 * back to escaped, untokenised text for unknown languages.
 */
export function highlight(code: string, lang?: string): string {
  const id = ALIAS[lang ?? ''] ?? lang ?? '';
  const grammar = id ? Prism.languages[id] : undefined;
  if (!grammar) return escapeHtml(code);
  return Prism.highlight(code, grammar, id);
}

/** Resolve a fence language to its Prism id (for the `language-*` class). */
export function langClass(lang?: string): string {
  return ALIAS[lang ?? ''] ?? lang ?? 'none';
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
