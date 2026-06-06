import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import InputHarness from '../harness/InputHarness.svelte';

describe('Input', () => {
	it('renders a bare input (no label wrapper) when no label given', () => {
		const { container } = render(InputHarness, {});
		expect(container.querySelector('label.hub-field')).toBeNull();
		expect(container.querySelector('input.hub-input')).not.toBeNull();
	});

	it('renders a labelled field wrapper when a label is given', () => {
		const { container } = render(InputHarness, { label: 'Email', id: 'email' });
		const field = container.querySelector('label.hub-field');
		expect(field).not.toBeNull();
		expect(field).toHaveAttribute('for', 'email');
		expect(container.querySelector('.lbl')).toHaveTextContent('Email');
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
});
