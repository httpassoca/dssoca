import { describe, it, expect, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, fireEvent } from '@testing-library/svelte'
import { axe } from 'vitest-axe'
import { type AccordionItem } from '$lib/components/Accordion.svelte'
import AccordionHarness from '../harness/AccordionHarness.svelte'

// jsdom's getComputedStyle does not apply Svelte's scoped <style> cascade, so
// the truncation / clip / padding CSS contracts can't be read off the rendered
// DOM. They are pure CSS — assert them at the source so a regression that
// removes/breaks the rule fails the suite (same pattern as Button.svelte.test).
const source = readFileSync(resolve(process.cwd(), 'src/lib/components/Accordion.svelte'), 'utf8')

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

  // --- chevron via Icon (DS-0110 / DS-0111) ----------------------------

  it('renders the chevron through the shared Icon component (not a CSS shape)', () => {
    const { container } = setup()
    const chevron = container.querySelector('.head .chevron')!
    const icon = chevron.querySelector('svg.ss-icon')
    expect(icon).not.toBeNull()
    expect(icon).toHaveAttribute('viewBox', '0 0 24 24')
  })

  it('the chevron Icon is decorative (aria-hidden), inside the header button', () => {
    const { container } = setup()
    const head = heads(container)[0]
    const icon = head.querySelector('.chevron svg.ss-icon')!
    expect(icon).toHaveAttribute('aria-hidden', 'true')
    expect(icon).not.toHaveAttribute('role')
  })

  it('passes the resolved size down to the chevron Icon (DS-0111)', () => {
    const { container } = setup({ size: 'sm' })
    const icon = container.querySelector('.chevron svg.ss-icon')!
    // Icon pins its box to the named scale; sm → 16px.
    expect(icon.getAttribute('style')).toContain('width: 16px')
  })

  // DS-0116: the chevron is the Icon `chevron` glyph, decorative, and its
  // open-state rotation is applied via the .item.open modifier (no CSS-border).
  it('the chevron is the Icon `chevron` glyph (no CSS-border caret)', () => {
    const { container } = setup()
    const chevron = container.querySelector('.head .chevron')!
    // The glyph is the shared chevron path, rendered as an Icon <svg>.
    const path = chevron.querySelector('svg.ss-icon path')!
    expect(path).toHaveAttribute('d', 'M8 10l4 4 4-4')
    // No bespoke border-caret span remains.
    expect(chevron.querySelector('span')).toBeNull()
  })

  it('applies the open-state rotation marker to the chevron when expanded', async () => {
    const { container } = setup({ defaultValue: 'one' })
    // The rotation is driven by the `.item.open` class on the open item; the
    // collapsed items carry no `.open` marker.
    const items = Array.from(container.querySelectorAll<HTMLElement>('.item'))
    expect(items[0]).toHaveClass('open')
    expect(items[1]).not.toHaveClass('open')
    // toggling closed removes the rotation marker
    await fireEvent.click(heads(container)[0])
    expect(items[0]).not.toHaveClass('open')
  })

  // --- panel padding from the first reveal frame (DS-0115) --------------

  it('keeps an always-present padded inner wrapper inside the grid clip', () => {
    const { container } = setup()
    // Each panel nests .panel > .panel-clip > .panel-inner; the inner block is
    // present (and carries the padding rule) regardless of open/closed state.
    for (const panel of panels(container)) {
      const clip = panel.querySelector('.panel-clip')!
      expect(clip).not.toBeNull()
      const inner = clip.querySelector('.panel-inner')!
      expect(inner).not.toBeNull()
    }
  })

  it('renders the padded inner wrapper whether the panel is open or closed', async () => {
    const { container } = setup({ defaultValue: 'one' })
    const [openPanel, closedPanel] = panels(container)
    expect(openPanel).not.toHaveAttribute('hidden')
    expect(closedPanel).toHaveAttribute('hidden')
    // Both states keep the inner wrapper mounted (padding is unconditional).
    expect(openPanel.querySelector('.panel-clip > .panel-inner')).not.toBeNull()
    expect(closedPanel.querySelector('.panel-clip > .panel-inner')).not.toBeNull()
    // Opening the closed one keeps the same structure (no padding toggle).
    await fireEvent.click(heads(container)[1])
    expect(closedPanel.querySelector('.panel-clip > .panel-inner')).not.toBeNull()
  })

  it('clips the grid track with overflow:hidden + min-height:0 (CSS contract)', () => {
    // The 0fr→1fr grid-rows reveal only collapses to exactly 0 height if the
    // clip carries these two rules. jsdom can't read scoped CSS, so assert the
    // source: dropping either would silently break the collapse (DS-0115).
    const clip = source.match(/\.panel-clip\s*\{[\s\S]*?\}/)?.[0] ?? ''
    expect(clip).toMatch(/overflow:\s*hidden/)
    expect(clip).toMatch(/min-height:\s*0/)
  })

  it('pads .panel-inner unconditionally, not behind an open-state gate (CSS contract)', () => {
    // DS-0115's fix is that the padding lives on .panel-inner unconditionally,
    // not re-gated behind `.panel:not([hidden])`. Reintroducing that toggle is
    // the exact regression — guard it at the source.
    const inner = source.match(/\.panel-inner\s*\{[\s\S]*?\}/)?.[0] ?? ''
    expect(inner).toMatch(/padding:\s*var\(--ss-acc-body-py\)\s+var\(--ss-acc-body-px\)/)
    // No open-state gate selector pads .panel-inner (the reverted DS-0115 bug):
    // i.e. no `…:not([hidden]) … .panel-inner {` compound selector. Match only
    // within a single selector (no `{`/`}` between the gate and .panel-inner).
    expect(source).not.toMatch(/:not\(\[hidden\]\)[^{}]*\.panel-inner\s*\{/)
  })

  // --- header label overflow (DS-0117) ---------------------------------

  it("defaults overflow to 'wrap' (no truncate marker on the root)", () => {
    const { container } = setup()
    expect(container.querySelector('.ss-accordion')).toHaveAttribute('data-overflow', 'wrap')
  })

  it("overflow='wrap' renders the label and keeps the wrap marker", () => {
    const { container } = setup({ overflow: 'wrap' })
    expect(container.querySelector('.ss-accordion')).toHaveAttribute('data-overflow', 'wrap')
    expect(container.querySelector('.head .title')).toHaveTextContent('Section one')
  })

  it("overflow='truncate' sets the truncate marker on the root", () => {
    const { container } = setup({ overflow: 'truncate' })
    expect(container.querySelector('.ss-accordion')).toHaveAttribute('data-overflow', 'truncate')
    // still renders the label text (single-line ellipsis is CSS-only)
    expect(container.querySelector('.head .title')).toHaveTextContent('Section one')
  })

  it("overflow='truncate' applies the single-line ellipsis trio to .title (CSS contract)", () => {
    // The DOM marker above is necessary but not sufficient: the actual
    // acceptance criterion is the ellipsis rule on .title under the truncate
    // selector. Assert it at the source so dropping/breaking the rule fails.
    const truncate = source.match(/\[data-overflow='truncate'\][\s\S]*?\}/)?.[0] ?? ''
    expect(truncate).toMatch(/\.head\s+\.title/)
    expect(truncate).toMatch(/white-space:\s*nowrap/)
    expect(truncate).toMatch(/overflow:\s*hidden/)
    expect(truncate).toMatch(/text-overflow:\s*ellipsis/)
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
