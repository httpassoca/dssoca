import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/svelte';

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
