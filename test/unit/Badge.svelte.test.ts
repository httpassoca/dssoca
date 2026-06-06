import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import BadgeHarness from '../harness/BadgeHarness.svelte';

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

	it.each(['up', 'deg', 'down', 'info'] as const)('applies the %s tone class', (tone) => {
		const { container } = render(BadgeHarness, { tone, text: tone });
		expect(container.querySelector('.ss-badge')).toHaveClass(tone);
	});

	it('renders a dot for the known tones', () => {
		const { container } = render(BadgeHarness, { tone: 'up', text: 'up' });
		expect(container.querySelector('.ss-badge .dot')).not.toBeNull();
	});
});
