import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Sidebar from '$lib/components/Sidebar.svelte';

describe('Sidebar', () => {
	it('renders the default platform + services sections', () => {
		const { container } = render(Sidebar, {});
		const sections = Array.from(container.querySelectorAll('.section')).map((s) => s.textContent);
		expect(sections).toEqual(['platform', 'services']);
	});

	it('renders all default items as role=button entries', () => {
		const { container } = render(Sidebar, {});
		const labels = Array.from(container.querySelectorAll('.item span:not(.dot)')).map(
			(s) => s.textContent
		);
		expect(labels).toEqual(['Hub', 'Auth', 'Caddy', 'Movies', 'Notes', 'Tasks']);
	});

	it('renders an Icon svg inside each item', () => {
		const { container } = render(Sidebar, {});
		const items = container.querySelectorAll('.item');
		items.forEach((item) => expect(item.querySelector('svg')).not.toBeNull());
	});

	it('marks the active item (default hub)', () => {
		const { container } = render(Sidebar, {});
		const active = container.querySelector('.item.active');
		expect(active).toHaveTextContent('Hub');
	});

	it('marks a chosen active item', () => {
		const { container } = render(Sidebar, { active: 'movies' });
		expect(container.querySelector('.item.active')).toHaveTextContent('Movies');
	});

	it('renders custom groups when provided', () => {
		const { container } = render(Sidebar, {
			groups: [{ section: 'custom', items: [{ id: 'x', label: 'Xtra', icon: 'grid' }] }]
		});
		expect(container.querySelector('.section')).toHaveTextContent('custom');
		expect(container.querySelector('.item')).toHaveTextContent('Xtra');
	});

	it('calls onSelect with the item id when clicked', async () => {
		const onSelect = vi.fn();
		const { container } = render(Sidebar, { onSelect });
		const items = container.querySelectorAll<HTMLElement>('.item');
		// 4th item is 'movies'
		await fireEvent.click(items[3]);
		expect(onSelect).toHaveBeenCalledWith('movies');
	});

	it('calls onSelect on Enter keydown', async () => {
		const onSelect = vi.fn();
		const { container } = render(Sidebar, { onSelect });
		const first = container.querySelector<HTMLElement>('.item')!;
		await fireEvent.keyDown(first, { key: 'Enter' });
		expect(onSelect).toHaveBeenCalledWith('hub');
	});

	it('adds a warn/err dot class for degraded/down statuses', () => {
		const { container } = render(Sidebar, {
			groups: [
				{
					section: 's',
					items: [
						{ id: 'a', label: 'A', icon: 'grid', status: 'deg' },
						{ id: 'b', label: 'B', icon: 'grid', status: 'down' },
						{ id: 'c', label: 'C', icon: 'grid', status: 'up' }
					]
				}
			]
		});
		const items = container.querySelectorAll('.item');
		expect(items[0].querySelector('.dot')).toHaveClass('warn');
		expect(items[1].querySelector('.dot')).toHaveClass('err');
		const upDot = items[2].querySelector('.dot')!;
		expect(upDot).not.toHaveClass('warn');
		expect(upDot).not.toHaveClass('err');
	});
});
