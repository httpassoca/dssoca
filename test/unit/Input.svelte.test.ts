import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import InputHarness from '../harness/InputHarness.svelte';
import InputAffixHarness from '../harness/InputAffixHarness.svelte';

describe('Input', () => {
	it('renders the input without a label element when no label given', () => {
		const { container } = render(InputHarness, {});
		expect(container.querySelector('.ss-field label.lbl')).toBeNull();
		expect(container.querySelector('input.ss-input')).not.toBeNull();
	});

	it('renders a label associated to the input when a label is given', () => {
		const { container } = render(InputHarness, { label: 'Email', id: 'email' });
		const lbl = container.querySelector('label.lbl');
		expect(lbl).not.toBeNull();
		expect(lbl).toHaveAttribute('for', 'email');
		expect(lbl).toHaveTextContent('Email');
		expect(container.querySelector('input#email')).not.toBeNull();
	});

	it('always wraps the input in a .ss-field container', () => {
		const { container } = render(InputHarness, {});
		const field = container.querySelector('.ss-field');
		expect(field).not.toBeNull();
		expect(field!.querySelector('input.ss-input')).not.toBeNull();
	});

	it('defaults to type=text', () => {
		const { container } = render(InputHarness, {});
		expect(container.querySelector('input')).toHaveAttribute('type', 'text');
	});

	it('passes through type, name, id, placeholder, required, disabled', () => {
		const { container } = render(InputHarness, {
			type: 'password',
			name: 'pw',
			id: 'pw',
			placeholder: 'secret',
			required: true,
			disabled: true
		});
		const input = container.querySelector('input')!;
		expect(input).toHaveAttribute('type', 'password');
		expect(input).toHaveAttribute('name', 'pw');
		expect(input).toHaveAttribute('id', 'pw');
		expect(input).toHaveAttribute('placeholder', 'secret');
		expect(input).toBeRequired();
		expect(input).toBeDisabled();
	});

	it('reflects the initial bound value into the input', () => {
		const { container } = render(InputHarness, { initial: 'hello' });
		expect(container.querySelector('input')).toHaveValue('hello');
	});

	it('two-way binds: typing updates the parent-bound value', async () => {
		const { container } = render(InputHarness, {});
		const input = container.querySelector('input')!;
		await fireEvent.input(input, { target: { value: 'rafael' } });
		expect(screen.getByTestId('bound-value')).toHaveTextContent('rafael');
	});

	// ----- hint + error text (DS-0033) -----

	it('renders hint text and links it via aria-describedby', () => {
		const { container } = render(InputHarness, { id: 'e', hint: 'We never share it.' });
		const input = container.querySelector('input')!;
		const hint = container.querySelector('#e-hint')!;
		expect(hint).toHaveTextContent('We never share it.');
		expect(input.getAttribute('aria-describedby')).toContain('e-hint');
	});

	it('renders error text, marks invalid, and announces via role=alert', () => {
		const { container } = render(InputHarness, { id: 'e', error: 'Required field.' });
		const input = container.querySelector('input')!;
		const err = container.querySelector('#e-error')!;
		expect(err).toHaveTextContent('Required field.');
		expect(err).toHaveAttribute('role', 'alert');
		expect(input).toHaveAttribute('aria-invalid', 'true');
		expect(input.getAttribute('aria-describedby')).toContain('e-error');
	});

	it('orders aria-describedby as error, then hint, then caller describedby', () => {
		const { container } = render(InputHarness, {
			id: 'e',
			error: 'bad',
			hint: 'help',
			describedby: 'extra'
		});
		const input = container.querySelector('input')!;
		expect(input.getAttribute('aria-describedby')).toBe('e-error e-hint extra');
	});

	it('does not set aria-invalid when there is no error and invalid is unset', () => {
		const { container } = render(InputHarness, { id: 'e', hint: 'help' });
		expect(container.querySelector('input')).not.toHaveAttribute('aria-invalid');
	});

	it('respects the explicit invalid prop', () => {
		const { container } = render(InputHarness, { invalid: true });
		expect(container.querySelector('input')).toHaveAttribute('aria-invalid', 'true');
	});

	// ----- prefix / suffix slots (DS-0033) -----

	it('renders prefix/suffix snippets as aria-hidden affixes inside the control', () => {
		const { container, getByTestId } = render(InputAffixHarness, { label: 'Amount' });
		const control = container.querySelector('.control')!;
		expect(control).not.toBeNull();
		const prefix = container.querySelector('.affix.prefix')!;
		const suffix = container.querySelector('.affix.suffix')!;
		expect(prefix).toHaveAttribute('aria-hidden', 'true');
		expect(suffix).toHaveAttribute('aria-hidden', 'true');
		expect(prefix).toContainElement(getByTestId('prefix-icon'));
		expect(suffix).toContainElement(getByTestId('suffix-icon'));
		// the input sits between the affixes inside the control
		expect(control.querySelector('input.ss-input')).not.toBeNull();
	});

	// ----- native attributes (DS-0033) -----

	it('forwards readonly, autocomplete, inputmode, maxlength', () => {
		const { container } = render(InputHarness, {
			readonly: true,
			autocomplete: 'email',
			inputmode: 'email',
			maxlength: 12
		});
		const input = container.querySelector('input')!;
		expect(input).toHaveAttribute('readonly');
		expect(input).toHaveAttribute('autocomplete', 'email');
		expect(input).toHaveAttribute('inputmode', 'email');
		expect(input).toHaveAttribute('maxlength', '12');
	});

	it('forwards arbitrary native attributes via ...rest', () => {
		const { container } = render(InputHarness, { 'data-foo': 'bar', pattern: '[0-9]+' });
		const input = container.querySelector('input')!;
		expect(input).toHaveAttribute('data-foo', 'bar');
		expect(input).toHaveAttribute('pattern', '[0-9]+');
	});

	// ----- clearable (DS-0033) -----

	it('shows no clear button when empty', () => {
		const { container } = render(InputHarness, { clearable: true });
		expect(container.querySelector('button.clear')).toBeNull();
	});

	it('shows a clear button with an accessible name when there is a value', () => {
		const { container } = render(InputHarness, { clearable: true, initial: 'hi' });
		const btn = container.querySelector('button.clear')!;
		expect(btn).not.toBeNull();
		expect(btn).toHaveAttribute('aria-label', 'Clear');
		expect(btn).toHaveAttribute('type', 'button');
	});

	it('clear button empties the bound value', async () => {
		const { container } = render(InputHarness, { clearable: true, initial: 'hi' });
		await fireEvent.click(container.querySelector('button.clear')!);
		expect(screen.getByTestId('bound-value')).toHaveTextContent('');
		expect(container.querySelector('input')).toHaveValue('');
	});

	it('hides the clear button when readonly or disabled even with a value', () => {
		const ro = render(InputHarness, { clearable: true, initial: 'hi', readonly: true });
		expect(ro.container.querySelector('button.clear')).toBeNull();
		const dis = render(InputHarness, { clearable: true, initial: 'hi', disabled: true });
		expect(dis.container.querySelector('button.clear')).toBeNull();
	});

	// ----- required marker (DS-0033) -----

	it('shows a visible, aria-hidden required marker when label && required', () => {
		const { container } = render(InputHarness, { label: 'Email', required: true });
		const marker = container.querySelector('label.lbl .req')!;
		expect(marker).not.toBeNull();
		expect(marker).toHaveAttribute('aria-hidden', 'true');
	});

	it('shows no required marker when not required', () => {
		const { container } = render(InputHarness, { label: 'Email' });
		expect(container.querySelector('label.lbl .req')).toBeNull();
	});

	// ----- invalid / disabled state styling hooks (DS-0033) -----

	it('flags the .ss-field with invalid/disabled state classes', () => {
		const inv = render(InputHarness, { error: 'bad' });
		expect(inv.container.querySelector('.ss-field.invalid')).not.toBeNull();
		const dis = render(InputHarness, { disabled: true });
		expect(dis.container.querySelector('.ss-field.disabled')).not.toBeNull();
	});
});
