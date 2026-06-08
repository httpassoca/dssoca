import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { toasts, toast } from '$lib/toast.svelte';

describe('toast store', () => {
	beforeEach(() => {
		toasts.clear();
	});

	it('starts empty after clear', () => {
		expect(toasts.items).toEqual([]);
	});

	it('push appends an item with the right kind + message and returns its id', () => {
		const id = toasts.push('info', 'hello', 0);
		expect(toasts.items).toHaveLength(1);
		expect(toasts.items[0]).toMatchObject({ id, kind: 'info', message: 'hello' });
	});

	it('assigns monotonically increasing ids across pushes', () => {
		const a = toasts.push('info', 'a', 0);
		const b = toasts.push('info', 'b', 0);
		expect(b).toBeGreaterThan(a);
	});

	it('dismiss removes the matching item by id', () => {
		const a = toasts.push('info', 'a', 0);
		const b = toasts.push('error', 'b', 0);
		toasts.dismiss(a);
		expect(toasts.items).toHaveLength(1);
		expect(toasts.items[0].id).toBe(b);
	});

	it('dismiss is a no-op for an unknown id', () => {
		toasts.push('info', 'a', 0);
		toasts.dismiss(999999);
		expect(toasts.items).toHaveLength(1);
	});

	it('clear empties all items', () => {
		toasts.push('info', 'a', 0);
		toasts.push('info', 'b', 0);
		toasts.clear();
		expect(toasts.items).toEqual([]);
	});

	it('auto-dismisses after the timeout when window is present', () => {
		vi.useFakeTimers();
		const id = toasts.push('info', 'temp', 1000);
		expect(toasts.items.some((t) => t.id === id)).toBe(true);
		vi.advanceTimersByTime(1000);
		expect(toasts.items.some((t) => t.id === id)).toBe(false);
		vi.useRealTimers();
	});
});

describe('toast helpers', () => {
	beforeEach(() => {
		toasts.clear();
	});
	afterEach(() => {
		toasts.clear();
	});

	it('toast.success pushes a success-kind item', () => {
		toast.success('saved', 0);
		expect(toasts.items.at(-1)).toMatchObject({ kind: 'success', message: 'saved' });
	});

	it('toast.error pushes an error-kind item', () => {
		toast.error('boom', 0);
		expect(toasts.items.at(-1)).toMatchObject({ kind: 'error', message: 'boom' });
	});

	it('toast.info pushes an info-kind item', () => {
		toast.info('fyi', 0);
		expect(toasts.items.at(-1)).toMatchObject({ kind: 'info', message: 'fyi' });
	});

	it('helpers return the new toast id', () => {
		const id = toast.success('x', 0);
		expect(typeof id).toBe('number');
		expect(toasts.items.some((t) => t.id === id)).toBe(true);
	});

	it('toast.loading pushes a sticky loading-kind item', () => {
		const id = toast.loading('working');
		const t = toasts.items.find((x) => x.id === id);
		expect(t).toMatchObject({ kind: 'loading', message: 'working' });
		// loading defaults to sticky (timeout <= 0)
		expect(t!.timeout <= 0).toBe(true);
	});
});

describe('toast options (object signature)', () => {
	beforeEach(() => {
		toasts.clear();
		toasts.max = 3;
	});

	it('accepts an options object with a timeout', () => {
		vi.useFakeTimers();
		const id = toast.success('x', { timeout: 500 });
		expect(toasts.items.some((t) => t.id === id)).toBe(true);
		vi.advanceTimersByTime(500);
		expect(toasts.items.some((t) => t.id === id)).toBe(false);
		vi.useRealTimers();
	});

	it('attaches an action and defaults action toasts to sticky', () => {
		const onClick = vi.fn();
		const id = toast.info('undo me', { action: { label: 'Undo', onClick } });
		const t = toasts.items.find((x) => x.id === id)!;
		expect(t.action?.label).toBe('Undo');
		// action toasts default sticky so the action stays reachable
		expect(t.timeout <= 0).toBe(true);
	});

	it('errors get a longer default timeout than success/info', () => {
		const okId = toasts.push('success', 'ok');
		const errId = toasts.push('error', 'boom');
		const ok = toasts.items.find((t) => t.id === okId)!;
		const err = toasts.items.find((t) => t.id === errId)!;
		expect(err.timeout).toBeGreaterThan(ok.timeout);
	});
});

describe('sticky timeouts', () => {
	beforeEach(() => {
		toasts.clear();
	});
	afterEach(() => {
		vi.useRealTimers();
	});

	it('does not auto-dismiss when timeout <= 0', () => {
		vi.useFakeTimers();
		const id = toasts.push('info', 'sticky', 0);
		vi.advanceTimersByTime(60000);
		expect(toasts.items.some((t) => t.id === id)).toBe(true);
	});

	it('does not auto-dismiss when timeout is Infinity', () => {
		vi.useFakeTimers();
		const id = toasts.push('info', 'forever', Infinity);
		vi.advanceTimersByTime(60000);
		expect(toasts.items.some((t) => t.id === id)).toBe(true);
	});
});

