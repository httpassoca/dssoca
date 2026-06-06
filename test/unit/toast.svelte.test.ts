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
});
