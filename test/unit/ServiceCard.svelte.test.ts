import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import ServiceCard from '$lib/components/ServiceCard.svelte';
import ServiceCardHarness from '../harness/ServiceCardHarness.svelte';

describe('ServiceCard', () => {
	it('renders the name and host', () => {
		const { container } = render(ServiceCard, { name: 'movies-api', host: 'movies.home' });
		expect(container.querySelector('.name')).toHaveTextContent('movies-api');
		expect(container.querySelector('.host')).toHaveTextContent('movies.home');
	});

	it('renders a status badge (default up)', () => {
		const { container } = render(ServiceCard, { name: 'x', host: 'x.home' });
		const badge = container.querySelector('.ss-badge');
		expect(badge).toHaveClass('up');
		expect(badge).toHaveTextContent('up');
	});

	it('reflects a down status into the badge', () => {
		const { container } = render(ServiceCard, { name: 'x', host: 'x.home', status: 'down' });
		const badge = container.querySelector('.ss-badge');
		expect(badge).toHaveClass('down');
		expect(badge).toHaveTextContent('down');
	});

	it('spells "deg" out as "degraded" in the badge', () => {
		const { container } = render(ServiceCard, { name: 'x', host: 'x.home', status: 'deg' });
		const badge = container.querySelector('.ss-badge');
		expect(badge).toHaveClass('deg');
		expect(badge).toHaveTextContent('degraded');
	});

	it('supports a maintenance status (distinct tone + spelled-out label)', () => {
		const { container } = render(ServiceCard, { name: 'x', host: 'x.home', status: 'maint' });
		const badge = container.querySelector('.ss-badge');
		expect(badge).toHaveClass('maint');
		expect(badge).not.toHaveClass('down');
		expect(badge).toHaveTextContent('maintenance');
	});

	it('renders the latency text', () => {
		const { container } = render(ServiceCard, { name: 'x', host: 'x.home', latency: '4ms' });
		expect(container.querySelector('.latency')).toHaveTextContent('4ms');
	});

	it('renders a sparkline from the spark data', () => {
		const { container } = render(ServiceCard, {
			name: 'x',
			host: 'x.home',
			spark: [1, 2, 3]
		});
		expect(container.querySelectorAll('.ss-spark i')).toHaveLength(3);
	});

	it('exposes the card as a role=button and is keyboard focusable', () => {
		render(ServiceCard, { name: 'x', host: 'x.home' });
		const card = screen.getByRole('button');
		expect(card).toHaveClass('ss-svc');
		expect(card).toHaveAttribute('tabindex', '0');
	});

	it('folds the spelled-out status into the accessible name', () => {
		render(ServiceCard, { name: 'movies', host: 'movies.home', status: 'deg' });
		expect(screen.getByRole('button')).toHaveAccessibleName('movies, degraded');
	});

	it('fires onclick when the card is clicked', async () => {
		const onclick = vi.fn();
		render(ServiceCard, { name: 'x', host: 'x.home', onclick });
		await fireEvent.click(screen.getByRole('button'));
		expect(onclick).toHaveBeenCalledOnce();
	});

	it('fires onclick on Enter keydown', async () => {
		const onclick = vi.fn();
		render(ServiceCard, { name: 'x', host: 'x.home', onclick });
		await fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
		expect(onclick).toHaveBeenCalledOnce();
	});

	describe('link mode (href)', () => {
		it('renders a real <a> with the href and accessible name when href is set', () => {
			render(ServiceCard, { name: 'movies', host: 'movies.home', href: '/svc/movies' });
			const link = screen.getByRole('link');
			expect(link).toHaveClass('ss-svc');
			expect(link).toHaveAttribute('href', '/svc/movies');
			expect(link).toHaveAccessibleName('movies, up');
		});

		it('does not render a role=button div in link mode (Enter is native)', () => {
			render(ServiceCard, { name: 'x', host: 'x.home', href: '/x' });
			expect(screen.queryByRole('button')).toBeNull();
			expect(screen.getByRole('link')).not.toHaveAttribute('tabindex');
		});

		it('still fires onclick on the anchor', async () => {
			const onclick = vi.fn();
			render(ServiceCard, { name: 'x', host: 'x.home', href: '/x', onclick });
			await fireEvent.click(screen.getByRole('link'));
			expect(onclick).toHaveBeenCalledOnce();
		});
	});

	describe('loading state', () => {
		it('marks the root aria-busy and renders skeletons instead of content', () => {
			const { container } = render(ServiceCard, { name: 'x', host: 'x.home', loading: true });
			const root = container.querySelector('.ss-svc')!;
			expect(root).toHaveClass('loading');
			expect(root).toHaveAttribute('aria-busy', 'true');
			expect(container.querySelectorAll('.sk').length).toBeGreaterThan(0);
		});

		it('suppresses the click affordance while loading (no role=button/link)', () => {
			render(ServiceCard, { name: 'x', host: 'x.home', loading: true, onclick: () => {} });
			expect(screen.queryByRole('button')).toBeNull();
			expect(screen.queryByRole('link')).toBeNull();
		});

		it('hides the real name/host/badge/sparkline while loading', () => {
			const { container } = render(ServiceCard, { name: 'movies', host: 'movies.home', loading: true });
			expect(container.querySelector('.name')).toBeNull();
			expect(container.querySelector('.host')).toBeNull();
			expect(container.querySelector('.ss-badge')).toBeNull();
			expect(container.querySelector('.ss-spark')).toBeNull();
		});
	});

	describe('disabled variant', () => {
		it('sets aria-disabled, drops tabindex/role and ignores onclick', async () => {
			const onclick = vi.fn();
			const { container } = render(ServiceCard, { name: 'x', host: 'x.home', disabled: true, onclick });
			const root = container.querySelector('.ss-svc')!;
			expect(root).toHaveClass('disabled');
			expect(root).toHaveAttribute('aria-disabled', 'true');
			expect(root).not.toHaveAttribute('tabindex');
			expect(screen.queryByRole('button')).toBeNull();
			await fireEvent.click(root);
			expect(onclick).not.toHaveBeenCalled();
		});
	});

	describe('updatedAt timestamp', () => {
		it('renders a <time datetime> with the ISO instant', () => {
			const when = new Date('2026-06-08T12:00:00.000Z');
			const { container } = render(ServiceCard, { name: 'x', host: 'x.home', updatedAt: when });
			const time = container.querySelector('time');
			expect(time).not.toBeNull();
			expect(time).toHaveAttribute('datetime', when.toISOString());
		});

		it('accepts an ISO string and ignores invalid input', () => {
			const { container: ok } = render(ServiceCard, {
				name: 'x', host: 'x.home', updatedAt: '2026-06-08T12:00:00.000Z'
			});
			expect(ok.querySelector('time')).not.toBeNull();

			const { container: bad } = render(ServiceCard, {
				name: 'x', host: 'x.home', updatedAt: 'not-a-date'
			});
			expect(bad.querySelector('time')).toBeNull();
		});
	});

	describe('meta snippet', () => {
		it('renders extra metadata rows passed via the meta snippet', () => {
			const { container } = render(ServiceCardHarness, { metaText: 'v9.9.9' });
			const meta = container.querySelector('.meta');
			expect(meta).not.toBeNull();
			expect(meta).toHaveTextContent('v9.9.9');
		});
	});
});