describe('pause / resume', () => {
	beforeEach(() => {
		toasts.clear();
	});
	afterEach(() => {
		vi.useRealTimers();
	});

	it('pause holds the timer; resume keeps the remaining budget', () => {
		vi.useFakeTimers();
		const id = toasts.push('info', 'hover', 1000);
		vi.advanceTimersByTime(400);
		toasts.pause(id);
		// time passes while paused — should NOT dismiss
		vi.advanceTimersByTime(5000);
		expect(toasts.items.some((t) => t.id === id)).toBe(true);
		toasts.resume(id);
		// remaining ~600ms left
		vi.advanceTimersByTime(599);
		expect(toasts.items.some((t) => t.id === id)).toBe(true);
		vi.advanceTimersByTime(2);
		expect(toasts.items.some((t) => t.id === id)).toBe(false);
	});

	it('pause/resume are no-ops for sticky toasts', () => {
		vi.useFakeTimers();
		const id = toasts.push('info', 'sticky', 0);
		toasts.pause(id);
		toasts.resume(id);
		vi.advanceTimersByTime(60000);
		expect(toasts.items.some((t) => t.id === id)).toBe(true);
	});
});

describe('max cap + queue', () => {
	beforeEach(() => {
		toasts.clear();
		toasts.max = 3;
	});

	it('renders only up to `max` toasts; the rest queue', () => {
		const ids = [1, 2, 3, 4, 5].map((n) => toasts.push('info', `m${n}`, 0));
		expect(toasts.items).toHaveLength(3);
		expect(toasts.items.map((t) => t.id)).toEqual(ids.slice(0, 3));
	});

	it('promotes the next queued toast (FIFO) when a visible one dismisses', () => {
		const ids = [1, 2, 3, 4].map((n) => toasts.push('info', `m${n}`, 0));
		toasts.dismiss(ids[0]);
		expect(toasts.items).toHaveLength(3);
		// the 4th (first queued) is now visible
		expect(toasts.items.some((t) => t.id === ids[3])).toBe(true);
	});

	it('dismissing a still-queued toast removes it from the queue', () => {
		const ids = [1, 2, 3, 4].map((n) => toasts.push('info', `m${n}`, 0));
		toasts.dismiss(ids[3]); // queued one
		toasts.dismiss(ids[0]); // free a slot
		expect(toasts.items).toHaveLength(2);
		expect(toasts.items.some((t) => t.id === ids[3])).toBe(false);
	});

	it('clear empties both the visible stack and the queue', () => {
		[1, 2, 3, 4, 5].forEach((n) => toasts.push('info', `m${n}`, 0));
		toasts.clear();
		toasts.push('info', 'fresh', 0);
		expect(toasts.items).toHaveLength(1);
	});
});

describe('update', () => {
	beforeEach(() => {
		toasts.clear();
		toasts.max = 3;
	});
	afterEach(() => {
		vi.useRealTimers();
	});

	it('patches kind + message in place', () => {
		const id = toasts.push('loading', 'saving…', 0);
		expect(toasts.update(id, { kind: 'success', message: 'saved' })).toBe(true);
		const t = toasts.items.find((x) => x.id === id)!;
		expect(t).toMatchObject({ kind: 'success', message: 'saved' });
	});

	it('re-arms the timer from the new kind default when kind changes', () => {
		vi.useFakeTimers();
		const id = toasts.push('loading', 'saving…', 0); // sticky
		toasts.update(id, { kind: 'success', message: 'done' }); // now 4000ms
		vi.advanceTimersByTime(4001);
		expect(toasts.items.some((t) => t.id === id)).toBe(false);
	});

	it('returns false for an unknown id', () => {
		expect(toasts.update(123456, { message: 'x' })).toBe(false);
	});

	it('can clear an action by patching action: undefined', () => {
		const id = toasts.push('info', 'x', { action: { label: 'A', onClick: () => {} } });
		toasts.update(id, { action: undefined });
		expect(toasts.items.find((t) => t.id === id)!.action).toBeUndefined();
	});
});

describe('toast.promise', () => {
	beforeEach(() => {
		toasts.clear();
		toasts.max = 3;
	});

	it('shows a loading toast then resolves to success', async () => {
		const p = Promise.resolve(42);
		toast.promise(p, { loading: 'loading…', success: (v) => `got ${v}`, error: 'failed' });
		const id = toasts.items.at(-1)!.id;
		expect(toasts.items.find((t) => t.id === id)).toMatchObject({
			kind: 'loading',
			message: 'loading…'
		});
		await p;
		await Promise.resolve();
		expect(toasts.items.find((t) => t.id === id)).toMatchObject({
			kind: 'success',
			message: 'got 42'
		});
	});

	it('updates to error and rethrows-free when the promise rejects', async () => {
		const p = Promise.reject(new Error('nope'));
		toast.promise(p, { loading: 'loading…', success: 'ok', error: (e) => `err: ${(e as Error).message}` });
		const id = toasts.items.at(-1)!.id;
		await p.catch(() => {});
		await Promise.resolve();
		expect(toasts.items.find((t) => t.id === id)).toMatchObject({
			kind: 'error',
			message: 'err: nope'
		});
	});

	it('returns the original promise for chaining', async () => {
		const p = Promise.resolve('v');
		const ret = toast.promise(p, { loading: 'l', success: 's', error: 'e' });
		await expect(ret).resolves.toBe('v');
	});
});
