import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRawSnippet } from 'svelte';
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
		expect(btn).toHaveClass('ss-btn', 'secondary');
		expect(btn).toHaveAttribute('type', 'button');
	});

	it.each(['primary', 'secondary', 'ghost', 'danger'] as const)('applies the %s variant class', (variant) => {
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

	describe('disabled — no glow / brighten', () => {
		// jsdom's getComputedStyle does not apply Svelte's scoped <style> cascade,
		// and :hover can't be simulated, so the disabled-glow guard can't be read
		// off the rendered DOM. It is a pure CSS contract — assert it at the source
		// so a regression (re-introducing a bare hover glow) fails the suite.
		const source = readFileSync(
			resolve(process.cwd(), 'src/lib/components/Button.svelte'),
			'utf8',
		);

		it('still renders disabled buttons as natively disabled (inert)', () => {
			const { container } = render(ButtonHarness, { variant: 'primary', disabled: true, text: 'Save' });
			expect(container.querySelector('button')).toBeDisabled();
		});

		it('has no un-guarded &:hover rule (every hover affordance excludes :disabled)', () => {
			expect(source).not.toContain('&:hover');
			expect(source).toContain('&:not(:disabled):hover');
		});

		it('gates the primary brand glow behind :not(:disabled):hover', () => {
			expect(source).toMatch(/&:not\(:disabled\):hover\s*\{[^}]*--ss-shadow-glow/);
		});

		it('resets box-shadow to none on :disabled', () => {
			expect(source).toMatch(/&:disabled\s*\{[^}]*box-shadow:\s*none/);
		});
	});

	describe('loading', () => {
		it('sets aria-busy and a loading class when loading', () => {
			const { container } = render(ButtonHarness, { loading: true, text: 'Save' });
			const btn = container.querySelector('button')!;
			expect(btn).toHaveAttribute('aria-busy', 'true');
			expect(btn).toHaveAttribute('aria-disabled', 'true');
			expect(btn).toHaveClass('loading');
		});

		it('is not aria-busy when not loading', () => {
			const { container } = render(ButtonHarness, { text: 'Save' });
			const btn = container.querySelector('button')!;
			expect(btn).not.toHaveAttribute('aria-busy');
			expect(btn).not.toHaveAttribute('aria-disabled');
		});

		it('renders a spinner while loading', () => {
			const { container } = render(ButtonHarness, { loading: true, text: 'Save' });
			expect(container.querySelector('.spinner')).toBeInTheDocument();
		});

		it('guards onclick while loading (handler does not fire)', async () => {
			const onclick = vi.fn();
			render(ButtonHarness, { onclick, loading: true, text: 'Tap' });
			await fireEvent.click(screen.getByRole('button', { name: 'Tap' }));
			expect(onclick).not.toHaveBeenCalled();
		});

		it('stays focusable while loading (soft-disable, no native disabled)', () => {
			const { container } = render(ButtonHarness, { loading: true, text: 'Save' });
			expect(container.querySelector('button')).not.toBeDisabled();
		});

		it('keeps a stable accessible name via loadingLabel', () => {
			render(ButtonHarness, { loading: true, loadingLabel: 'Saving…', text: 'Save' });
			expect(screen.getByRole('button', { name: 'Saving…' })).toBeInTheDocument();
		});
	});

	describe('icon-only', () => {
		it('exposes label as the aria-label and applies the icon-only class', () => {
			const { container } = render(ButtonHarness, { iconOnly: true, label: 'Settings', text: '⚙' });
			const btn = container.querySelector('button')!;
			expect(btn).toHaveClass('icon-only');
			expect(screen.getByRole('button', { name: 'Settings' })).toBe(btn);
		});
	});

	describe('fullWidth', () => {
		it('applies the full-width class', () => {
			const { container } = render(ButtonHarness, { fullWidth: true, text: 'Wide' });
			expect(container.querySelector('button')).toHaveClass('full-width');
		});
	});

	describe('leading / trailing snippets', () => {
		it('renders leading and trailing affixes around the label', () => {
			const { container } = render(ButtonHarness, {
				text: 'Next',
				leading: createRawSnippet(() => ({ render: () => '<i>L</i>' })),
				trailing: createRawSnippet(() => ({ render: () => '<i>T</i>' }))
			});
			const affixes = container.querySelectorAll('.affix');
			expect(affixes).toHaveLength(2);
			expect(container.querySelector('.label')?.textContent).toBe('Next');
		});
	});

	describe('rest props', () => {
		it('forwards unknown attributes onto the <button>', () => {
			const { container } = render(ButtonHarness, { text: 'x', 'data-testid': 'my-btn' });
			expect(container.querySelector('button')).toHaveAttribute('data-testid', 'my-btn');
		});
	});
});
