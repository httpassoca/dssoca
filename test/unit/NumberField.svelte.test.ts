import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import { axe } from 'vitest-axe'
import NumberFieldHarness from '../harness/NumberFieldHarness.svelte'

const axeOpts = {
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'color-contrast': { enabled: false },
  },
}

describe('NumberField', () => {
  it('associates the label with a number input', () => {
    const { container } = render(NumberFieldHarness, { label: 'Replicas', id: 'replicas' })
    const lbl = container.querySelector('label.lbl')!
    const input = container.querySelector('input')!
    expect(lbl).toHaveAttribute('for', 'replicas')
    expect(input).toHaveAttribute('id', 'replicas')
    expect(input).toHaveAttribute('type', 'number')
    expect(input).toHaveAttribute('inputmode', 'decimal')
  })

  it('increments the value by step when the + stepper is clicked', async () => {
    const { container } = render(NumberFieldHarness, { initial: 2 })
    await fireEvent.click(container.querySelector('button.inc')!)
    expect(screen.getByTestId('bound-value')).toHaveTextContent('3')
  })

  it('decrements the value by step when the − stepper is clicked', async () => {
    const { container } = render(NumberFieldHarness, { initial: 2 })
    await fireEvent.click(container.querySelector('button.dec')!)
    expect(screen.getByTestId('bound-value')).toHaveTextContent('1')
  })

  it('respects a custom step', async () => {
    const { container } = render(NumberFieldHarness, { initial: 10, step: 5 })
    await fireEvent.click(container.querySelector('button.inc')!)
    expect(screen.getByTestId('bound-value')).toHaveTextContent('15')
  })

  it('clamps to max when incrementing past the upper bound', async () => {
    const { container } = render(NumberFieldHarness, { initial: 9, max: 10, step: 5 })
    await fireEvent.click(container.querySelector('button.inc')!)
    expect(screen.getByTestId('bound-value')).toHaveTextContent('10')
  })

  it('clamps to min when decrementing past the lower bound', async () => {
    const { container } = render(NumberFieldHarness, { initial: 1, min: 0, step: 5 })
    await fireEvent.click(container.querySelector('button.dec')!)
    expect(screen.getByTestId('bound-value')).toHaveTextContent('0')
  })

  it('disables the − stepper at min', () => {
    const { container } = render(NumberFieldHarness, { initial: 0, min: 0 })
    expect(container.querySelector('button.dec')).toBeDisabled()
    expect(container.querySelector('button.inc')).not.toBeDisabled()
  })

  it('disables the + stepper at max', () => {
    const { container } = render(NumberFieldHarness, { initial: 10, max: 10 })
    expect(container.querySelector('button.inc')).toBeDisabled()
    expect(container.querySelector('button.dec')).not.toBeDisabled()
  })

  it('typing a number updates the bound value', async () => {
    const { container } = render(NumberFieldHarness, {})
    await fireEvent.input(container.querySelector('input')!, { target: { value: '42' } })
    expect(screen.getByTestId('bound-value')).toHaveTextContent('42')
  })

  it('clearing the input yields null', async () => {
    const { container } = render(NumberFieldHarness, { initial: 5 })
    await fireEvent.input(container.querySelector('input')!, { target: { value: '' } })
    expect(screen.getByTestId('bound-value')).toHaveTextContent('null')
  })

  it('renders error text, marks invalid, and announces via role=alert', () => {
    const { container } = render(NumberFieldHarness, { id: 'n', error: 'Out of range.' })
    const input = container.querySelector('input')!
    const err = container.querySelector('#n-error')!
    expect(err).toHaveTextContent('Out of range.')
    expect(err).toHaveAttribute('role', 'alert')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input.getAttribute('aria-describedby')).toContain('n-error')
  })

  it('orders aria-describedby as error, then hint, then caller describedby', () => {
    const { container } = render(NumberFieldHarness, {
      id: 'n',
      error: 'bad',
      hint: 'help',
      describedby: 'extra',
    })
    expect(container.querySelector('input')!.getAttribute('aria-describedby')).toBe(
      'n-error n-hint extra',
    )
  })

  it('disables the input and both steppers when disabled', () => {
    const { container } = render(NumberFieldHarness, { initial: 5, disabled: true })
    expect(container.querySelector('input')).toBeDisabled()
    expect(container.querySelector('button.dec')).toBeDisabled()
    expect(container.querySelector('button.inc')).toBeDisabled()
    expect(container.querySelector('.ss-numberfield.disabled')).not.toBeNull()
  })

  it('has no axe violations', async () => {
    const { container } = render(NumberFieldHarness, {
      label: 'Replicas',
      hint: 'Between 1 and 10.',
      initial: 3,
      min: 1,
      max: 10,
    })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })
})
