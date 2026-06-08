import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import { axe } from 'vitest-axe';
import ButtonHarness from '../harness/ButtonHarness.svelte';
import BadgeHarness from '../harness/BadgeHarness.svelte';
import CardHarness from '../harness/CardHarness.svelte';
import InputHarness from '../harness/InputHarness.svelte';
import ServiceCard from '$lib/components/ServiceCard.svelte';
import Sidebar from '$lib/components/Sidebar.svelte';
import MetricTile from '$lib/components/MetricTile.svelte';
import MetricTileHarness from '../harness/MetricTileHarness.svelte';
import Icon from '$lib/components/Icon.svelte';
import Toaster from '$lib/components/Toaster.svelte';
import { toasts } from '$lib/toast.svelte';

// jsdom can't compute layout, so `color-contrast` is unreliable here (covered by
// @storybook/addon-a11y in a real browser); and fragment-level renders lack the
// page landmarks/h1 that some rules expect. Disable those page-scope rules so we
// assert component-level a11y (roles, names, labels, aria).
const axeOpts = {
	rules: {
		region: { enabled: false },
		'landmark-one-main': { enabled: false },
		'page-has-heading-one': { enabled: false },
		'color-contrast': { enabled: false }
	}
};

describe('a11y (axe) — no violations', () => {
	it('Button', async () => {
		const { container } = render(ButtonHarness, { text: 'Save' });
		expect(await axe(container, axeOpts)).toHaveNoViolations();
	});

	it('Badge', async () => {
		const { container } = render(BadgeHarness, { tone: 'deg', text: 'degraded' });
		expect(await axe(container, axeOpts)).toHaveNoViolations();
	});

	it('Card', async () => {
		const { container } = render(CardHarness, { title: 'Stats', body: 'content' });
		expect(await axe(container, axeOpts)).toHaveNoViolations();
	});

	it('Input (labelled)', async () => {
		const { container } = render(InputHarness, { label: 'Email', type: 'email' });
		expect(await axe(container, axeOpts)).toHaveNoViolations();
	});

	it('ServiceCard', async () => {
		const { container } = render(ServiceCard, { name: 'movies', host: 'movies.home', status: 'deg' });
		expect(await axe(container, axeOpts)).toHaveNoViolations();
	});

	it('ServiceCard (link mode)', async () => {
		const { container } = render(ServiceCard, { name: 'movies', host: 'movies.home', href: '/svc/movies' });
		expect(await axe(container, axeOpts)).toHaveNoViolations();
	});

	it('ServiceCard (loading)', async () => {
		const { container } = render(ServiceCard, { name: 'movies', host: 'movies.home', loading: true });
		expect(await axe(container, axeOpts)).toHaveNoViolations();
	});

	it('ServiceCard (disabled, maintenance)', async () => {
		const { container } = render(ServiceCard, { name: 'movies', host: 'movies.home', status: 'maint', disabled: true });
		expect(await axe(container, axeOpts)).toHaveNoViolations();
	});

	it('Sidebar', async () => {
		const { container } = render(Sidebar, {});
		expect(await axe(container, axeOpts)).toHaveNoViolations();
	});

	it('MetricTile', async () => {
		const { container } = render(MetricTile, { label: 'cpu', value: 62, suffix: '%', delta: '5%' });
		expect(await axe(container, axeOpts)).toHaveNoViolations();
	});

	it('MetricTile (sentiment + period + chart slot)', async () => {
		const { container } = render(MetricTileHarness, {});
		expect(await axe(container, axeOpts)).toHaveNoViolations();
	});

	it('MetricTile (loading)', async () => {
		const { container } = render(MetricTile, { label: 'cpu', value: 62, delta: '5%', loading: true });
		expect(await axe(container, axeOpts)).toHaveNoViolations();
	});

	it('Icon (decorative, aria-hidden)', async () => {
		const { container } = render(Icon, { name: 'grid' });
		expect(await axe(container, axeOpts)).toHaveNoViolations();
	});

	it('Toaster (with action + loading toasts)', async () => {
		toasts.clear();
		const { container } = render(Toaster, {});
		toasts.push('info', 'undo me', { action: { label: 'Undo', onClick: () => {} } });
		toasts.push('loading', 'working…', 0);
		await Promise.resolve();
		expect(await axe(container, axeOpts)).toHaveNoViolations();
		toasts.clear();
	});

	it('Input (error + hint + clearable) — DS-0033', async () => {
		const { container } = render(InputHarness, {
			label: 'Email',
			type: 'email',
			error: 'Enter a valid email.',
			hint: 'Work address preferred.',
			required: true,
			clearable: true,
			initial: 'x'
		});
		expect(await axe(container, axeOpts)).toHaveNoViolations();
	});

	it('Button (loading, soft-disabled)', async () => {
		const { container } = render(ButtonHarness, { text: 'Save', loading: true, loadingLabel: 'Saving…' });
		expect(await axe(container, axeOpts)).toHaveNoViolations();
	});

	it('Button (icon-only, labelled)', async () => {
		const { container } = render(ButtonHarness, { iconOnly: true, label: 'Settings', text: '⚙' });
		expect(await axe(container, axeOpts)).toHaveNoViolations();
	});

	it('Icon (titled, role=img + aria-labelledby)', async () => {
		const { container } = render(Icon, { name: 'user', title: 'User profile' });
		expect(await axe(container, axeOpts)).toHaveNoViolations();
	});
});
