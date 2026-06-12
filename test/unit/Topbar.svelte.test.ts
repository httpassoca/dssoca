import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import { axe } from 'vitest-axe';
import Topbar from '$lib/components/Topbar.svelte';
import TopbarHarness from '../harness/TopbarHarness.svelte';

// Same component-scope axe config as test/unit/a11y.test.ts (jsdom has no
// layout, fragment renders lack page landmarks).
const axeOpts = {
	rules: {
		region: { enabled: false },
		'landmark-one-main': { enabled: false },
		'page-has-heading-one': { enabled: false },
		'color-contrast': { enabled: false }
	}
};

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
		render(Topbar, { user: 'admin@hub.home' });
		expect(screen.getByText('admin@hub.home')).toBeInTheDocument();
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
		// DS-0081: the chip only exists when an onCommand handler is provided.
		render(Topbar, { onCommand: () => {} });
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

	// --- link tabs (DS-0080) ---

	it('renders object tabs with href as real <a href> links', () => {
		const { container } = render(Topbar, {
			tabs: [
				{ id: 'work', label: 'Work', href: '/work' },
				{ id: 'about', label: 'About', href: '/about' }
			]
		});
		const links = Array.from(container.querySelectorAll('.ws a.tab'));
		expect(links).toHaveLength(2);
		expect(links[0]).toHaveAttribute('href', '/work');
		expect(links[1]).toHaveAttribute('href', '/about');
		expect(container.querySelectorAll('.ws button.tab')).toHaveLength(0);
	});

	it('defaults an object tab label to its id', () => {
		const { container } = render(Topbar, { tabs: [{ id: 'work' }] });
		expect(container.querySelector('.ws .tab')).toHaveTextContent('work');
	});

	it('matches the active tab by id, not by the rendered label', () => {
		const { container } = render(Topbar, {
			active: 'work',
			tabs: [
				{ id: 'work', label: 'Trabalho', href: '/work' },
				{ id: 'about', label: 'Sobre', href: '/about' }
			]
		});
		const active = container.querySelector('.ws .tab.active');
		expect(active).not.toBeNull();
		expect(active).toHaveTextContent('Trabalho');
		expect(active).toHaveAttribute('aria-current', 'page');
		expect(container.querySelector('.ws .tab:not(.active)')).not.toHaveAttribute('aria-current');
	});

	it('mixes string and object tabs (strings normalize to id = label)', () => {
		const { container } = render(Topbar, {
			active: 'logs',
			tabs: ['logs', { id: 'docs', label: 'Docs', href: '/docs' }]
		});
		expect(container.querySelector('.ws button.tab.active')).toHaveTextContent('logs');
		expect(container.querySelector('.ws a.tab')).toHaveAttribute('href', '/docs');
	});

	it('fires onTab with the tab id when a link tab is clicked', async () => {
		const onTab = vi.fn();
		const { container } = render(Topbar, {
			onTab,
			tabs: [{ id: 'work', label: 'Work', href: '/work' }]
		});
		const a = container.querySelector<HTMLElement>('a.tab')!;
		a.addEventListener('click', (e) => e.preventDefault()); // jsdom can't navigate
		await fireEvent.click(a);
		expect(onTab).toHaveBeenCalledWith('work');
	});

	it('keeps link tabs in the natural tab order (no roving tabindex, SSR-safe)', () => {
		const { container } = render(Topbar, {
			active: 'work',
			tabs: [
				{ id: 'work', href: '/work' },
				{ id: 'about', href: '/about' }
			]
		});
		for (const a of container.querySelectorAll('a.tab')) {
			expect(a).not.toHaveAttribute('tabindex');
		}
	});

	it('moves focus across link tabs with arrow keys', async () => {
		const { container } = render(Topbar, {
			tabs: [
				{ id: 'a', href: '/a' },
				{ id: 'b', href: '/b' }
			]
		});
		const links = Array.from(container.querySelectorAll('a.tab')) as HTMLElement[];
		links[0].focus();
		await fireEvent.keyDown(links[0], { key: 'ArrowRight' });
		expect(document.activeElement).toBe(links[1]);
		await fireEvent.keyDown(links[1], { key: 'Home' });
		expect(document.activeElement).toBe(links[0]);
	});

	it('link tabs have no axe violations', async () => {
		const { container } = render(Topbar, {
			active: 'work',
			tabs: [
				{ id: 'work', label: 'Work', href: '/work' },
				{ id: 'about', label: 'About', href: '/about' }
			]
		});
		expect(await axe(container, axeOpts)).toHaveNoViolations();
	});

	// --- optional chrome (DS-0081) ---

	it('renders the built-in services summary by default (6/7 up)', () => {
		const { container } = render(Topbar, {});
		const seg = container.querySelector('.seg[title="services"]')!;
		expect(seg).not.toBeNull();
		expect(seg.querySelector('.dot')).not.toBeNull();
		expect(seg.querySelector('.v')).toHaveTextContent('6');
		expect(seg.querySelector('.k')).toHaveTextContent('/7 up');
	});

	it('hides the services segment when services=false', () => {
		const { container } = render(Topbar, { services: false });
		expect(container.querySelector('.seg[title="services"]')).toBeNull();
		expect(container.querySelector('.dot')).toBeNull();
	});

	it('renders custom services data from services={ up, total }', () => {
		const { container } = render(Topbar, { services: { up: 2, total: 3 } });
		const seg = container.querySelector('.seg[title="services"]')!;
		expect(seg.querySelector('.v')).toHaveTextContent('2');
		expect(seg.querySelector('.k')).toHaveTextContent('/3 up');
	});

	it('hides the clock when clock=false', () => {
		const { container } = render(Topbar, { clock: false });
		expect(container.querySelector('.clock')).toBeNull();
	});

	it('omits the command chip when no onCommand handler is provided', () => {
		const { container } = render(Topbar, {});
		expect(container.querySelector('.cmd')).toBeNull();
		expect(screen.queryByRole('button', { name: /open command menu/i })).toBeNull();
	});

	it('ignores Cmd/Ctrl+K when no onCommand handler is provided', async () => {
		render(Topbar, {});
		const evt = new KeyboardEvent('keydown', { key: 'k', metaKey: true, cancelable: true });
		window.dispatchEvent(evt);
		expect(evt.defaultPrevented).toBe(false); // browser default left alone
	});

	it('removes each chrome piece independently and degrades to brand + tabs + user', () => {
		const { container } = render(Topbar, {
			services: false,
			clock: false,
			stats: []
		});
		// nothing dead renders…
		expect(container.querySelector('.seg[title="services"]')).toBeNull();
		expect(container.querySelector('.clock')).toBeNull();
		expect(container.querySelector('.cmd')).toBeNull();
		expect(container.querySelectorAll('.seg.stat.collapsible')).toHaveLength(0);
		// …while brand, tabs and the user control survive
		expect(container.querySelector('.logo')).not.toBeNull();
		expect(container.querySelectorAll('.ws .tab').length).toBeGreaterThan(0);
		expect(container.querySelector('.user-btn')).not.toBeNull();
	});

	it('minimal Topbar has no axe violations', async () => {
		const { container } = render(Topbar, { services: false, clock: false, stats: [] });
		expect(await axe(container, axeOpts)).toHaveNoViolations();
	});

	// --- responsive tab strip (DS-0082) ---
	// jsdom computes no layout/media queries; the visual collapse (stats at
	// ≤720px, strip at ≤520px) and the horizontal scroll are exercised in
	// Storybook. These tests pin the structural hooks the breakpoint CSS
	// relies on.

	it('renders every tab inside the single nav.ws scroll container', () => {
		const many = Array.from({ length: 12 }, (_, i) => `tab-${i}`);
		const { container } = render(Topbar, { tabs: many });
		expect(container.querySelectorAll('nav.ws')).toHaveLength(1);
		expect(container.querySelectorAll('nav.ws > .tab')).toHaveLength(12);
		// no tab escapes the strip — the bar itself never gains extra tab nodes
		expect(container.querySelectorAll('.ss-topbar > .tab')).toHaveLength(0);
	});

	it('marks only the optional stat segments with the collapsible hook', () => {
		const { container } = render(Topbar, {});
		const collapsibles = Array.from(container.querySelectorAll('.collapsible'));
		expect(collapsibles.length).toBeGreaterThan(0);
		for (const el of collapsibles) {
			expect(el).toHaveClass('stat'); // only stats hide at the first breakpoint
		}
		expect(container.querySelector('nav.ws')).not.toHaveClass('collapsible');
	});

	it('keeps overflowed tabs keyboard-reachable (End jumps to the last tab)', async () => {
		const many = Array.from({ length: 12 }, (_, i) => `tab-${i}`);
		const { container } = render(Topbar, { active: 'tab-0', tabs: many });
		const tabEls = Array.from(container.querySelectorAll('.ws .tab')) as HTMLElement[];
		tabEls[0].focus();
		await fireEvent.keyDown(tabEls[0], { key: 'End' });
		expect(document.activeElement).toBe(tabEls[11]);
	});
});
