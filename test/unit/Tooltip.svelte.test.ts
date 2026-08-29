import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { axe } from 'vitest-axe'
import TooltipHarness from '../harness/TooltipHarness.svelte'
import { tick } from 'svelte'

const axeOpts = {
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'color-contrast': { enabled: false },
  },
}

const root = (c: HTMLElement) => c.querySelector('.ss-tooltip') as HTMLElement
const trigger = (c: HTMLElement) => c.querySelector('.trigger button') as HTMLButtonElement
const tip = (c: HTMLElement) => c.querySelector('.tip') as HTMLElement

describe('Tooltip', () => {
  it('renders the trigger content inside .ss-tooltip', () => {
    const { container } = render(TooltipHarness, { trigger: 'Help' })
    expect(root(container)).not.toBeNull()
    expect(trigger(container)).toHaveTextContent('Help')
  })

  it('keeps the tooltip element in the DOM with role="tooltip"', () => {
    const { container } = render(TooltipHarness, { text: 'More info' })
    const t = tip(container)
    expect(t).not.toBeNull()
    expect(t).toHaveAttribute('role', 'tooltip')
    expect(t).toHaveTextContent('More info')
  })

  it('is closed by default: tooltip hidden, no aria-describedby', () => {
    const { container } = render(TooltipHarness)
    expect(tip(container)).toHaveAttribute('hidden')
    expect(tip(container)).not.toHaveClass('open')
    expect(root(container)).not.toHaveAttribute('aria-describedby')
  })

  it('shows on focusin: sets aria-describedby to the tooltip id and reveals it', async () => {
    const { container } = render(TooltipHarness, { text: 'More info' })
    await fireEvent.focusIn(root(container))
    const t = tip(container)
    expect(t).toHaveClass('open')
    expect(t).not.toHaveAttribute('hidden')
    expect(root(container)).toHaveAttribute('aria-describedby', t.id)
    expect(t).toHaveTextContent('More info')
  })

  it('hides on focusout', async () => {
    const { container } = render(TooltipHarness)
    await fireEvent.focusIn(root(container))
    expect(tip(container)).toHaveClass('open')
    await fireEvent.focusOut(root(container))
    expect(tip(container)).not.toHaveClass('open')
    expect(root(container)).not.toHaveAttribute('aria-describedby')
  })

  it('shows on mouseenter and hides on mouseleave', async () => {
    const { container } = render(TooltipHarness)
    await fireEvent.mouseEnter(root(container))
    expect(tip(container)).toHaveClass('open')
    await fireEvent.mouseLeave(root(container))
    expect(tip(container)).not.toHaveClass('open')
  })

  it('hides on Escape keydown', async () => {
    const { container } = render(TooltipHarness)
    await fireEvent.focusIn(root(container))
    expect(tip(container)).toHaveClass('open')
    await fireEvent.keyDown(root(container), { key: 'Escape' })
    expect(tip(container)).not.toHaveClass('open')
    expect(root(container)).not.toHaveAttribute('aria-describedby')
  })

  // DS-0144: `text` accepts a snippet for small rendered templates.
  describe('snippet content', () => {
    it('renders the snippet markup inside the tip', () => {
      const { container } = render(TooltipHarness, { rich: true })
      const t = tip(container)
      expect(t.querySelector('strong')).toHaveTextContent('Copy path')
      expect(t.querySelector('code')).toHaveTextContent('/srv/app')
    })

    it('is hidden (and unannounced) while closed, like the string form', () => {
      const { container } = render(TooltipHarness, { rich: true })
      expect(tip(container)).toHaveAttribute('hidden')
      expect(root(container)).not.toHaveAttribute('aria-describedby')
    })

    it('becomes the accessible description while open', async () => {
      const { container } = render(TooltipHarness, { rich: true })
      await fireEvent.focusIn(root(container))
      const t = tip(container)
      expect(root(container)).toHaveAttribute('aria-describedby', t.id)
      expect(t).not.toHaveAttribute('hidden')
      expect(t.textContent?.trim()).toContain('Copy path')
      expect(t.textContent?.trim()).toContain('/srv/app')
    })

    it('still dismisses on Escape', async () => {
      const { container } = render(TooltipHarness, { rich: true })
      await fireEvent.focusIn(root(container))
      expect(tip(container)).toHaveClass('open')
      await fireEvent.keyDown(root(container), { key: 'Escape' })
      expect(tip(container)).not.toHaveClass('open')
    })

    it('has no axe violations while open', async () => {
      const { container } = render(TooltipHarness, { rich: true })
      await fireEvent.focusIn(root(container))
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })
  })

  describe('placement', () => {
    it('defaults to top', () => {
      const { container } = render(TooltipHarness)
      expect(root(container)).toHaveAttribute('data-placement', 'top')
    })

    it('reflects the placement prop via data-placement', () => {
      const { container } = render(TooltipHarness, { placement: 'right' })
      expect(root(container)).toHaveAttribute('data-placement', 'right')
    })
  })

  // DS-0146: collision avoidance — jsdom has no layout, so stub the trigger rect,
  // the tip's box and the viewport, then open and read the resolved placement.
  describe('collision avoidance', () => {
    const VIEW = { w: 800, h: 600 }
    const TIP = { w: 100, h: 30 }

    afterEach(() => {
      vi.restoreAllMocks()
    })

    type Layout = { x: number; y: number; w?: number; h?: number; tipW?: number; tipH?: number }

    /** Place a 40×20 trigger at (x, y) in an 800×600 viewport with a 100×30 tip. */
    function layout(container: HTMLElement, l: Layout) {
      vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(VIEW.w)
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(VIEW.h)
      const w = l.w ?? 40
      const h = l.h ?? 20
      const trig = container.querySelector('.trigger') as HTMLElement
      trig.getBoundingClientRect = () =>
        ({
          x: l.x,
          y: l.y,
          left: l.x,
          top: l.y,
          width: w,
          height: h,
          right: l.x + w,
          bottom: l.y + h,
          toJSON() {},
        }) as DOMRect
      const t = tip(container)
      Object.defineProperty(t, 'offsetWidth', { configurable: true, value: l.tipW ?? TIP.w })
      Object.defineProperty(t, 'offsetHeight', { configurable: true, value: l.tipH ?? TIP.h })
    }

    async function open(container: HTMLElement) {
      await fireEvent.focusIn(root(container))
      await tick()
    }

    const shiftOf = (c: HTMLElement) => tip(c).style.getPropertyValue('--shift')

    it.each(['top', 'bottom', 'left', 'right'] as const)(
      'keeps the preferred side (%s) when there is room',
      async (placement) => {
        const { container } = render(TooltipHarness, { placement })
        layout(container, { x: 380, y: 290 })
        await open(container)
        expect(root(container)).toHaveAttribute('data-placement', placement)
        expect(shiftOf(container)).toBe('0px')
      },
    )

    it('flips top → bottom when the trigger is at the top edge', async () => {
      const { container } = render(TooltipHarness, { placement: 'top' })
      layout(container, { x: 380, y: 4 })
      await open(container)
      expect(root(container)).toHaveAttribute('data-placement', 'bottom')
    })

    it('flips bottom → top at the bottom edge', async () => {
      const { container } = render(TooltipHarness, { placement: 'bottom' })
      layout(container, { x: 380, y: 590 })
      await open(container)
      expect(root(container)).toHaveAttribute('data-placement', 'top')
    })

    it('flips left → right at the left edge', async () => {
      const { container } = render(TooltipHarness, { placement: 'left' })
      layout(container, { x: 0, y: 290 })
      await open(container)
      expect(root(container)).toHaveAttribute('data-placement', 'right')
    })

    it('falls back to the roomier perpendicular side when neither top nor bottom fits', async () => {
      const { container } = render(TooltipHarness, { placement: 'top' })
      // Viewport too short for the tip above or below; more room to the right.
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(60)
      layout(container, { x: 100, y: 20 })
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(60)
      await open(container)
      expect(root(container)).toHaveAttribute('data-placement', 'right')
    })

    it('picks the side with the most room when nothing fits', async () => {
      const { container } = render(TooltipHarness, { placement: 'top' })
      layout(container, { x: 30, y: 20, tipW: 2000, tipH: 2000 })
      await open(container)
      // top: 20, bottom: 560, left: 30, right: 730 → right wins.
      expect(root(container)).toHaveAttribute('data-placement', 'right')
    })

    it('shifts right (positive) when a top tip would overhang the left edge', async () => {
      const { container } = render(TooltipHarness, { placement: 'top' })
      layout(container, { x: 0, y: 200 })
      await open(container)
      expect(root(container)).toHaveAttribute('data-placement', 'top')
      // Tip centred on x=20, half-width 50 → left edge -30; clamp to gap (6) → +36.
      expect(shiftOf(container)).toBe('36px')
    })

    it('shifts left (negative) when a top tip would overhang the right edge', async () => {
      const { container } = render(TooltipHarness, { placement: 'top' })
      layout(container, { x: 760, y: 200 })
      await open(container)
      // Centre 780, right edge 830 vs max 794 → -36.
      expect(shiftOf(container)).toBe('-36px')
    })

    it('shifts a side tip vertically', async () => {
      const { container } = render(TooltipHarness, { placement: 'right' })
      layout(container, { x: 100, y: 0 })
      await open(container)
      expect(root(container)).toHaveAttribute('data-placement', 'right')
      // Centre y=10, half-height 15 → top -5; clamp to 6 → +11.
      expect(shiftOf(container)).toBe('11px')
    })

    it('respects an overflow-clipping ancestor as the boundary', async () => {
      const { container } = render(TooltipHarness, { placement: 'top' })
      const box = document.createElement('div')
      // jsdom does not expand the shorthand into the longhands the component reads.
      box.style.overflowX = 'auto'
      box.style.overflowY = 'auto'
      box.getBoundingClientRect = () =>
        ({
          x: 0,
          y: 190,
          left: 0,
          top: 190,
          width: 800,
          height: 200,
          right: 800,
          bottom: 390,
          toJSON() {},
        }) as DOMRect
      const r = root(container)
      r.parentElement!.insertBefore(box, r)
      box.appendChild(r)
      // Plenty of viewport above, but only 10px inside the scroll box.
      layout(container, { x: 380, y: 200 })
      await open(container)
      expect(r).toHaveAttribute('data-placement', 'bottom')
    })

    it('avoidCollisions={false} pins the preferred side and never shifts', async () => {
      const { container } = render(TooltipHarness, { placement: 'top', avoidCollisions: false })
      layout(container, { x: 0, y: 0 })
      await open(container)
      expect(root(container)).toHaveAttribute('data-placement', 'top')
      expect(shiftOf(container)).toBe('0px')
    })

    it('resets to the preferred side on close', async () => {
      const { container } = render(TooltipHarness, { placement: 'top' })
      layout(container, { x: 380, y: 4 })
      await open(container)
      expect(root(container)).toHaveAttribute('data-placement', 'bottom')
      await fireEvent.focusOut(root(container))
      await tick()
      expect(root(container)).toHaveAttribute('data-placement', 'top')
    })

    it('re-measures live when the placement prop changes while open', async () => {
      const { container, rerender } = render(TooltipHarness, { placement: 'top' })
      layout(container, { x: 380, y: 290 })
      await open(container)
      expect(root(container)).toHaveAttribute('data-placement', 'top')
      await rerender({ placement: 'left' })
      await tick()
      expect(root(container)).toHaveAttribute('data-placement', 'left')
    })

    it('re-measures on window resize while open', async () => {
      const { container } = render(TooltipHarness, { placement: 'top' })
      layout(container, { x: 380, y: 290 })
      await open(container)
      expect(root(container)).toHaveAttribute('data-placement', 'top')
      layout(container, { x: 380, y: 4 })
      await fireEvent(window, new Event('resize'))
      await tick()
      expect(root(container)).toHaveAttribute('data-placement', 'bottom')
    })

    it('has no axe violations on a flipped tip', async () => {
      const { container } = render(TooltipHarness, { placement: 'top' })
      layout(container, { x: 380, y: 4 })
      await open(container)
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })
  })

  it('applies the explicit size as data-size-variant on the root', () => {
    const { container } = render(TooltipHarness, { size: 'lg' })
    expect(root(container)).toHaveAttribute('data-size-variant', 'lg')
  })

  describe('a11y (axe)', () => {
    it('has no violations while closed', async () => {
      const { container } = render(TooltipHarness, { text: 'More info' })
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })

    it('has no violations while open', async () => {
      const { container } = render(TooltipHarness, { text: 'More info' })
      await fireEvent.focusIn(root(container))
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })
  })
})
