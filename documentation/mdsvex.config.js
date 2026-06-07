import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Prism from './src/lib/prism-setup.js';

const here = dirname(fileURLToPath(import.meta.url));

const ALIAS = { sh: 'bash', shell: 'bash', js: 'javascript', ts: 'typescript', html: 'markup' };

// Curly braces survive Prism untouched, but Svelte would parse them as
// expressions once the highlighted HTML is inlined into the `.svx` component —
// so escape them (and a literal backslash) after highlighting.
const escapeBraces = (s) =>
  s.replace(/\\/g, '&#92;').replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const highlighter = (code, lang) => {
  const id = ALIAS[lang] ?? lang ?? '';
  const grammar = id && Prism.languages[id];
  const inner = grammar ? Prism.highlight(code, grammar, id) : escapeHtml(code);
  return `<pre class="language-${id || 'none'}"><code class="language-${id || 'none'}">${escapeBraces(inner)}</code></pre>`;
};

/**
 * mdsvex configuration for the docs `.svx` pages.
 *
 * `layout` wraps every Markdown page in a shared prose shell so headings,
 * paragraphs, code, and tables pick up the dssoca tokens consistently — the
 * narrative pages stay plain Markdown while the chrome stays dogfooded.
 *
 * `highlight` replaces mdsvex's default Prism highlighter (which lazy-loads
 * language grammars and warns when one is missing) with a plain, escaped
 * `<pre><code>` block — the Prose layout styles it with the code tokens.
 */
/** @type {import('mdsvex').MdsvexOptions} */
const config = {
  extensions: ['.svx'],
  layout: {
    _: join(here, 'src/lib/layouts/Prose.svelte'),
  },
  highlight: { highlighter },
};

export default config;
