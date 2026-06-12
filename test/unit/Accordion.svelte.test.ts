import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { axe } from 'vitest-axe'
import { type AccordionItem } from '$lib/components/Accordion.svelte'
import AccordionHarness from '../harness/AccordionHarness.svelte'

const ITEMS: AccordionItem[] = [
  { id: 'one', label: 'Section one' },
  { id: 'two', label: 'Section two', hint: 'optional' },
  { id: 'three', label: 'Section three', disabled: true },
]

// Render the real component with an inline panel snippet via the harness.
function setup(props: Record<string, unknown> = {}) {
  return render(AccordionHarness, { items: ITEMS, ...props })
}

const heads = (c: HTMLElement) => Array.from(c.querySelectorAll<HTMLButtonElement>('.head'))
const panels = (c: HTMLElement) => Array.from(c.querySelectorAll<HTMLElement>('.panel'))

describe('Accordion', () => {
  it('renders one header button per item', () => {
    const { container } = setup()
    expect(heads(container)).toHaveLength(3)
    expect(heads(container)[0]).toHaveTextContent('Section one')
  })

  it('renders the optional hint', () => {
    const { container } = setup()
    expect(container.querySelector('.hint')).toHaveTextContent('optional')
  })

  // --- ARIA wiring ----------------------------------------------------

  it('wires each header to its panel via aria-controls / aria-labelledby', () => {
    const { container } = setup()
    const h = heads(container)[0]
    const id = h.getAttribute('aria-controls')!
    const panel = container.querySelector(`#${id}`)!
    expect(panel).toHaveAttribute('role', 'region')
    expect(panel).toHaveAttribute('aria-labelledby', h.id)
  })

  it('wraps each header in a heading of the given level', () => {
    const { container } = setup({ headingLevel: 2 })
    const heading = container.querySelector('.heading')
    expect(heading).toHaveAttribute('role', 'heading')
    expect(heading).toHaveAttribute('aria-level', '2')
  })

  it('starts collapsed: aria-expanded=false and panels hidden', () => {
    const { container } = setup()
    expect(heads(container)[0]).toHaveAttribute('aria-expanded', 'false')
    expect(panels(container)[0]).toHaveAttribute('hidden')
  })

  // --- toggle behaviour -----------------------------------------------

  it('opens a section on click (aria-expanded=true, panel shown)', async () => {
    const { container } = setup()
    await fireEvent.click(heads(container)[0])
    expect(heads(container)[0]).toHaveAttribute('aria-expanded', 'true')
    expect(panels(container)[0]).not.toHaveAttribute('hidden')
  })

  it('closes an open section on a second click', async () => {
    const { container } = setup()
    await fireEvent.click(heads(container)[0])
    await fireEvent.click(heads(container)[0])
    expect(heads(container)[0]).toHaveAttribute('aria-expanded', 'false')
  })

  it('single-open by default: opening one closes the previously open one', async () => {
    const { container } = setup()
    await fireEvent.click(heads(container)[0])
    await fireEvent.click(heads(container)[1])
    expect(heads(container)[0]).toHaveAttribute('aria-expanded', 'false')
    expect(heads(container)[1]).toHaveAttribute('aria-expanded', 'true')
  })

  it('multiple: keeps several sections open at once', async () => {
    const { container } = setup({ multiple: true })
    await fireEvent.click(heads(container)[0])
    await fireEvent.click(heads(container)[1])
    expect(heads(container)[0]).toHaveAttribute('aria-expanded', 'true')
    expect(heads(container)[1]).toHaveAttribute('aria-expanded', 'true')
  })

  // --- defaultValue (uncontrolled seed) -------------------------------

  it('honours defaultValue (single)', () => {
    const { container } = setup({ defaultValue: 'two' })
    expect(heads(container)[1]).toHaveAttribute('aria-expanded', 'true')
  })

  it('honours defaultValue (multiple, array)', () => {
    const { container } = setup({ multiple: true, defaultValue: ['one', 'two'] })
    expect(heads(container)[0]).toHaveAttribute('aria-expanded', 'true')
    expect(heads(container)[1]).toHaveAttribute('aria-expanded', 'true')
  })

  // --- controlled value -----------------------------------------------

  it('respects a controlled single value', () => {
    const { container } = setup({ value: 'two' })
    expect(heads(container)[1]).toHaveAttribute('aria-expanded', 'true')
    expect(heads(container)[0]).toHaveAttribute('aria-expanded', 'false')
  })

  it('respects a controlled multiple value (array)', () => {
    const { container } = setup({ multiple: true, value: ['one', 'three'] })
    expect(heads(container)[0]).toHaveAttribute('aria-expanded', 'true')
    expect(heads(container)[2]).toHaveAttribute('aria-expanded', 'true')
  })

  // --- onChange callback ----------------------------------------------

  it('fires onChange with the opened id (single)', async () => {
    const onChange = vi.fn()
    const { container } = setup({ onChange })
    await fireEvent.click(heads(container)[0])
    expect(onChange).toHaveBeenCalledWith('one')
  })

  it('fires onChange with undefined when the last open section closes (single)', async () => {
    const onChange = vi.fn()
    const { container } = setup({ onChange })
    await fireEvent.click(heads(container)[0])
    await fireEvent.click(heads(container)[0])
    expect(onChange).toHaveBeenLastCalledWith(undefined)
  })

  it('fires onChange with the id array (multiple)', async () => {
    const onChange = vi.fn()
    const { container } = setup({ multiple: true, onChange })
    await fireEvent.click(heads(container)[0])
    await fireEvent.click(heads(container)[1])
    expect(onChange).toHaveBeenLastCalledWith(['one', 'two'])
  })

  // --- disabled --------------------------------------------------------

  it('does not toggle a disabled section', async () => {
    const onChange = vi.fn()
    const { container } = setup({ onChange })
    const disabled = heads(container)[2]
    expect(disabled).toHaveAttribute('aria-disabled', 'true')
    await fireEvent.click(disabled)
    expect(disabled).toHaveAttribute('aria-expanded', 'false')
    expect(onChange).not.toHaveBeenCalled()
  })

  // --- keyboard nav (roving) ------------------------------------------

  it('ArrowDown moves focus to the next header', async () => {
    const { container } = setup()
    const [h0, h1] = heads(container)
    h0.focus()
    await fireEvent.keyDown(h0, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(h1)
  })

  it('ArrowUp from the first header wraps to the last', async () => {
    const { container } = setup()
    const hs = heads(container)
    hs[0].focus()
    await fireEvent.keyDown(hs[0], { key: 'ArrowUp' })
    expect(document.activeElement).toBe(hs[2])
  })

  it('Home / End jump to the first / last header', async () => {
    const { container } = setup()
    const hs = heads(container)
    hs[1].focus()
    await fireEvent.keyDown(hs[1], { key: 'End' })
    expect(document.activeElement).toBe(hs[2])
    await fireEvent.keyDown(hs[2], { key: 'Home' })
    expect(document.activeElement).toBe(hs[0])
  })

  // --- stable ids (DS-0067, SSR safety) ---------------------------------

  it('derives the default idBase from $props.id(), not Math.random()', () => {
    const spy = vi.spyOn(Math, 'random')
    const { container } = setup()
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
    // the derived ids still namespace header/panel pairs
    const h = heads(container)[0]
    expect(h.id).toMatch(/^ss-acc-.+-h-one$/)
    expect(h.getAttribute('aria-controls')).toMatch(/^ss-acc-.+-p-one$/)
  })

  it('keeps default idBases unique across instances', () => {
    const a = setup()
    const b = setup()
    expect(heads(a.container)[0].id).not.toBe(heads(b.container)[0].id)
  })

  it('honours an explicit idBase', () => {
    const { container } = setup({ idBase: 'faq' })
    expect(heads(container)[0].id).toBe('faq-h-one')
    expect(panels(container)[0].id).toBe('faq-p-one')
  })

  // --- size ------------------------------------------------------------

  it('applies the size as data-size-variant on the root', () => {
    const { container } = setup({ size: 'lg' })
    expect(container.querySelector('.ss-accordion')).toHaveAttribute('data-size-variant', 'lg')
  })

  it('omits data-size-variant when no size is given (inherits the cascade)', () => {
    const { container } = setup()
    expect(container.querySelector('.ss-accordion')).not.toHaveAttribute('data-size-variant')
  })

  // --- a11y ------------------------------------------------------------

  it('has no axe violations (collapsed + an open section)', async () => {
    const { container } = setup({ defaultValue: 'one' })
    expect(
      await axe(container, {
        rules: {
          region: { enabled: false },
          'landmark-one-main': { enabled: false },
          'page-has-heading-one': { enabled: false },
          'color-contrast': { enabled: false },
        },
      }),
    ).toHaveNoViolations()
  })
})
