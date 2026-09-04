import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { fileURLToPath } from 'node:url'

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url))

// DOM-free unit tests for the docs app's pure logic (config invariants, the Prism
// highlighter, the theme builder). The Svelte plugin + aliases are here only so the
// plain-HTML snippet renderer (DS-0148) can server-render the real dssoca components under
// node — it compiles them with `generate: 'server'`, no jsdom involved.
export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      dssoca: r('../src/lib/index.ts'),
      '@dssoca/lib': r('../src/lib'),
      '@dssoca/styles': r('../src/styles'),
      $lib: r('./src/lib'),
    },
  },
  test: {
    environment: 'node',
    include: ['test/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules/**', '.svelte-kit/**', 'build/**'],
  },
})
