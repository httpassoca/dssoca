import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import CardHarness from '../harness/CardHarness.svelte';

describe('Card', () => {
	it('renders children inside the panel body', () => {
		const { container } = render(CardHarness, { body: 'panel content' });
		expect(container.querySelector('.ss-panel-body')).toHaveTextContent('panel content');
	});

	it('omits the head when no title is given', () => {
		const { container } = render(CardHarness, { body: 'x' });
		expect(container.querySelector('.ss-panel-head')).toBeNull();
	});

	it('renders a head with the title when provided', () => {
		const { container } = render(CardHarness, { title: 'Stats', body: 'x' });
		expect(container.querySelector('.ss-panel-head')).not.toBeNull();
		expect(container.querySelector('.ss-panel-head .title')).toHaveTextContent('Stats');
	});

	it('renders the meta text when provided alongside a title', () => {
		const { container } = render(CardHarness, { title: 'Stats', meta: 'updated 2m ago', body: 'x' });
		expect(container.querySelector('.meta')).toHaveTextContent('updated 2m ago');
	});

	it('omits the meta element when not provided', () => {
		const { container } = render(CardHarness, { title: 'Stats', body: 'x' });
		expect(container.querySelector('.meta')).toBeNull();
	});

	it('renders the action snippet in the head when provided', () => {
		const { container } = render(CardHarness, { title: 'Stats', withAction: true, body: 'x' });
		expect(container.querySelector('.card-action')).not.toBeNull();
	});
});
