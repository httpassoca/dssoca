import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import { axe } from 'vitest-axe'
import { compileString } from 'sass'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import SelectHarness from '../harness/SelectHarness.svelte'

const axeOpts = {
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'color-contrast': { enabled: false },
  },
}

const flat = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'mx', label: 'Mexico', disabled: true },
]

const grouped = [
  {
    label: 'North America',
    options: [
      { value: 'us', label: 'United States' },
      { value: 'ca', label: 'Canada' },
    ],
  },
  {
    label: 'Europe',
    options: [
      { value: 'de', label: 'Germany' },
      { value: 'fr', label: 'France' },
    ],
  },
]

describe('Select', () => {
  it('always wraps the select in a .ss-select container', () => {
    const { container } = render(SelectHarness, { options: flat })
    const field = container.querySelector('.ss-select')
    expect(field).not.toBeNull()
    expect(field!.querySelector('select.select')).not.toBeNull()
  })

  it('renders a label associated to the select (for === select id)', () => {
    const { container } = render(SelectHarness, { label: 'Country', id: 'country', options: flat })
    const lbl = container.querySelector('label.lbl')!
    const select = container.querySelector('select')!
    expect(lbl).toHaveAttribute('for', 'country')
    expect(lbl).toHaveTextContent('Country')
    expect(select).toHaveAttribute('id', 'country')
    expect(lbl.getAttribute('for')).toBe(select.getAttribute('id'))
  })

  it('renders no label element when no label given', () => {
    const { container } = render(SelectHarness, { options: flat })
    expect(container.querySelector('.ss-select label.lbl')).toBeNull()
  })

  it('renders flat options', () => {
    const { container } = render(SelectHarness, { options: flat })
    const opts = container.querySelectorAll('select > option')
    expect(opts).toHaveLength(3)
    expect(opts[0]).toHaveValue('us')
    expect(opts[0]).toHaveTextContent('United States')
    expect(container.querySelector('optgroup')).toBeNull()
  })

  it('marks a flat option disabled when disabled is set', () => {
    const { container } = render(SelectHarness, { options: flat })
    const opts = container.querySelectorAll('select > option')
    expect(opts[2]).toBeDisabled()
  })

  it('renders grouped options as <optgroup> elements', () => {
    const { container } = render(SelectHarness, { options: grouped })
    const groups = container.querySelectorAll('select > optgroup')
    expect(groups).toHaveLength(2)
    expect(groups[0]).toHaveAttribute('label', 'North America')
    expect(groups[1]).toHaveAttribute('label', 'Europe')
    expect(groups[0].querySelectorAll('option')).toHaveLength(2)
  })

  it('renders a disabled placeholder option, selected while empty', () => {
    const { container } = render(SelectHarness, { options: flat, placeholder: 'Pick one' })
    const first = container.querySelector('select > option')!
    expect(first).toHaveValue('')
    expect(first).toHaveTextContent('Pick one')
    expect(first).toBeDisabled()
    expect(first).toHaveAttribute('hidden')
  })

  it('reflects the initial bound value as the selection', () => {
    const { container } = render(SelectHarness, { options: flat, initial: 'ca' })
    expect(container.querySelector('select')).toHaveValue('ca')
  })

  it('two-way binds: changing the selection updates the parent-bound value', async () => {
    const { container } = render(SelectHarness, { options: flat, initial: 'us' })
    const select = container.querySelector('select')!
    await fireEvent.change(select, { target: { value: 'ca' } })
    expect(screen.getByTestId('bound-value')).toHaveTextContent('ca')
  })

  it('renders error text, marks invalid, and announces via role=alert', () => {
    const { container } = render(SelectHarness, {
      id: 'c',
      options: flat,
      error: 'Required field.',
    })
    const select = container.querySelector('select')!
    const err = container.querySelector('#c-error')!
    expect(err).toHaveTextContent('Required field.')
    expect(err).toHaveAttribute('role', 'alert')
    expect(select).toHaveAttribute('aria-invalid', 'true')
    expect(select.getAttribute('aria-describedby')).toContain('c-error')
  })

  it('links hint text via aria-describedby and orders error, hint, describedby', () => {
    const { container } = render(SelectHarness, {
      id: 'c',
      options: flat,
      error: 'bad',
      hint: 'help',
      describedby: 'extra',
    })
    const select = container.querySelector('select')!
    expect(container.querySelector('#c-hint')).toHaveTextContent('help')
    expect(select.getAttribute('aria-describedby')).toBe('c-error c-hint extra')
  })

  it('does not set aria-invalid when there is no error and invalid is unset', () => {
    const { container } = render(SelectHarness, { id: 'c', options: flat, hint: 'help' })
    expect(container.querySelector('select')).not.toHaveAttribute('aria-invalid')
  })

  it('disables the select when disabled is set', () => {
    const { container } = render(SelectHarness, { options: flat, disabled: true })
    expect(container.querySelector('select')).toBeDisabled()
    expect(container.querySelector('.ss-select.disabled')).not.toBeNull()
  })

  it('shows an aria-hidden required marker when label && required', () => {
    const { container } = render(SelectHarness, { label: 'Country', required: true, options: flat })
    const marker = container.querySelector('label.lbl .req')!
    expect(marker).not.toBeNull()
    expect(marker).toHaveAttribute('aria-hidden', 'true')
  })

  it('has no axe violations (flat)', async () => {
    const { container } = render(SelectHarness, { label: 'Country', options: flat })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })

  it('has no axe violations (grouped, placeholder, error)', async () => {
    const { container } = render(SelectHarness, {
      label: 'Country',
      options: grouped,
      placeholder: 'Pick one',
      error: 'Required field.',
    })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })
})

// DS-0170 — RTL: the required marker and the chevron use logical properties so
// their spacing flips with `dir="rtl"` (jsdom does no layout, so pin the CSS).
describe('Select RTL styles', () => {
  const src = readFileSync(resolve(__dirname, '../../src/lib/components/Select.svelte'), 'utf8')
  const scss = /<style lang="scss">([\s\S]*?)<\/style>/.exec(src)![1]
  const css = compileString(scss, { syntax: 'scss', style: 'expanded' }).css
  const rule = (selector: string) => {
    const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const m = new RegExp(`(?:^|\\n)${esc} \\{([^}]*)\\}`).exec(css)
    expect(m, selector).not.toBeNull()
    return m![1]
  }

  it('uses no physical left/right properties', () => {
    expect(css).not.toMatch(/(margin|padding|border)-(left|right)\s*:/)
    expect(css).not.toMatch(/(^|[\s;{])(left|right)\s*:/)
  })

  it('spaces the required marker from the label text on the inline-start side', () => {
    expect(rule('.ss-select .lbl .req')).toMatch(/margin-inline-start:\s*2px/)
  })

  it('spaces the chevron from the select on the inline-start side', () => {
    const chevron = rule('.ss-select .chevron')
    expect(chevron).toMatch(/margin-inline-start:\s*var\(--ss-gap-sm\)/)
    expect(chevron).toMatch(/border-inline:\s*var\(--ss-select-chevron, 5px\) solid transparent/)
  })
})
