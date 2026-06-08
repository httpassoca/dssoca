// Prism singleton + the language grammars the docs use. Importing `prismjs`
// first evaluates the core (which registers itself globally), so the component
// modules below — and mdsvex's own highlighter, which shares this exact module
// instance — find their dependencies. Order matters: markup → clike → the rest.
import Prism from 'prismjs';
import 'prismjs/components/prism-markup.js';
import 'prismjs/components/prism-clike.js';
import 'prismjs/components/prism-javascript.js';
import 'prismjs/components/prism-typescript.js';
import 'prismjs/components/prism-bash.js';
import 'prismjs/components/prism-css.js';
import 'prismjs/components/prism-json.js';
import 'prism-svelte';

export default Prism;
