import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import MetricTile from '$lib/components/MetricTile.svelte';
import MetricTileHarness from '../harness/MetricTileHarness.svelte';
import Sparkline from '$lib/components/Sparkline.svelte';

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

	it('shows an up delta with an ↑ arrow, positive sentiment by default', () => {
		const { container } = render(MetricTile, { label: 'X', value: 1, delta: '5%' });
		const delta = container.querySelector('.delta');
		expect(delta).toHaveClass('positive');
		expect(delta).toHaveTextContent('↑ 5%');
	});

	it('shows a down delta with a ↓ arrow, negative sentiment by default', () => {
		const { container } = render(MetricTile, { label: 'X', value: 1, delta: '3%', dir: 'down' });
		const delta = container.querySelector('.delta');
		expect(delta).toHaveClass('negative');
		expect(delta).toHaveTextContent('↓ 3%');
	});

	it('omits the delta element when no delta given', () => {
		const { container } = render(MetricTile, { label: 'X', value: 1 });
		expect(container.querySelector('.delta')).toBeNull();
	});

	// --- DS-0037: sentiment decoupled from direction ---------------------------

	it('decouples sentiment from arrow direction (rising = negative)', () => {
		const { container } = render(MetricTile, {
			label: 'errors',
			value: 1,
			delta: '12%',
			dir: 'up',
			trend: 'negative',
		});
		const delta = container.querySelector('.delta')!;
		// arrow still points up, but the colour class reads negative
		expect(delta).toHaveClass('negative');
		expect(delta).not.toHaveClass('positive');
		expect(delta).toHaveTextContent('↑ 12%');
	});

	it('supports a neutral sentiment', () => {
		const { container } = render(MetricTile, { label: 'X', value: 1, delta: '0%', trend: 'neutral' });
		expect(container.querySelector('.delta')).toHaveClass('neutral');
	});

	it('hides the arrow glyph from AT and gives the delta a worded label', () => {
		const { container } = render(MetricTile, { label: 'X', value: 1, delta: '5%' });
		const delta = container.querySelector('.delta')!;
		expect(delta).toHaveAttribute('aria-label', 'increased 5%');
		// the visible glyph + text is aria-hidden so the label is the only AT signal
		expect(delta.querySelector('[aria-hidden="true"]')).toHaveTextContent('↑ 5%');
	});

	it('words a decreased delta in the accessible label', () => {
		const { container } = render(MetricTile, { label: 'X', value: 1, delta: '3%', dir: 'down' });
		expect(container.querySelector('.delta')).toHaveAttribute('aria-label', 'decreased 3%');
	});

	// --- DS-0037: comparison-period label --------------------------------------

	it('renders a faint comparison-period label and weaves it into the description', () => {
		const { container } = render(MetricTile, {
			label: 'X',
			value: 1,
			delta: '12%',
			deltaLabel: 'vs prev 7d',
		});
		const delta = container.querySelector('.delta')!;
		const period = delta.querySelector('.period');
		expect(period).toHaveTextContent('vs prev 7d');
		expect(period).toHaveAttribute('aria-hidden', 'true');
		expect(delta).toHaveAttribute('aria-label', 'increased 12% vs prev 7d');
	});

	it('omits the period element when no deltaLabel given', () => {
		const { container } = render(MetricTile, { label: 'X', value: 1, delta: '5%' });
		expect(container.querySelector('.delta .period')).toBeNull();
	});

	// --- DS-0037: emphasis chip ------------------------------------------------

	it('renders the delta as an emphasis chip when opted in', () => {
		const { container } = render(MetricTile, { label: 'X', value: 1, delta: '5%', emphasis: true });
		expect(container.querySelector('.delta')).toHaveClass('emphasis');
	});

	it('does not add the emphasis class by default', () => {
		const { container } = render(MetricTile, { label: 'X', value: 1, delta: '5%' });
		expect(container.querySelector('.delta')).not.toHaveClass('emphasis');
	});

	// --- DS-0037: prefix -------------------------------------------------------

	it('renders a leading prefix styled like the suffix', () => {
		const { container } = render(MetricTile, { label: 'rev', value: 42, prefix: '$', suffix: 'k' });
		const smalls = container.querySelectorAll('.val .small');
		expect(smalls).toHaveLength(2);
		expect(smalls[0]).toHaveTextContent('$');
		expect(smalls[1]).toHaveTextContent('k');
		expect(container.querySelector('.val')).toHaveTextContent('$42k');
	});

	it('omits the prefix element when not provided', () => {
		const { container } = render(MetricTile, { label: 'X', value: 1 });
		expect(container.querySelector('.val .small')).toBeNull();
	});

	// --- DS-0037: loading / skeleton state -------------------------------------

	it('renders skeleton bars and aria-busy when loading', () => {
		const { container } = render(MetricTile, { label: 'X', value: 1, delta: '5%', loading: true });
		const root = container.querySelector('.ss-metric')!;
		expect(root).toHaveAttribute('aria-busy', 'true');
		expect(container.querySelector('.skeleton-val')).not.toBeNull();
		expect(container.querySelector('.skeleton-delta')).not.toBeNull();
		// the real value/delta are not rendered while loading
		expect(container.querySelector('.val')).toBeNull();
		expect(container.querySelector('.delta')).toBeNull();
		// skeleton bars are decorative
		expect(container.querySelector('.skeleton-val')).toHaveAttribute('aria-hidden', 'true');
	});

	it('announces the value via a live region when not loading', () => {
		const { container } = render(MetricTile, { label: 'X', value: 99 });
		const val = container.querySelector('.val')!;
		expect(val).toHaveAttribute('role', 'status');
		expect(val).toHaveAttribute('aria-live', 'polite');
		expect(container.querySelector('.ss-metric')).not.toHaveAttribute('aria-busy');
	});

	// --- DS-0037: trend/chart snippet slot -------------------------------------

	it('renders a chart snippet slot below the delta', () => {
		const { container } = render(MetricTileHarness, {});
		const chart = container.querySelector('.chart');
		expect(chart).not.toBeNull();
		expect(chart!.querySelector('.ss-spark')).not.toBeNull();
		// slot sits after the delta in document order
		const root = container.querySelector('.ss-metric')!;
		const kids = Array.from(root.children);
		expect(kids.indexOf(root.querySelector('.delta')!)).toBeLessThan(
			kids.indexOf(chart!),
		);
	});

	it('omits the chart wrapper when no snippet passed', () => {
		const { container } = render(MetricTile, { label: 'X', value: 1 });
		expect(container.querySelector('.chart')).toBeNull();
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
