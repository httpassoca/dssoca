import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import MetricTile from '$lib/components/MetricTile.svelte';
import Sparkline from '$lib/components/Sparkline.svelte';
import PassocaMark from '$lib/components/PassocaMark.svelte';

describe('MetricTile', () => {
	it('renders the label and value', () => {
		const { container } = render(MetricTile, { label: 'Uptime', value: 99 });
		expect(container.querySelector('.label')).toHaveTextContent('Uptime');
		expect(container.querySelector('.val')).toHaveTextContent('99');
	});

	it('renders a string value too', () => {
		const { container } = render(MetricTile, { label: 'Host', value: 'hub.home' });
		expect(container.querySelector('.val')).toHaveTextContent('hub.home');
	});

	it('renders the suffix inside the value when provided', () => {
		const { container } = render(MetricTile, { label: 'CPU', value: 62, suffix: '%' });
		const small = container.querySelector('.val .small');
		expect(small).not.toBeNull();
		expect(small).toHaveTextContent('%');
	});

	it('omits the suffix element when not provided', () => {
		const { container } = render(MetricTile, { label: 'CPU', value: 62 });
		expect(container.querySelector('.val .small')).toBeNull();
	});

	it('shows an up delta with an ↑ arrow by default', () => {
		const { container } = render(MetricTile, { label: 'X', value: 1, delta: '5%' });
		const delta = container.querySelector('.delta');
		expect(delta).toHaveClass('up');
		expect(delta).toHaveTextContent('↑ 5%');
	});

	it('shows a down delta with a ↓ arrow', () => {
		const { container } = render(MetricTile, { label: 'X', value: 1, delta: '3%', dir: 'down' });
		const delta = container.querySelector('.delta');
		expect(delta).toHaveClass('down');
		expect(delta).toHaveTextContent('↓ 3%');
	});

	it('omits the delta element when no delta given', () => {
		const { container } = render(MetricTile, { label: 'X', value: 1 });
		expect(container.querySelector('.delta')).toBeNull();
	});
});

describe('Sparkline', () => {
	it('renders one bar per data point', () => {
		const { container } = render(Sparkline, { data: [1, 2, 3, 4] });
		expect(container.querySelectorAll('.ss-spark i')).toHaveLength(4);
	});

	// jsdom normalises inline style ("height: 100%; background: ...;"), so read
	// the resolved style properties rather than matching the raw attribute.
	it('scales the tallest bar to 100% height', () => {
		const { container } = render(Sparkline, { data: [5, 10] });
		const bars = container.querySelectorAll<HTMLElement>('.ss-spark i');
		expect(bars[1].style.height).toBe('100%');
	});

	it('floors bar height at 8% for tiny values', () => {
		const { container } = render(Sparkline, { data: [0, 100] });
		const bars = container.querySelectorAll<HTMLElement>('.ss-spark i');
		// 0/100*100 = 0 -> max(8, 0) = 8
		expect(bars[0].style.height).toBe('8%');
	});

	it('uses the default primary color var', () => {
		const { container } = render(Sparkline, { data: [1, 2] });
		const bar = container.querySelector<HTMLElement>('.ss-spark i')!;
		expect(bar.style.background).toBe('var(--ss-primary)');
	});

	it('applies a custom color', () => {
		const { container } = render(Sparkline, { data: [1, 2], color: 'red' });
		const bar = container.querySelector<HTMLElement>('.ss-spark i')!;
		expect(bar.style.background).toBe('red');
	});

	it('renders an empty spark container for empty data', () => {
		const { container } = render(Sparkline, { data: [] });
		expect(container.querySelector('.ss-spark')).not.toBeNull();
		expect(container.querySelectorAll('.ss-spark i')).toHaveLength(0);
	});
});

describe('PassocaMark', () => {
	it('renders an svg logo', () => {
		const { container } = render(PassocaMark, {});
		const svg = container.querySelector('svg');
		expect(svg).not.toBeNull();
		expect(svg).toHaveAttribute('viewBox', '0 0 103 89');
	});

	it('defaults to the --ss-icon token for width/height (inherits the active size)', () => {
		const { container } = render(PassocaMark, {});
		const svg = container.querySelector('svg')!;
		expect(svg.getAttribute('style')).toContain('width: var(--ss-icon)');
		expect(svg.getAttribute('style')).toContain('height: var(--ss-icon)');
	});

	it('applies an explicit px size and color', () => {
		const { container } = render(PassocaMark, { px: 40, color: '#abc' });
		const svg = container.querySelector('svg')!;
		expect(svg.getAttribute('style')).toContain('width: 40px');
		expect(svg).toHaveAttribute('fill', '#abc');
	});
});
