import { describe, it, expect, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Toaster from '$lib/components/Toaster.svelte';
import { toasts } from '$lib/toast.svelte';

describe('Toaster', () => {
	beforeEach(() => {
		toasts.clear();
	});

	it('labels the notifications container (toasts carry their own live semantics)', () => {
		const { container } = render(Toaster, {});
		const region = container.querySelector('.ss-toaster');
		expect(region).toHaveAttribute('aria-label', 'Notifications');
		// the container is no longer the live region — avoids double announcements
		expect(region).not.toHaveAttribute('aria-live');
	});

	it('announces info/success politely and errors assertively', async () => {
		const { container } = render(Toaster, {});
		toasts.push('success', 'ok', 0);
		toasts.push('error', 'bad', 0);
		await Promise.resolve();
		const els = container.querySelectorAll('.ss-toast');
		expect(els[0]).toHaveAttribute('role', 'status');
		expect(els[0]).toHaveAttribute('aria-live', 'polite');
		expect(els[1]).toHaveAttribute('role', 'alert');
		expect(els[1]).toHaveAttribute('aria-live', 'assertive');
	});

	it('renders nothing when the store is empty', () => {
		const { container } = render(Toaster, {});
		expect(container.querySelectorAll('.ss-toast')).toHaveLength(0);
	});

	it('renders a toast reactively when one is pushed', async () => {
		const { container } = render(Toaster, {});
		toasts.push('success', 'Saved!', 0);
		await Promise.resolve();
		const toastEl = container.querySelector('.ss-toast');
		expect(toastEl).not.toBeNull();
		expect(toastEl).toHaveClass('success');
		expect(container.querySelector('.ss-toast .msg')).toHaveTextContent('Saved!');
	});

	it('renders the right glyph per kind', async () => {
		const { container } = render(Toaster, {});
		toasts.push('success', 'a', 0);
		toasts.push('error', 'b', 0);
		toasts.push('info', 'c', 0);
		await Promise.resolve();
		const glyphs = Array.from(container.querySelectorAll('.ss-toast .ic')).map((e) =>
			e.textContent
		);
		expect(glyphs).toEqual(['✓', '✕', 'i']);
	});

	it('dismisses a toast when its × button is clicked', async () => {
		const { container } = render(Toaster, {});
		toasts.push('info', 'bye', 0);
		await Promise.resolve();
		expect(container.querySelectorAll('.ss-toast')).toHaveLength(1);
		await fireEvent.click(container.querySelector('.ss-toast .x')!);
		// The click removes the item from the store (the real contract). The DOM
		// node lingers briefly under the `fly` out-transition, so assert on the
		// store, which is the source of truth the Toaster renders from.
		expect(toasts.items).toHaveLength(0);
	});

	it('the dismiss button is labelled for a11y', async () => {
		const { container } = render(Toaster, {});
		toasts.push('info', 'x', 0);
		await Promise.resolve();
		expect(container.querySelector('.ss-toast .x')).toHaveAttribute('aria-label', 'Dismiss');
	});
});
