import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { svelteTesting } from '@testing-library/svelte/vite'
import { fileURLToPath } from 'node:url'

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url))

// Design-system components are framework-agnostic — they don't touch
// SvelteKit's virtual modules ($app/*, $env/*), so we only alias $lib.
export default defineConfig({
  plugins: [svelte(), svelteTesting()],
  resolve: {
    alias: {
      $lib: r('./src/lib'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    globals: true,
    include: ['src/**/*.{test,spec}.{js,ts}', 'test/unit/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules/**', 'dist/**', '.svelte-kit/**'],
    // Coverage (DS-0070). Opt-in only — run `pnpm exec vitest run --coverage`;
    // the `test` script stays coverage-free so CI doesn't depend on the
    // provider package. Requires `@vitest/coverage-v8` (devDependency).
    // Thresholds are a baseline floor set ~5 points under the measured
    // actuals (lines 94.1 / statements 93.3 / functions 95.1 / branches 81.5
    // over src/lib at 2026-06-12) — ratchet up, never down.
    coverage: {
      provider: 'v8',
      include: ['src/lib/**'],
      reporter: ['text', 'html'],
      reportOnFailure: true,
      thresholds: {
        lines: 89,
        statements: 88,
        functions: 90,
        branches: 76,
      },
    },
  },
})
