import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import { fileURLToPath } from 'node:url';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// Design-system components are framework-agnostic — they don't touch
// SvelteKit's virtual modules ($app/*, $env/*), so we only alias $lib.
export default defineConfig({
	plugins: [svelte(), svelteTesting()],
	resolve: {
		alias: {
			$lib: r('./src/lib')
		}
	},
	test: {
		environment: 'jsdom',
		setupFiles: ['./test/setup.ts'],
		globals: true,
		include: ['src/**/*.{test,spec}.{js,ts}', 'test/unit/**/*.{test,spec}.{js,ts}'],
		exclude: ['node_modules/**', 'dist/**', '.svelte-kit/**']
	}
});
