import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import { axe } from 'vitest-axe'
import DateFieldHarness from '../harness/DateFieldHarness.svelte'

const axeOpts = {
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'color-contrast': { enabled: false },
  },
}

describe('DateField', () => {
  it('always wraps a type=date input in a .ss-datefield container', () => {
    const { container } = render(DateFieldHarness, {})
    const field = container.querySelector('.ss-datefield')
    expect(field).not.toBeNull()
    const input = field!.querySelector('input')!
    expect(input).toHaveAttribute('type', 'date')
  })

  it('renders no label element when no label given', () => {
    const { container } = render(DateFieldHarness, {})
    expect(container.querySelector('.ss-datefield label.lbl')).toBeNull()
  })

  it('associates the label with the input (for === input id)', () => {
    const { container } = render(DateFieldHarness, { label: 'Start', id: 'start' })
    const lbl = container.querySelector('label.lbl')!
    expect(lbl).toHaveAttribute('for', 'start')
    expect(lbl).toHaveTextContent('Start')
    const input = container.querySelector('input#start')!
    expect(lbl.getAttribute('for')).toBe(input.getAttribute('id'))
  })

  it('reflects the initial bound value into the input', () => {
    const { container } = render(DateFieldHarness, { initial: '2026-06-15' })
    expect(container.querySelector('input')).toHaveValue('2026-06-15')
  })

  it('two-way binds: changing the input updates the parent-bound value', async () => {
    const { container } = render(DateFieldHarness, {})
    const input = container.querySelector('input')!
    await fireEvent.input(input, { target: { value: '2026-01-02' } })
    expect(screen.getByTestId('bound-value')).toHaveTextContent('2026-01-02')
  })

  it('forwards the min and max attributes', () => {
    const { container } = render(DateFieldHarness, { min: '2026-01-01', max: '2026-12-31' })
    const input = container.querySelector('input')!
    expect(input).toHaveAttribute('min', '2026-01-01')
    expect(input).toHaveAttribute('max', '2026-12-31')
  })

  it('passes through name, required and disabled', () => {
    const { container } = render(DateFieldHarness, { name: 'dob', required: true, disabled: true })
    const input = container.querySelector('input')!
    expect(input).toHaveAttribute('name', 'dob')
    expect(input).toBeRequired()
    expect(input).toBeDisabled()
  })

  it('reflects readonly on the input', () => {
    const { container } = render(DateFieldHarness, { readonly: true })
    expect(container.querySelector('input')).toHaveAttribute('readonly')
  })

  it('renders hint text and links it via aria-describedby', () => {
    const { container } = render(DateFieldHarness, { id: 'e', hint: 'Pick a weekday.' })
    const input = container.querySelector('input')!
    expect(container.querySelector('#e-hint')).toHaveTextContent('Pick a weekday.')
    expect(input.getAttribute('aria-describedby')).toContain('e-hint')
  })

  it('renders error text, marks invalid, and announces via role=alert', () => {
    const { container } = render(DateFieldHarness, { id: 'e', error: 'Date is required.' })
    const input = container.querySelector('input')!
    const err = container.querySelector('#e-error')!
    expect(err).toHaveTextContent('Date is required.')
    expect(err).toHaveAttribute('role', 'alert')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input.getAttribute('aria-describedby')).toContain('e-error')
  })

  it('orders aria-describedby as error, then hint, then caller describedby', () => {
    const { container } = render(DateFieldHarness, {
      id: 'e',
      error: 'bad',
      hint: 'help',
      describedby: 'extra',
    })
    const input = container.querySelector('input')!
    expect(input.getAttribute('aria-describedby')).toBe('e-error e-hint extra')
  })

  it('does not set aria-invalid when there is no error and invalid is unset', () => {
    const { container } = render(DateFieldHarness, { id: 'e', hint: 'help' })
    expect(container.querySelector('input')).not.toHaveAttribute('aria-invalid')
  })

  it('respects the explicit invalid prop', () => {
    const { container } = render(DateFieldHarness, { invalid: true })
    expect(container.querySelector('input')).toHaveAttribute('aria-invalid', 'true')
  })

  it('flags the .ss-datefield with invalid/disabled state classes', () => {
    const inv = render(DateFieldHarness, { error: 'bad' })
    expect(inv.container.querySelector('.ss-datefield.invalid')).not.toBeNull()
    const dis = render(DateFieldHarness, { disabled: true })
    expect(dis.container.querySelector('.ss-datefield.disabled')).not.toBeNull()
  })

  it('shows a visible, aria-hidden required marker when label && required', () => {
    const { container } = render(DateFieldHarness, { label: 'Start', required: true })
    const marker = container.querySelector('label.lbl .req')!
    expect(marker).not.toBeNull()
    expect(marker).toHaveAttribute('aria-hidden', 'true')
  })

  it('has no axe violations (labelled)', async () => {
    const { container } = render(DateFieldHarness, { label: 'Start date', id: 'start' })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })

  it('has no axe violations (with error)', async () => {
    const { container } = render(DateFieldHarness, {
      label: 'Start date',
      id: 'start',
      error: 'Date is required.',
    })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })
})
