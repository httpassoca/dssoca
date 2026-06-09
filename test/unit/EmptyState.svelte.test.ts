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

	// --- variant + role (announce) -------------------------------------

	it('applies the no-results variant class', () => {
		const { container } = render(EmptyStateHarness, { variant: 'no-results', title: 'Nothing' });
		expect(container.querySelector('.ss-empty')).toHaveClass('no-results');
	});

	it('uses role="alert" only for the error variant', () => {
		const { container } = render(EmptyStateHarness, { variant: 'error', title: 'Failed' });
		expect(container.querySelector('.ss-empty')).toHaveAttribute('role', 'alert');
	});

	it('uses polite role="status" for the no-results variant (not alert)', () => {
		const { container } = render(EmptyStateHarness, { variant: 'no-results', title: 'None' });
		const root = container.querySelector('.ss-empty');
		expect(root).toHaveAttribute('role', 'status');
		expect(root).not.toHaveAttribute('role', 'alert');
	});

	it('uses role="status" for the empty variant', () => {
		const { container } = render(EmptyStateHarness, { title: 'x' });
		expect(container.querySelector('.ss-empty')).toHaveAttribute('role', 'status');
	});

	it('sets aria-atomic on the live region', () => {
		const { container } = render(EmptyStateHarness, { variant: 'no-results', title: 'x' });
		expect(container.querySelector('.ss-empty')).toHaveAttribute('aria-atomic', 'true');
	});

	// --- secondary action + footer -------------------------------------

	it('renders the primary and secondary actions side by side', () => {
		const { container } = render(EmptyStateHarness, {
			title: 'x',
			withAction: true,
			withSecondaryAction: true
		});
		const act = container.querySelector('.act');
		expect(act?.querySelector('.empty-action')).not.toBeNull();
		expect(act?.querySelector('.empty-secondary')).not.toBeNull();
	});

	it('renders the action wrapper when only a secondary action is given', () => {
		const { container } = render(EmptyStateHarness, { title: 'x', withSecondaryAction: true });
		expect(container.querySelector('.act .empty-secondary')).not.toBeNull();
	});

	it('renders the footer snippet when provided', () => {
		const { container } = render(EmptyStateHarness, { title: 'x', withFooter: true });
		expect(container.querySelector('.foot .empty-footer')).not.toBeNull();
	});

	it('omits the footer when not provided', () => {
		const { container } = render(EmptyStateHarness, { title: 'x' });
		expect(container.querySelector('.foot')).toBeNull();
	});

	// --- visual slot ----------------------------------------------------

	it('renders the visual snippet in an aria-hidden container', () => {
		const { container } = render(EmptyStateHarness, { title: 'x', withVisual: true });
		const ic = container.querySelector('.ic');
		expect(ic).not.toBeNull();
		expect(ic).toHaveAttribute('aria-hidden', 'true');
		expect(ic?.querySelector('.empty-visual')).not.toBeNull();
	});

	it('prefers the visual snippet over the icon glyph', () => {
		const { container } = render(EmptyStateHarness, {
			title: 'x',
			icon: '🎬',
			withVisual: true
		});
		const ic = container.querySelector('.ic');
		expect(ic?.querySelector('.empty-visual')).not.toBeNull();
		expect(ic).not.toHaveClass('glyph');
		expect(ic).not.toHaveTextContent('🎬');
	});

	it('marks the glyph icon container with the glyph class', () => {
		const { container } = render(EmptyStateHarness, { title: 'x', icon: '🎬' });
		expect(container.querySelector('.ic')).toHaveClass('glyph');
	});

	// --- heading semantics ---------------------------------------------

	it('renders the title as a heading with the given level by default', () => {
		const { container } = render(EmptyStateHarness, { title: 'x', headingLevel: 3 });
		const title = container.querySelector('.title');
		expect(title).toHaveAttribute('role', 'heading');
		expect(title).toHaveAttribute('aria-level', '3');
	});

	it('renders the title as a plain paragraph when headingLevel is false', () => {
		const { container } = render(EmptyStateHarness, { title: 'x', headingLevel: false });
		const title = container.querySelector('.title');
		expect(title).not.toBeNull();
		expect(title).not.toHaveAttribute('role', 'heading');
		expect(title).not.toHaveAttribute('aria-level');
	});

	// --- density + width ------------------------------------------------

	it('applies the compact density class', () => {
		const { container } = render(EmptyStateHarness, { title: 'x', compact: true });
		expect(container.querySelector('.ss-empty')).toHaveClass('compact');
	});

	it('does not apply the compact class by default', () => {
		const { container } = render(EmptyStateHarness, { title: 'x' });
		expect(container.querySelector('.ss-empty')).not.toHaveClass('compact');
	});

	it('applies the full-width override class', () => {
		const { container } = render(EmptyStateHarness, { title: 'x', fullWidth: true });
		expect(container.querySelector('.ss-empty')).toHaveClass('full-width');
	});

	it('does not apply the full-width class by default', () => {
		const { container } = render(EmptyStateHarness, { title: 'x' });
		expect(container.querySelector('.ss-empty')).not.toHaveClass('full-width');
	});
});
