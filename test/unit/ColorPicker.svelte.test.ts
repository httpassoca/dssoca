import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { axe } from 'vitest-axe'
import ColorPicker, { DEFAULT_PRESETS } from '$lib/components/ColorPicker.svelte'

const axeOpts = {
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'color-contrast': { enabled: false },
  },
}

const PRESETS = ['#66ef73', '#9aa4ff', '#b98cff']

const swatches = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLButtonElement>('.swatch'))
const hexInput = (container: HTMLElement) => container.querySelector<HTMLInputElement>('.hex')!
const nativeInput = (container: HTMLElement) =>
  container.querySelector<HTMLInputElement>('.native')!

describe('ColorPicker', () => {
  it('renders a swatch button per preset', () => {
    const { container } = render(ColorPicker, { presets: PRESETS })
    expect(swatches(container)).toHaveLength(PRESETS.length)
  })

  it('uses a sensible default palette when no presets are given', () => {
    const { container } = render(ColorPicker, {})
    expect(swatches(container)).toHaveLength(DEFAULT_PRESETS.length)
  })

  it('labels each swatch with its colour', () => {
    const { container } = render(ColorPicker, { presets: PRESETS })
    expect(swatches(container)[0]).toHaveAttribute('aria-label', '#66ef73')
  })

  it('clicking a swatch updates value and calls onChange with that colour', async () => {
    const onChange = vi.fn()
    const { container } = render(ColorPicker, { presets: PRESETS, onChange })
    await fireEvent.click(swatches(container)[1])
    expect(onChange).toHaveBeenCalledWith('#9aa4ff')
  })

  it('reflects the selected swatch via aria-pressed and the selected class', () => {
    const { container } = render(ColorPicker, { presets: PRESETS, value: '#b98cff' })
    const [first, , third] = swatches(container)
    expect(third).toHaveAttribute('aria-pressed', 'true')
    expect(third).toHaveClass('selected')
    expect(first).toHaveAttribute('aria-pressed', 'false')
    expect(first).not.toHaveClass('selected')
  })

  it('matches the selected swatch case-insensitively / regardless of leading #', () => {
    const { container } = render(ColorPicker, { presets: ['#66EF73'], value: '66ef73' })
    expect(swatches(container)[0]).toHaveAttribute('aria-pressed', 'true')
  })

  it('typing a valid hex in the text input updates value and calls onChange', async () => {
    const onChange = vi.fn()
    const { container } = render(ColorPicker, { presets: PRESETS, onChange })
    await fireEvent.input(hexInput(container), { target: { value: '#abcdef' } })
    expect(onChange).toHaveBeenCalledWith('#abcdef')
  })

  it('normalises a typed hex without a leading # (and lowercases it)', async () => {
    const onChange = vi.fn()
    const { container } = render(ColorPicker, { presets: PRESETS, onChange })
    await fireEvent.input(hexInput(container), { target: { value: 'ABCDEF' } })
    expect(onChange).toHaveBeenCalledWith('#abcdef')
  })

  it('ignores an invalid hex (no onChange, does not crash)', async () => {
    const onChange = vi.fn()
    const { container } = render(ColorPicker, { presets: PRESETS, onChange })
    await fireEvent.input(hexInput(container), { target: { value: 'nothex' } })
    await fireEvent.input(hexInput(container), { target: { value: '#12' } })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('updates value when the native colour input changes', async () => {
    const onChange = vi.fn()
    const { container } = render(ColorPicker, { presets: PRESETS, onChange })
    await fireEvent.input(nativeInput(container), { target: { value: '#123456' } })
    expect(onChange).toHaveBeenCalledWith('#123456')
  })

  it('disables all three controls when disabled', () => {
    const { container } = render(ColorPicker, { presets: PRESETS, disabled: true })
    for (const s of swatches(container)) expect(s).toBeDisabled()
    expect(nativeInput(container)).toBeDisabled()
    expect(hexInput(container)).toBeDisabled()
  })

  it('does not pick a preset while disabled', async () => {
    const onChange = vi.fn()
    const { container } = render(ColorPicker, { presets: PRESETS, disabled: true, onChange })
    await fireEvent.click(swatches(container)[0])
    expect(onChange).not.toHaveBeenCalled()
  })

  it('renders the label associated with the hex input', () => {
    const { container, getByText } = render(ColorPicker, { presets: PRESETS, label: 'Team colour' })
    const labelEl = getByText('Team colour')
    expect(labelEl).toHaveAttribute('for', hexInput(container).id)
    expect(hexInput(container).id).toBeTruthy()
  })

  it('writes data-size-variant when an explicit size is given', () => {
    const { container } = render(ColorPicker, { size: 'lg' })
    expect(container.querySelector('.ss-color-picker')).toHaveAttribute('data-size-variant', 'lg')
  })

  it('has no axe violations', async () => {
    const { container } = render(ColorPicker, { presets: PRESETS, label: 'Team colour' })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })

  it('has no axe violations when disabled', async () => {
    const { container } = render(ColorPicker, {
      presets: PRESETS,
      label: 'Team colour',
      disabled: true,
    })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })
})
