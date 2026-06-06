import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import ServiceCard from '$lib/components/ServiceCard.svelte';

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
});
