import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { axe } from 'vitest-axe';
import BadgeHarness from '../harness/BadgeHarness.svelte';

const axeOpts = {
	rules: {
		region: { enabled: false },
		'landmark-one-main': { enabled: false },
		'page-has-heading-one': { enabled: false },
		'color-contrast': { enabled: false }
	}
};

describe('Badge', () => {
	it('renders its children text inside a .ss-badge', () => {
		const { container } = render(BadgeHarness, { text: 'online' });
		const badge = container.querySelector('.ss-badge');
		expect(badge).not.toBeNull();
		expect(badge).toHaveTextContent('online');
	});

	it('defaults to the info tone', () => {
		const { container } = render(BadgeHarness, { text: 'x' });
		expect(container.querySelector('.ss-badge')).toHaveClass('info');
	});

	it.each(['up', 'deg', 'down', 'info', 'neutral'] as const)(
		'applies the %s tone class',
		(tone) => {
			const { container } = render(BadgeHarness, { tone, text: tone });
			expect(container.querySelector('.ss-badge')).toHaveClass(tone);
		}
	);

	describe('dot', () => {
		it('renders no dot by default', () => {
			const { container } = render(BadgeHarness, { tone: 'up', text: 'up' });
			expect(container.querySelector('.ss-badge .dot')).toBeNull();
		});

		it('renders a decorative dot when dot=true', () => {
			const { container } = render(BadgeHarness, { tone: 'up', text: 'up', dot: true });
			const dot = container.querySelector('.ss-badge .dot');
			expect(dot).not.toBeNull();
			expect(dot).toHaveAttribute('aria-hidden', 'true');
		});

		it('is decoupled from tone (neutral can carry a dot too)', () => {
			const { container } = render(BadgeHarness, { tone: 'neutral', text: 'n', dot: true });
			expect(container.querySelector('.ss-badge .dot')).not.toBeNull();
		});
	});

	describe('dot-only / label-less mode', () => {
		it('renders only the dot with no visible text', () => {
			const { container } = render(BadgeHarness, {
				noLabel: true,
				dot: true,
				tone: 'down',
				label: 'down'
			});
			const badge = container.querySelector('.ss-badge')!;
			expect(badge).toHaveClass('label-less');
			expect(badge.querySelector('.dot')).not.toBeNull();
			expect(badge.textContent?.trim()).toBe('');
		});

		it('carries the status as an aria-label so it is not colour-only', () => {
			const { container } = render(BadgeHarness, {
				noLabel: true,
				dot: true,
				tone: 'up',
				label: 'operational'
			});
			expect(container.querySelector('.ss-badge')).toHaveAttribute('aria-label', 'operational');
		});

		it('does not set an aria-label when a label snippet is present', () => {
			const { container } = render(BadgeHarness, { text: 'visible', label: 'ignored' });
			expect(container.querySelector('.ss-badge')).not.toHaveAttribute('aria-label');
		});
	});

	describe('count', () => {
		it('renders the count value', () => {
			const { container } = render(BadgeHarness, { noLabel: true, count: 5, label: 'items' });
			expect(container.querySelector('.ss-badge .count')).toHaveTextContent('5');
		});

		it('clamps to max with a trailing + (default max 99)', () => {
			const { container } = render(BadgeHarness, { noLabel: true, count: 150, label: 'items' });
			expect(container.querySelector('.ss-badge .count')).toHaveTextContent('99+');
		});

		it('honours a custom max', () => {
			const { container } = render(BadgeHarness, {
				noLabel: true,
				count: 12,
				max: 9,
				label: 'items'
			});
			expect(container.querySelector('.ss-badge .count')).toHaveTextContent('9+');
		});

		it('renders nothing for the count when it is 0', () => {
			const { container } = render(BadgeHarness, { noLabel: true, count: 0, label: 'items' });
			expect(container.querySelector('.ss-badge .count')).toBeNull();
		});

		it('can accompany a label', () => {
			const { container } = render(BadgeHarness, { text: 'inbox', count: 3 });
			const badge = container.querySelector('.ss-badge')!;
			expect(badge).toHaveTextContent('inbox');
			expect(badge.querySelector('.count')).toHaveTextContent('3');
		});
	});

	describe('live status semantics', () => {
		it('is a plain span by default (no role/aria-live)', () => {
			const { container } = render(BadgeHarness, { text: 'static' });
			const badge = container.querySelector('.ss-badge')!;
			expect(badge).not.toHaveAttribute('role');
			expect(badge).not.toHaveAttribute('aria-live');
		});

		it('exposes role=status + aria-live=polite when live', () => {
			const { container } = render(BadgeHarness, { text: 'up', live: true });
			const badge = container.querySelector('.ss-badge')!;
			expect(badge).toHaveAttribute('role', 'status');
			expect(badge).toHaveAttribute('aria-live', 'polite');
		});
	});

	describe('dismissible', () => {
		it('renders no dismiss button without ondismiss', () => {
			const { container } = render(BadgeHarness, { text: 'tag' });
			expect(container.querySelector('.ss-badge button.x')).toBeNull();
		});

		it('renders a focusable button named from the label', () => {
			const ondismiss = vi.fn();
			const { container } = render(BadgeHarness, { text: 'tag', label: 'tag', ondismiss });
			const btn = container.querySelector('.ss-badge button.x') as HTMLButtonElement;
			expect(btn).not.toBeNull();
			expect(btn).toHaveAttribute('type', 'button');
			expect(btn).toHaveAttribute('aria-label', 'Remove tag');
			btn.focus();
			expect(document.activeElement).toBe(btn);
		});

		it('falls back to "Remove" when no label is given', () => {
			const { container } = render(BadgeHarness, { text: 'tag', ondismiss: vi.fn() });
			expect(container.querySelector('.ss-badge button.x')).toHaveAttribute('aria-label', 'Remove');
		});

		it('invokes ondismiss on click', async () => {
			const ondismiss = vi.fn();
			const { container } = render(BadgeHarness, { text: 'tag', label: 'tag', ondismiss });
			await fireEvent.click(container.querySelector('.ss-badge button.x')!);
			expect(ondismiss).toHaveBeenCalledOnce();
		});
	});

	describe('a11y (axe)', () => {
		it('dot-only badge has no violations', async () => {
			const { container } = render(BadgeHarness, {
				noLabel: true,
				dot: true,
				tone: 'down',
				label: 'down'
			});
			expect(await axe(container, axeOpts)).toHaveNoViolations();
		});

		it('dismissible badge has no violations', async () => {
			const { container } = render(BadgeHarness, {
				text: 'production',
				label: 'production',
				ondismiss: vi.fn()
			});
			expect(await axe(container, axeOpts)).toHaveNoViolations();
		});
	});
});
