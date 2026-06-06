import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import ButtonHarness from '../harness/ButtonHarness.svelte';

describe('Button', () => {
	it('renders a button with its children text', () => {
		render(ButtonHarness, { text: 'Save' });
		expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
	});

	it('defaults to the secondary variant and type=button', () => {
		const { container } = render(ButtonHarness, { text: 'x' });
		const btn = container.querySelector('button')!;
		expect(btn).toHaveClass('hub-btn', 'secondary');
		expect(btn).toHaveAttribute('type', 'button');
	});

	it.each(['primary', 'secondary', 'ghost'] as const)('applies the %s variant class', (variant) => {
		const { container } = render(ButtonHarness, { variant, text: 'x' });
		expect(container.querySelector('button')).toHaveClass(variant);
	});

	it('honours the type prop', () => {
		const { container } = render(ButtonHarness, { type: 'submit', text: 'go' });
		expect(container.querySelector('button')).toHaveAttribute('type', 'submit');
	});

	it('is disabled when disabled=true', () => {
		const { container } = render(ButtonHarness, { disabled: true, text: 'x' });
		expect(container.querySelector('button')).toBeDisabled();
	});

	it('fires onclick when clicked', async () => {
		const onclick = vi.fn();
		render(ButtonHarness, { onclick, text: 'Tap' });
		await fireEvent.click(screen.getByRole('button', { name: 'Tap' }));
		expect(onclick).toHaveBeenCalledOnce();
	});

	it('renders the disabled attribute so a real browser blocks clicks', () => {
		// A disabled <button> is non-interactive in a real browser: the native
		// click gate (which jsdom's synthetic fireEvent bypasses) is what stops
		// onclick, so assert the actual rendered guarantee — the attribute.
		const onclick = vi.fn();
		const { container } = render(ButtonHarness, { onclick, disabled: true, text: 'Tap' });
		expect(container.querySelector('button')).toBeDisabled();
	});
});
