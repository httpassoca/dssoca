import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import EmptyStateHarness from '../harness/EmptyStateHarness.svelte';

describe('EmptyState', () => {
	it('renders the title', () => {
		const { container } = render(EmptyStateHarness, { title: 'Nothing here' });
		expect(container.querySelector('.title')).toHaveTextContent('Nothing here');
	});

	it('defaults to the empty variant', () => {
		const { container } = render(EmptyStateHarness, { title: 'x' });
		const root = container.querySelector('.ss-empty');
		expect(root).toHaveClass('empty');
		expect(root).not.toHaveClass('error');
	});

	it('applies the error variant class', () => {
		const { container } = render(EmptyStateHarness, { variant: 'error', title: 'Failed' });
		expect(container.querySelector('.ss-empty')).toHaveClass('error');
	});

	it('renders the message when provided', () => {
		const { container } = render(EmptyStateHarness, {
			title: 'Failed',
			message: 'The service is unreachable'
		});
		expect(container.querySelector('.msg')).toHaveTextContent('The service is unreachable');
	});

	it('omits the message element when not provided', () => {
		const { container } = render(EmptyStateHarness, { title: 'x' });
		expect(container.querySelector('.msg')).toBeNull();
	});

	it('renders the icon glyph when provided', () => {
		const { container } = render(EmptyStateHarness, { title: 'x', icon: '🎬' });
		expect(container.querySelector('.ic')).toHaveTextContent('🎬');
	});

	it('omits the icon element when not provided', () => {
		const { container } = render(EmptyStateHarness, { title: 'x' });
		expect(container.querySelector('.ic')).toBeNull();
	});

	it('renders the action snippet when provided', () => {
		const { container } = render(EmptyStateHarness, { title: 'x', withAction: true });
		expect(container.querySelector('.act .empty-action')).not.toBeNull();
	});

	it('omits the action wrapper when not provided', () => {
		const { container } = render(EmptyStateHarness, { title: 'x' });
		expect(container.querySelector('.act')).toBeNull();
	});
});
