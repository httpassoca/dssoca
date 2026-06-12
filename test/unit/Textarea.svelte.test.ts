import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { axe } from 'vitest-axe';
import Textarea from '$lib/components/Textarea.svelte';

const axeOpts = {
	rules: {
		region: { enabled: false },
		'landmark-one-main': { enabled: false },
		'page-has-heading-one': { enabled: false },
		'color-contrast': { enabled: false }
	}
};

describe('Textarea', () => {
	it('renders the textarea without a label element when no label given', () => {
		const { container } = render(Textarea, {});
		expect(container.querySelector('.ss-textarea label.lbl')).toBeNull();
		expect(container.querySelector('.ss-textarea textarea.field')).not.toBeNull();
	});

	it('renders a label associated to the textarea when a label is given', () => {
		const { container } = render(Textarea, { label: 'Message', id: 'msg' });
		const lbl = container.querySelector('label.lbl');
		expect(lbl).not.toBeNull();
		expect(lbl).toHaveAttribute('for', 'msg');
		expect(lbl).toHaveTextContent('Message');
		expect(container.querySelector('textarea#msg')).not.toBeNull();
	});

	it('auto-generates an id so label and textarea stay associated', () => {
		const { container } = render(Textarea, { label: 'Message' });
		const lbl = container.querySelector('label.lbl')!;
		const ta = container.querySelector('textarea')!;
		expect(lbl.getAttribute('for')).toBeTruthy();
		expect(lbl.getAttribute('for')).toBe(ta.id);
	});

	it('always wraps the textarea in a .ss-textarea root', () => {
		const { container } = render(Textarea, {});
		const root = container.querySelector('.ss-textarea');
		expect(root).not.toBeNull();
		expect(root!.querySelector('textarea.field')).not.toBeNull();
	});

	it('passes through name, id, placeholder, required, disabled', () => {
		const { container } = render(Textarea, {
			name: 'msg',
			id: 'msg',
			placeholder: 'Say something…',
			required: true,
			disabled: true
		});
		const ta = container.querySelector('textarea')!;
		expect(ta).toHaveAttribute('name', 'msg');
		expect(ta).toHaveAttribute('id', 'msg');
		expect(ta).toHaveAttribute('placeholder', 'Say something…');
		expect(ta).toBeRequired();
		expect(ta).toBeDisabled();
	});

	it('reflects the initial bound value into the textarea', () => {
		const { container } = render(Textarea, { value: 'hello' });
		expect(container.querySelector('textarea')).toHaveValue('hello');
	});

	it('updates the value on input and calls the oninput handler', async () => {
		const oninput = vi.fn();
		const { container } = render(Textarea, { oninput });
		const ta = container.querySelector('textarea')!;
		await fireEvent.input(ta, { target: { value: 'multi\nline' } });
		expect(ta).toHaveValue('multi\nline');
		expect(oninput).toHaveBeenCalledOnce();
	});

	// ----- hint + error text (mirrors Input / DS-0033) -----

	it('renders hint text and links it via aria-describedby', () => {
		const { container } = render(Textarea, { id: 'm', hint: 'Markdown is fine.' });
		const ta = container.querySelector('textarea')!;
		const hint = container.querySelector('#m-hint')!;
		expect(hint).toHaveTextContent('Markdown is fine.');
		expect(ta.getAttribute('aria-describedby')).toContain('m-hint');
	});

	it('renders error text, marks invalid, and announces via role=alert', () => {
		const { container } = render(Textarea, { id: 'm', error: 'Required field.' });
		const ta = container.querySelector('textarea')!;
		const err = container.querySelector('#m-error')!;
		expect(err).toHaveTextContent('Required field.');
		expect(err).toHaveAttribute('role', 'alert');
		expect(ta).toHaveAttribute('aria-invalid', 'true');
		expect(ta.getAttribute('aria-describedby')).toContain('m-error');
	});

	it('orders aria-describedby as error, then hint, then caller describedby', () => {
		const { container } = render(Textarea, {
			id: 'm',
			error: 'bad',
			hint: 'help',
			describedby: 'extra'
		});
		const ta = container.querySelector('textarea')!;
		expect(ta.getAttribute('aria-describedby')).toBe('m-error m-hint extra');
	});

	it('does not set aria-invalid when there is no error and invalid is unset', () => {
		const { container } = render(Textarea, { id: 'm', hint: 'help' });
		expect(container.querySelector('textarea')).not.toHaveAttribute('aria-invalid');
	});

	it('respects the explicit invalid prop', () => {
		const { container } = render(Textarea, { invalid: true });
		expect(container.querySelector('textarea')).toHaveAttribute('aria-invalid', 'true');
	});

	// ----- native attributes -----

	it('forwards readonly and maxlength', () => {
		const { container } = render(Textarea, { readonly: true, maxlength: 200 });
		const ta = container.querySelector('textarea')!;
		expect(ta).toHaveAttribute('readonly');
		expect(ta).toHaveAttribute('maxlength', '200');
	});

	it('forwards arbitrary native attributes via ...rest', () => {
		const { container } = render(Textarea, { 'data-foo': 'bar', wrap: 'hard' });
		const ta = container.querySelector('textarea')!;
		expect(ta).toHaveAttribute('data-foo', 'bar');
		expect(ta).toHaveAttribute('wrap', 'hard');
	});

	// ----- rows + autosize (DS-0084) -----

	it('defaults to 3 rows', () => {
		const { container } = render(Textarea, {});
		expect(container.querySelector('textarea')).toHaveAttribute('rows', '3');
	});

	it('honours an explicit rows value', () => {
		const { container } = render(Textarea, { rows: 6 });
		expect(container.querySelector('textarea')).toHaveAttribute('rows', '6');
	});

	it('does not autosize by default', () => {
		const { container } = render(Textarea, {});
		const ta = container.querySelector('textarea')!;
		expect(ta).not.toHaveClass('autosize');
		expect(ta.style.maxHeight).toBe('');
	});

	it('autosize flags the field and caps growth via maxRows', () => {
		const { container } = render(Textarea, { autosize: true, maxRows: 8 });
		const ta = container.querySelector('textarea')!;
		expect(ta).toHaveClass('autosize');
		expect(ta.style.maxHeight).toBe('calc(8 * 1lh + 2 * var(--ss-input-py))');
	});

	it('autosize JS fallback resyncs the height when the value changes', async () => {
		// jsdom has no field-sizing support, so the scrollHeight fallback runs.
		const { container } = render(Textarea, { autosize: true });
		const ta = container.querySelector('textarea')!;
		await fireEvent.input(ta, { target: { value: 'one\ntwo\nthree' } });
		// jsdom reports scrollHeight 0; the point is that the effect wrote a height.
		expect(ta.style.height).toBe(`${ta.scrollHeight}px`);
	});

	// ----- required marker -----

	it('shows a visible, aria-hidden required marker when label && required', () => {
		const { container } = render(Textarea, { label: 'Message', required: true });
		const marker = container.querySelector('label.lbl .req')!;
		expect(marker).not.toBeNull();
		expect(marker).toHaveAttribute('aria-hidden', 'true');
	});

	it('shows no required marker when not required', () => {
		const { container } = render(Textarea, { label: 'Message' });
		expect(container.querySelector('label.lbl .req')).toBeNull();
	});

	// ----- invalid / disabled state styling hooks -----

	it('flags the .ss-textarea with invalid/disabled state classes', () => {
		const inv = render(Textarea, { error: 'bad' });
		expect(inv.container.querySelector('.ss-textarea.invalid')).not.toBeNull();
		const dis = render(Textarea, { disabled: true });
		expect(dis.container.querySelector('.ss-textarea.disabled')).not.toBeNull();
	});

	// ----- size -----

	it('applies the size prop as data-size-variant on the root', () => {
		const { container } = render(Textarea, { size: 'lg' });
		expect(container.querySelector('.ss-textarea')).toHaveAttribute('data-size-variant', 'lg');
	});

	it('inherits the ancestor size when no size prop is given', () => {
		const { container } = render(Textarea, {});
		expect(container.querySelector('.ss-textarea')).not.toHaveAttribute('data-size-variant');
	});

	// ----- a11y (axe) -----

	describe('a11y (axe)', () => {
		it('has no violations with label + hint', async () => {
			const { container } = render(Textarea, {
				label: 'Message',
				hint: 'Be nice.',
				placeholder: 'Say something…'
			});
			expect(await axe(container, axeOpts)).toHaveNoViolations();
		});

		it('has no violations in the error state', async () => {
			const { container } = render(Textarea, { label: 'Message', error: 'Required field.' });
			expect(await axe(container, axeOpts)).toHaveNoViolations();
		});

		it('has no violations when disabled / autosizing', async () => {
			const { container } = render(Textarea, { label: 'Notes', disabled: true, autosize: true });
			expect(await axe(container, axeOpts)).toHaveNoViolations();
		});
	});
});
