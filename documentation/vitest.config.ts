import { defineConfig } from 'vitest/config';

// Minimal, DOM-free unit tests for the docs app's pure logic (the docs config
// invariants and the Prism highlighter). Component/render coverage lives in the
// library's own Vitest suite; this just guards the docs-specific code.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules/**', '.svelte-kit/**', 'build/**'],
  },
});
