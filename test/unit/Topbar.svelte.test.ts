import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Topbar from '$lib/components/Topbar.svelte';

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
});
