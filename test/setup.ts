import '@testing-library/jest-dom/vitest';
import { afterEach, expect } from 'vitest';
import { cleanup } from '@testing-library/svelte';
import { toHaveNoViolations } from 'vitest-axe/dist/matchers.js';

// axe-core matcher (`toHaveNoViolations`) for component a11y assertions.
expect.extend({ toHaveNoViolations });

// jsdom doesn't implement matchMedia; Svelte's `prefersReducedMotion`
// (used by Toaster) reads it. Provide a no-match stub.
if (typeof window !== 'undefined' && !window.matchMedia) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(window as any).matchMedia = (query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addEventListener() {},
		removeEventListener() {},
		addListener() {},
		removeListener() {},
		dispatchEvent() {
			return false;
		}
	});
}

// jsdom doesn't implement the Web Animations API, but Svelte's `fly`/`fade`
// transitions (e.g. in Toaster) call element.animate(). Stub it so components
// that animate on mount/unmount render without throwing.
if (!('animate' in Element.prototype)) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(Element.prototype as any).animate = function () {
		return {
			cancel() {},
			finish() {},
			play() {},
			pause() {},
			reverse() {},
			addEventListener() {},
			removeEventListener() {},
			finished: Promise.resolve(),
			onfinish: null,
			currentTime: 0,
			startTime: 0,
			playState: 'finished'
		};
	};
}

afterEach(() => cleanup());
