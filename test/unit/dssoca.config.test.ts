import { describe, it, expect } from 'vitest';
import { dssocaConfig } from '$lib/dssoca.config';
import { defaultDesignConfig } from '$lib/config';

describe('dssocaConfig manifest', () => {
	it('declares the theme and size axes with values + defaults', () => {
		expect(dssocaConfig.theme.values).toEqual(['dark', 'light']);
		expect(dssocaConfig.theme.default).toBe('dark');
		expect(dssocaConfig.size.values).toEqual(['sm', 'md', 'lg']);
		expect(dssocaConfig.size.default).toBe('md');
	});

	it("every axis's default is one of its allowed values", () => {
		for (const [name, axis] of Object.entries(dssocaConfig)) {
			expect(axis.values, `${name}.default ∈ ${name}.values`).toContain(axis.default);
		}
	});

	it('is the single source of truth: defaultDesignConfig derives from the manifest', () => {
		expect(defaultDesignConfig).toEqual({
			theme: dssocaConfig.theme.default,
			sizeVariant: dssocaConfig.size.default,
			componentsSize: {}
		});
	});
});
