import { describe, it, expect, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, fireEvent } from '@testing-library/svelte'
import { axe } from 'vitest-axe'
import Checkbox from '$lib/components/Checkbox.svelte'

// jsdom does not apply Svelte's scoped <style> cascade, so the focus-ring, hit-area and RTL
// contracts are asserted at the source (same pattern as Switch).
const source = readFileSync(resolve(process.cwd(), 'src/lib/components/Checkbox.svelte'), 'utf8')
const style = source.slice(source.indexOf('<style'))

const axeOpts = {
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'color-contrast': { enabled: false },
  },
}

const box = (c: HTMLElement) => c.querySelector<HTMLInputElement>('.ss-checkbox .input')!

describe('Checkbox', () => {
  it('renders a native checkbox named by its visible label', () => {
    const { container, getByRole } = render(Checkbox, { label: 'Email me' })
    const input = getByRole('checkbox', { name: 'Email me' }) as HTMLInputElement
    expect(input).toBe(box(container))
    expect(input.type).toBe('checkbox')
    expect(input.checked).toBe(false)
    // The label wraps the input: a press on the text is a native press on the control.
    expect(input.closest('label')).toBe(container.querySelector('.ss-checkbox'))
  })

  it('reflects checked, and never writes aria-checked on the native input', () => {
    const { container } = render(Checkbox, { label: 'Email me', checked: true })
    expect(box(container).checked).toBe(true)
    expect(box(container)).not.toHaveAttribute('aria-checked')
    expect(box(container)).not.toHaveAttribute('role')
  })

  it('toggles on a press and calls onchange with the new value only (no reason)', async () => {
    const onchange = vi.fn()
    const { container } = render(Checkbox, { label: 'Email me', onchange })
    await fireEvent.click(box(container))
    expect(box(container).checked).toBe(true)
    expect(onchange).toHaveBeenLastCalledWith(true)
    expect(onchange.mock.calls[0]).toHaveLength(1)
    await fireEvent.click(box(container))
    expect(box(container).checked).toBe(false)
    expect(onchange).toHaveBeenLastCalledWith(false)
  })

  it('toggles when the label text is pressed', async () => {
    const onchange = vi.fn()
    const { container, getByText } = render(Checkbox, { label: 'Email me', onchange })
    await fireEvent.click(getByText('Email me'))
    expect(box(container).checked).toBe(true)
    expect(onchange).toHaveBeenCalledWith(true)
  })

  it('sets indeterminate as the DOM property and mirrors it as data-indeterminate', () => {
    const { container } = render(Checkbox, { label: 'All', indeterminate: true })
    expect(box(container).indeterminate).toBe(true)
    expect(box(container)).toHaveAttribute('data-indeterminate', 'true')
    expect(box(container)).not.toHaveAttribute('aria-checked')
  })

  it.each([false, true])(
    'a press on an indeterminate checkbox lands on checked (checked=%s underneath)',
    async (checked) => {
      const onchange = vi.fn()
      const { container } = render(Checkbox, {
        label: 'All',
        checked,
        indeterminate: true,
        onchange,
      })
      await fireEvent.click(box(container))
      expect(box(container).checked).toBe(true)
      expect(box(container).indeterminate).toBe(false)
      expect(box(container)).not.toHaveAttribute('data-indeterminate')
      expect(onchange).toHaveBeenCalledWith(true)
    },
  )

  it('does not toggle when disabled', async () => {
    const onchange = vi.fn()
    const { container } = render(Checkbox, { label: 'Email me', disabled: true, onchange })
    expect(box(container)).toBeDisabled()
    await fireEvent.click(box(container))
    expect(box(container).checked).toBe(false)
    expect(onchange).not.toHaveBeenCalled()
  })

  it('submits name/value with its form when checked', () => {
    const { container } = render(Checkbox, {
      label: 'Terms',
      name: 'terms',
      value: 'accepted',
      checked: true,
    })
    const form = document.createElement('form')
    form.append(container.querySelector('.ss-checkbox')!)
    expect(new FormData(form).get('terms')).toBe('accepted')
  })

  it('wires id and describedby onto the input (the element that takes focus)', () => {
    const { container } = render(Checkbox, { label: 'Terms', id: 'terms', describedby: 'hint' })
    expect(box(container).id).toBe('terms')
    expect(box(container)).toHaveAttribute('aria-describedby', 'hint')
  })

  it('labelHidden visually hides the label but keeps it as the accessible name', async () => {
    const { container, getByRole } = render(Checkbox, { label: 'Select row 3', labelHidden: true })
    expect(container.querySelector('.ss-checkbox .label')).toHaveClass('sr-only')
    expect(getByRole('checkbox', { name: 'Select row 3' })).toBeTruthy()
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })

  it('hides the decorative marks from assistive tech', () => {
    const { container } = render(Checkbox, { label: 'Email me', checked: true })
    expect(container.querySelector('.glyph')).toHaveAttribute('aria-hidden', 'true')
  })

  it('writes data-size-variant when an explicit size is given', () => {
    const { container } = render(Checkbox, { label: 'X', size: 'lg' })
    expect(container.querySelector('.ss-checkbox')).toHaveAttribute('data-size-variant', 'lg')
  })

  it.each([
    ['unchecked', {}],
    ['checked', { checked: true }],
    ['indeterminate', { indeterminate: true }],
    ['disabled', { disabled: true }],
  ])('has no axe violations when %s', async (_n, props) => {
    const { container } = render(Checkbox, { label: 'Email me', ...props })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })

  describe('CSS contracts', () => {
    it('keeps the base focus ring: the input is the box and nothing overrides its outline', () => {
      expect(style).toMatch(/\.input\s*\{[^}]*appearance:\s*none/)
      expect(style).not.toContain('--ss-primary-soft')
      expect(style).not.toMatch(/outline\s*:/)
      // The input must stay painted for the ring to show: never hidden or transparent.
      expect(style).not.toMatch(/\.input\s*\{[^}]*(opacity:\s*0|visibility:\s*hidden)/)
    })

    it('is a square box (zero radius) with a ≥24×24 pointer target', () => {
      expect(style).toMatch(/border-radius:\s*0;/)
      expect(style).toMatch(/min-inline-size:\s*var\(--ss-s-6\)/)
      expect(style).toMatch(/min-block-size:\s*var\(--ss-s-6\)/)
    })

    it('marks state with a glyph, not colour alone, and uses no physical properties', () => {
      expect(style).toContain('.input:checked:not(:indeterminate) + .glyph .check')
      expect(style).toContain('.input:indeterminate + .glyph .dash')
      expect(style).not.toMatch(/(^|[\s;{])(left|right|margin-left|margin-right):/m)
    })
  })

  it('holds no key handling of its own', () => {
    expect(source).not.toMatch(/onkey(down|up|press)/)
  })
})
