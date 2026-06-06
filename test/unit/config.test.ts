import { describe, it, expect, beforeEach } from 'vitest';
import {
	defaultDesignConfig,
	getDesignConfig,
	designAttributes,
	applyDesignConfig
} from '$lib/config';

describe('config — defaults', () => {
	// applyDesignConfig mutates module-level `current`; reset it before each test
	// so order-independence holds (the module singleton leaks otherwise).
	beforeEach(() => {
		applyDesignConfig({ ...defaultDesignConfig }, document.documentElement);
		document.documentElement.removeAttribute('data-theme');
		document.documentElement.removeAttribute('data-density');
	});

	it('defaultDesignConfig is dark + comfy', () => {
		expect(defaultDesignConfig).toEqual({ theme: 'dark', density: 'comfy' });
	});

	it('getDesignConfig returns a copy, not the internal reference', () => {
		const a = getDesignConfig();
		const b = getDesignConfig();
		expect(a).toEqual({ theme: 'dark', density: 'comfy' });
		expect(a).not.toBe(b);
	});

	it('mutating a returned config does not affect the store', () => {
		const cfg = getDesignConfig();
		cfg.theme = 'light';
		expect(getDesignConfig().theme).toBe('dark');
	});
});

describe('designAttributes', () => {
	it('returns data-theme + data-density from defaults when no config given', () => {
		expect(designAttributes()).toEqual({
			'data-theme': 'dark',
			'data-density': 'comfy'
		});
	});

	it('merges a partial config over the defaults (density only)', () => {
		expect(designAttributes({ density: 'compact' })).toEqual({
			'data-theme': 'dark',
			'data-density': 'compact'
		});
	});

	it('merges a partial config over the defaults (theme only)', () => {
		expect(designAttributes({ theme: 'light' })).toEqual({
			'data-theme': 'light',
			'data-density': 'comfy'
		});
	});

	it('uses defaults regardless of prior applyDesignConfig calls (does not read current)', () => {
		applyDesignConfig({ theme: 'light', density: 'compact' }, document.documentElement);
		// designAttributes builds from defaultDesignConfig, NOT the mutated current
		expect(designAttributes()).toEqual({
			'data-theme': 'dark',
			'data-density': 'comfy'
		});
	});
});

describe('applyDesignConfig', () => {
	beforeEach(() => {
		applyDesignConfig({ ...defaultDesignConfig }, document.documentElement);
		document.documentElement.removeAttribute('data-theme');
		document.documentElement.removeAttribute('data-density');
	});

	it('updates current and returns the new resolved config', () => {
		const result = applyDesignConfig({ theme: 'light' }, document.documentElement);
		expect(result).toEqual({ theme: 'light', density: 'comfy' });
		expect(getDesignConfig()).toEqual({ theme: 'light', density: 'comfy' });
	});

	it('sets data-theme and data-density on the given target element', () => {
		const el = document.createElement('div');
		applyDesignConfig({ theme: 'light', density: 'compact' }, el);
		expect(el).toHaveAttribute('data-theme', 'light');
		expect(el).toHaveAttribute('data-density', 'compact');
	});

	it('defaults the target to document.documentElement under jsdom', () => {
		applyDesignConfig({ theme: 'light', density: 'compact' });
		expect(document.documentElement).toHaveAttribute('data-theme', 'light');
		expect(document.documentElement).toHaveAttribute('data-density', 'compact');
	});

	it('merges one axis at a time over current', () => {
		applyDesignConfig({ density: 'compact' }, document.documentElement);
		expect(getDesignConfig()).toEqual({ theme: 'dark', density: 'compact' });
		applyDesignConfig({ theme: 'light' }, document.documentElement);
		expect(getDesignConfig()).toEqual({ theme: 'light', density: 'compact' });
	});

	it('returns a copy each call (not the internal reference)', () => {
		const r1 = applyDesignConfig({}, document.documentElement);
		const r2 = applyDesignConfig({}, document.documentElement);
		expect(r1).not.toBe(r2);
	});
});
