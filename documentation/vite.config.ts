import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

// Repo root (one level up from documentation/). The docs app dogfoods the
// design system by importing its SOURCE — components from ../src/lib and the
// global stylesheet from ../src/styles (wired via `kit.alias` in
// svelte.config.js) — rather than the built dist. That keeps the docs in
// lock-step with the working tree and needs no build step first.
const repoRoot = fileURLToPath(new URL('..', import.meta.url))

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    fs: {
      // Allow Vite to read the dssoca source that lives above this app's root.
      allow: [repoRoot],
    },
  },
})
