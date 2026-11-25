import { describe, it, expect, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, fireEvent } from '@testing-library/svelte'
import { axe } from 'vitest-axe'
import RadioGroup from '$lib/components/RadioGroup.svelte'

// jsdom does not apply Svelte's scoped <style> cascade, so the focus-ring, hit-area and RTL
// contracts are asserted at the source (same pattern as Switch).
const source = readFileSync(resolve(process.cwd(), 'src/lib/components/RadioGroup.svelte'), 'utf8')
const style = source.slice(source.indexOf('<style'))

const axeOpts = {
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'color-contrast': { enabled: false },
  },
}

const OPTIONS = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro', disabled: true },
  { value: 'team', label: 'Team' },
]

const radios = (c: HTMLElement) =>
  Array.from(c.querySelectorAll<HTMLInputElement>('.ss-radio-group .input'))
const tabindexes = (c: HTMLElement) => radios(c).map((r) => r.getAttribute('tabindex'))

describe('RadioGroup', () => {
  it('renders a radiogroup named by its visible label', () => {
    const { container, getByRole, getByText } = render(RadioGroup, {
      options: OPTIONS,
      label: 'Plan',
    })
    const group = getByRole('radiogroup', { name: 'Plan' })
    expect(group).toBe(container.querySelector('.ss-radio-group'))
    expect(group).toHaveAttribute('aria-labelledby', getByText('Plan').id)
    expect(group).not.toHaveAttribute('aria-label')
  })

  it('renders native radios sharing one name, each named by its label', () => {
    const { container, getByRole } = render(RadioGroup, {
      options: OPTIONS,
      label: 'Plan',
      name: 'plan',
    })
    const list = radios(container)
    expect(list.map((r) => r.type)).toEqual(['radio', 'radio', 'radio'])
    expect(list.map((r) => r.name)).toEqual(['plan', 'plan', 'plan'])
    expect(list.map((r) => r.value)).toEqual(['free', 'pro', 'team'])
    expect(getByRole('radio', { name: 'Team' })).toBe(list[2])
    // Native semantics only: no ARIA role/state layered on the inputs.
    for (const r of list) {
      expect(r).not.toHaveAttribute('role')
      expect(r).not.toHaveAttribute('aria-checked')
    }
  })

  it('falls back to a generated shared name so the radios still form one group', () => {
    const a = render(RadioGroup, { options: OPTIONS, label: 'Plan' })
    const b = render(RadioGroup, { options: OPTIONS, label: 'Other plan' })
    const namesA = new Set(radios(a.container).map((r) => r.name))
    const namesB = new Set(radios(b.container).map((r) => r.name))
    expect(namesA.size).toBe(1)
    expect([...namesA][0]).toBeTruthy()
    expect([...namesA][0]).not.toBe([...namesB][0])
  })

  it('checks the option matching value', () => {
    const { container } = render(RadioGroup, { options: OPTIONS, label: 'Plan', value: 'team' })
    expect(radios(container).map((r) => r.checked)).toEqual([false, false, true])
  })

  it('a press selects, and calls onChange with the new value only (no reason)', async () => {
    const onChange = vi.fn()
    const { container } = render(RadioGroup, {
      options: OPTIONS,
      label: 'Plan',
      value: 'free',
      onChange,
    })
    await fireEvent.click(radios(container)[2])
    expect(radios(container).map((r) => r.checked)).toEqual([false, false, true])
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('team')
    expect(onChange.mock.calls[0]).toHaveLength(1)
  })

  it('a press on the label text selects its radio', async () => {
    const onChange = vi.fn()
    const { container, getByText } = render(RadioGroup, {
      options: OPTIONS,
      label: 'Plan',
      onChange,
    })
    await fireEvent.click(getByText('Team'))
    expect(radios(container)[2].checked).toBe(true)
    expect(onChange).toHaveBeenCalledWith('team')
  })

  it('pressing the selected radio again fires nothing', async () => {
    const onChange = vi.fn()
    const { container } = render(RadioGroup, {
      options: OPTIONS,
      label: 'Plan',
      value: 'free',
      onChange,
    })
    await fireEvent.click(radios(container)[0])
    expect(onChange).not.toHaveBeenCalled()
  })

  it('a disabled option cannot be selected', async () => {
    const onChange = vi.fn()
    const { container } = render(RadioGroup, {
      options: OPTIONS,
      label: 'Plan',
      value: 'free',
      onChange,
    })
    expect(radios(container)[1]).toBeDisabled()
    await fireEvent.click(radios(container)[1])
    expect(radios(container).map((r) => r.checked)).toEqual([true, false, false])
    expect(onChange).not.toHaveBeenCalled()
  })

  it('disabled disables every radio and marks the group aria-disabled', () => {
    const { container } = render(RadioGroup, { options: OPTIONS, label: 'Plan', disabled: true })
    expect(container.querySelector('.ss-radio-group')).toHaveAttribute('aria-disabled', 'true')
    for (const r of radios(container)) expect(r).toBeDisabled()
    expect(tabindexes(container)).toEqual(['-1', '-1', '-1'])
  })

  describe('tab stop (one per group)', () => {
    it('is the selected radio', () => {
      const { container } = render(RadioGroup, { options: OPTIONS, label: 'Plan', value: 'team' })
      expect(tabindexes(container)).toEqual(['-1', '-1', '0'])
    })

    it('is the first enabled radio when nothing is selected', () => {
      const { container } = render(RadioGroup, {
        options: [{ value: 'a', label: 'A', disabled: true }, ...OPTIONS],
        label: 'Plan',
      })
      expect(tabindexes(container)).toEqual(['-1', '0', '-1', '-1'])
    })

    it('is the first enabled radio when the selection is disabled or unknown', () => {
      const a = render(RadioGroup, { options: OPTIONS, label: 'Plan', value: 'pro' })
      expect(tabindexes(a.container)).toEqual(['0', '-1', '-1'])
      const b = render(RadioGroup, { options: OPTIONS, label: 'Plan', value: 'nope' })
      expect(tabindexes(b.container)).toEqual(['0', '-1', '-1'])
    })

    it('follows the selection', async () => {
      const { container } = render(RadioGroup, { options: OPTIONS, label: 'Plan', value: 'free' })
      await fireEvent.click(radios(container)[2])
      expect(tabindexes(container)).toEqual(['-1', '-1', '0'])
    })
  })

  it('submits the selected value with its form', () => {
    const { container } = render(RadioGroup, {
      options: OPTIONS,
      label: 'Plan',
      name: 'plan',
      value: 'team',
    })
    const form = document.createElement('form')
    form.append(container.querySelector('.ss-radio-group')!)
    expect(new FormData(form).get('plan')).toBe('team')
  })

  it('stamps orientation and an explicit size on the root', () => {
    const v = render(RadioGroup, { options: OPTIONS, label: 'Plan' })
    expect(v.container.querySelector('.ss-radio-group')).toHaveAttribute(
      'data-orientation',
      'vertical',
    )
    const h = render(RadioGroup, {
      options: OPTIONS,
      label: 'Plan',
      orientation: 'horizontal',
      size: 'sm',
    })
    const root = h.container.querySelector('.ss-radio-group')!
    expect(root).toHaveAttribute('data-orientation', 'horizontal')
    expect(root).toHaveAttribute('data-size-variant', 'sm')
  })

  it('hides the decorative selection mark from assistive tech', () => {
    const { container } = render(RadioGroup, { options: OPTIONS, label: 'Plan', value: 'free' })
    for (const dot of container.querySelectorAll('.dot')) {
      expect(dot).toHaveAttribute('aria-hidden', 'true')
    }
  })

  it.each([
    ['nothing selected', {}],
    ['a selection', { value: 'team' }],
    ['horizontal', { value: 'free', orientation: 'horizontal' as const }],
    ['disabled', { value: 'free', disabled: true }],
  ])('has no axe violations with %s', async (_n, props) => {
    const { container } = render(RadioGroup, { options: OPTIONS, label: 'Plan', ...props })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })

  describe('CSS contracts', () => {
    it('keeps the base focus ring: the input is the box and nothing overrides its outline', () => {
      expect(style).toMatch(/\.input\s*\{[^}]*appearance:\s*none/)
      expect(style).not.toContain('--ss-primary-soft')
      expect(style).not.toMatch(/outline\s*:/)
      expect(style).not.toMatch(/\.input\s*\{[^}]*(opacity:\s*0|visibility:\s*hidden)/)
    })

    it('is a square radio (zero radius) with a ≥24×24 pointer target', () => {
      expect(style).toMatch(/border-radius:\s*0;/)
      expect(style).not.toMatch(/border-radius:\s*[^0\s]/)
      expect(style).toMatch(/min-inline-size:\s*var\(--ss-s-6\)/)
      expect(style).toMatch(/min-block-size:\s*var\(--ss-s-6\)/)
    })

    it('marks the selection with a shape, not colour alone, and uses no physical properties', () => {
      expect(style).toMatch(/\.dot\s*\{[^}]*display:\s*none/)
      expect(style).toContain('.input:checked + .dot')
      expect(style).not.toMatch(/(^|[\s;{])(left|right|margin-left|margin-right):/m)
    })
  })

  it('leaves every key to the native radios (no key handling at all)', () => {
    expect(source).not.toMatch(/onkey(down|up|press)/)
    expect(source).not.toMatch(/\.key\b/)
  })
})
