import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import mdsvexConfig from './mdsvex.config.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Pages: both real .svelte files and mdsvex `.svx` Markdown pages.
  extensions: ['.svelte', ...mdsvexConfig.extensions],

  // `mdsvex` runs first (it only touches .svx); `vitePreprocess` then handles
  // <style lang="scss"> in both the docs chrome AND the dssoca source
  // components we import from ../src/lib (dogfooding the real components).
  preprocess: [mdsvex(mdsvexConfig), vitePreprocess()],

  compilerOptions: {
    // Match the library: runes everywhere except node_modules. The dssoca
    // source we pull in from ../src/lib must compile in runes mode too.
    // Exception: mdsvex's `.svx` output uses `$$props`, so it must stay legacy
    // (it contains no runes of its own — only Markdown + the layout wrapper).
    runes: ({ filename }) => {
      if (filename.split(/[/\\]/).includes('node_modules')) return undefined;
      if (filename.endsWith('.svx')) return false;
      return true;
    },
  },

  kit: {
    // Static build → `documentation/build/` (`pnpm docs:build`; `… preview` to
    // serve it locally). Deployed to Vercel as a static site (see `vercel.json`
    // at the repo root): served from the domain root, so no base path is needed.
    // The `404.html` fallback doubles as Vercel's not-found page.
    adapter: adapter({ fallback: '404.html' }),

    // Dogfood the design system by importing its SOURCE from the repo above.
    // `kit.alias` feeds both Vite and the generated tsconfig (intellisense),
    // so there's no separate tsconfig `paths` to drift.
    alias: {
      dssoca: '../src/lib/index.ts',
      '@dssoca/styles': '../src/styles',
      '@dssoca/lib': '../src/lib',
    },
  },
};

export default config;
