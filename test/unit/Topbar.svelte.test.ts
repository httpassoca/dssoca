import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Topbar from '$lib/components/Topbar.svelte';
import TopbarHarness from '../harness/TopbarHarness.svelte';

describe('Topbar', () => {
	it('renders the brand name and logo mark', () => {
		const { container } = render(Topbar, {});
		expect(container.querySelector('.logo .nm')).toHaveTextContent('hubssoca');
		expect(container.querySelector('.logo svg')).not.toBeNull();
	});

	it('renders the default tabs as buttons', () => {
		render(Topbar, {});
		for (const tab of ['overview', 'services', 'logs', 'shell']) {
			expect(screen.getByRole('button', { name: new RegExp(tab) })).toBeInTheDocument();
		}
	});

	it('marks the active tab with the active class', () => {
		const { container } = render(Topbar, { active: 'logs' });
		const active = container.querySelector('.tab.active');
		expect(active).not.toBeNull();
		expect(active).toHaveTextContent('logs');
	});

	it('renders custom tabs when supplied', () => {
		const { container } = render(Topbar, { tabs: ['alpha', 'beta'] });
		const tabs = Array.from(container.querySelectorAll('.ws .tab')).map((t) =>
			t.textContent?.replace(/\s+/g, ' ').trim()
		);
		expect(tabs).toEqual(['1alpha', '2beta']);
	});

	it('renders the user label', () => {
		render(Topbar, { user: 'rafael@hub.home' });
		expect(screen.getByText('rafael@hub.home')).toBeInTheDocument();
	});

	it('calls onTab with the tab id when a tab is clicked', async () => {
		const onTab = vi.fn();
		render(Topbar, { onTab, tabs: ['one', 'two'] });
		await fireEvent.click(screen.getByRole('button', { name: /two/ }));
		expect(onTab).toHaveBeenCalledWith('two');
	});

	it('renders a clock segment with hh/mm/ss parts', () => {
		const { container } = render(Topbar, {});
		const clock = container.querySelector('.clock');
		expect(clock).not.toBeNull();
		// three time spans separated by two ":" separators
		expect(clock!.querySelectorAll('.sep')).toHaveLength(2);
	});

	// --- landmarks (DS-0038) ---

	it('renders a <header> root and a Primary <nav> around the tabs', () => {
		const { container } = render(Topbar, {});
		const header = container.querySelector('header.ss-topbar');
		expect(header).not.toBeNull();
		const nav = container.querySelector('nav.ws');
		expect(nav).not.toBeNull();
		expect(nav).toHaveAttribute('aria-label', 'Primary');
	});

	// --- skip link (DS-0038) ---

	it('renders a skip link as the first focusable child, defaulting to #main', () => {
		const { container } = render(Topbar, {});
		const skip = container.querySelector('a.skip');
		expect(skip).not.toBeNull();
		expect(skip).toHaveAttribute('href', '#main');
		expect(skip).toHaveTextContent(/skip to content/i);
		// first focusable element in the header
		const focusables = container.querySelectorAll(
			'a[href], button, [tabindex]'
		);
		expect(focusables[0]).toBe(skip);
	});

	it('honours a custom skipTarget', () => {
		const { container } = render(Topbar, { skipTarget: '#content' });
		expect(container.querySelector('a.skip')).toHaveAttribute('href', '#content');
	});

	// --- roving tabindex (DS-0038) ---

	it('gives only the active tab a tabindex of 0 (roving)', () => {
		const { container } = render(Topbar, { active: 'logs' });
		const tabs = Array.from(container.querySelectorAll('.ws .tab')) as HTMLElement[];
		for (const t of tabs) {
			const expected = t.classList.contains('active') ? '0' : '-1';
			expect(t).toHaveAttribute('tabindex', expected);
		}
	});

	it('moves focus with ArrowRight/ArrowLeft (wrapping) and Home/End', async () => {
		const { container } = render(Topbar, { active: 'overview', tabs: ['a', 'b', 'c'] });
		const tabs = Array.from(container.querySelectorAll('.ws .tab')) as HTMLElement[];
		tabs[0].focus();

		await fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });
		expect(document.activeElement).toBe(tabs[1]);

		await fireEvent.keyDown(tabs[1], { key: 'End' });
		expect(document.activeElement).toBe(tabs[2]);

		await fireEvent.keyDown(tabs[2], { key: 'ArrowRight' });
		expect(document.activeElement).toBe(tabs[0]); // wraps forward

		await fireEvent.keyDown(tabs[0], { key: 'ArrowLeft' });
		expect(document.activeElement).toBe(tabs[2]); // wraps backward

		await fireEvent.keyDown(tabs[2], { key: 'Home' });
		expect(document.activeElement).toBe(tabs[0]);
	});

	it('sets aria-current="page" on the active tab only', () => {
		const { container } = render(Topbar, { active: 'services' });
		const tabs = Array.from(container.querySelectorAll('.ws .tab')) as HTMLElement[];
		for (const t of tabs) {
			if (t.classList.contains('active')) {
				expect(t).toHaveAttribute('aria-current', 'page');
			} else {
				expect(t).not.toHaveAttribute('aria-current');
			}
		}
	});

	// --- command menu (DS-0038) ---

	it('renders a labelled command button with keyboard-shortcut hints', () => {
		render(Topbar, {});
		const btn = screen.getByRole('button', { name: /open command menu/i });
		expect(btn).toHaveAttribute('aria-keyshortcuts', 'Meta+K Control+K');
		// the visible ⌘K glyph stays decorative
		expect(btn.querySelector('.kbd')).toHaveAttribute('aria-hidden', 'true');
	});

	it('calls onCommand when the command chip is clicked', async () => {
		const onCommand = vi.fn();
		render(Topbar, { onCommand });
		await fireEvent.click(screen.getByRole('button', { name: /open command menu/i }));
		expect(onCommand).toHaveBeenCalledTimes(1);
	});

	it('calls onCommand on Cmd/Ctrl+K', async () => {
		const onCommand = vi.fn();
		render(Topbar, { onCommand });
		await fireEvent.keyDown(window, { key: 'k', metaKey: true });
		await fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
		expect(onCommand).toHaveBeenCalledTimes(2);
	});

	// --- user control (DS-0038) ---

	it('renders the user as a real button and calls onUser when clicked', async () => {
		const onUser = vi.fn();
		render(Topbar, { onUser, user: 'me@host' });
		const btn = screen.getByRole('button', { name: 'me@host' });
		await fireEvent.click(btn);
		expect(onUser).toHaveBeenCalledTimes(1);
	});

	it('renders a custom userMenu snippet in place of the user button', () => {
		const { container } = render(TopbarHarness, { withUserMenu: true });
		expect(container.querySelector('.custom-user')).not.toBeNull();
		expect(container.querySelector('.user-btn')).toBeNull();
	});

	// --- data-driven brand + stats (DS-0038) ---

	it('renders a custom brand snippet in place of the default mark', () => {
		const { container } = render(TopbarHarness, { withBrand: true });
		expect(container.querySelector('.custom-brand')).not.toBeNull();
		expect(container.querySelector('.logo svg')).toBeNull();
	});

	it('renders the default stats and supports custom stats', () => {
		const { container: def } = render(Topbar, {});
		const defKeys = Array.from(def.querySelectorAll('.seg.stat.collapsible .k')).map(
			(e) => e.textContent
		);
		expect(defKeys).toEqual(['cpu', 'mem', 'net']);

		const { container } = render(Topbar, {
			stats: [{ key: 'disk', value: '40%' }, { key: 'temp', value: '48C' }]
		});
		const segs = Array.from(container.querySelectorAll('.seg.stat.collapsible'));
		expect(segs.map((s) => s.querySelector('.k')?.textContent)).toEqual(['disk', 'temp']);
		expect(segs.map((s) => s.querySelector('.v')?.textContent)).toEqual(['40%', '48C']);
	});

	// --- sticky opt-out (DS-0038) ---

	it('is sticky by default and drops the sticky class when sticky=false', () => {
		const { container: a } = render(Topbar, {});
		expect(a.querySelector('header.ss-topbar')).toHaveClass('sticky');
		const { container: b } = render(Topbar, { sticky: false });
		expect(b.querySelector('header.ss-topbar')).not.toHaveClass('sticky');
	});
});
