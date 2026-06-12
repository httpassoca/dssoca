import { describe, it, expect, vi, afterEach } from 'vitest'
import { render } from '@testing-library/svelte'
import { tick } from 'svelte'
import { axe } from 'vitest-axe'
import Spinner, { SPINNER_VARIANTS, SPINNER_VARIANT_NAMES } from '$lib/components/Spinner.svelte'

const axeOpts = {
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'color-contrast': { enabled: false },
  },
}

/** Swap in a matchMedia stub whose `matches` answers the reduced-motion query. */
function stubReducedMotion(matches: boolean) {
  const original = window.matchMedia
  window.matchMedia = ((query: string) =>
    ({
      matches: query.includes('prefers-reduced-motion') ? matches : false,
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent() {
        return false
      },
    }) as MediaQueryList) as typeof window.matchMedia
  return () => {
    window.matchMedia = original
  }
}

describe('Spinner', () => {
  it('renders a .ss-spinner root with role=status', () => {
    const { container } = render(Spinner, {})
    const root = container.querySelector('.ss-spinner')!
    expect(root).not.toBeNull()
    expect(root).toHaveAttribute('role', 'status')
  })

  it('announces a default "Loading" label, visually hidden', () => {
    const { container } = render(Spinner, {})
    const lbl = container.querySelector('.ss-spinner .lbl')!
    expect(lbl).toHaveTextContent('Loading')
    expect(lbl).toHaveClass('sr-only')
  })

  it('honours a custom label and can show it visibly', () => {
    const { container } = render(Spinner, { label: 'Fetching…', showLabel: true })
    const lbl = container.querySelector('.ss-spinner .lbl')!
    expect(lbl).toHaveTextContent('Fetching…')
    expect(lbl).not.toHaveClass('sr-only')
  })

  it('hides the frame glyph from AT and starts on the first frame', () => {
    const { container } = render(Spinner, {})
    const frame = container.querySelector('.ss-spinner .frame')!
    expect(frame).toHaveAttribute('aria-hidden', 'true')
    expect(frame).toHaveTextContent(SPINNER_VARIANTS.boxBounce2.frames[0]) // default variant
  })

  it.each(SPINNER_VARIANT_NAMES)('renders the first frame of the %s variant', (variant) => {
    const { container } = render(Spinner, { variant })
    expect(container.querySelector('.frame')!.textContent).toBe(SPINNER_VARIANTS[variant].frames[0])
  })

  it('applies the size prop as data-size-variant on the root', () => {
    const { container } = render(Spinner, { size: 'lg' })
    expect(container.querySelector('.ss-spinner')).toHaveAttribute('data-size-variant', 'lg')
  })

  it('inherits the ancestor size when no size prop is given', () => {
    const { container } = render(Spinner, {})
    expect(container.querySelector('.ss-spinner')).not.toHaveAttribute('data-size-variant')
  })

  it('forwards arbitrary attributes onto the root span', () => {
    const { container } = render(Spinner, { 'data-testid': 'busy' })
    expect(container.querySelector('.ss-spinner')).toHaveAttribute('data-testid', 'busy')
  })

  describe('animation (fake timers)', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    it("cycles frames at the variant's cli-spinners interval and wraps", async () => {
      vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
      const { container } = render(Spinner, { variant: 'boxBounce' }) // 120ms, 4 frames
      const frame = container.querySelector('.frame')!
      const frames = SPINNER_VARIANTS.boxBounce.frames
      expect(frame.textContent).toBe(frames[0])

      vi.advanceTimersByTime(120)
      await tick()
      expect(frame.textContent).toBe(frames[1])

      vi.advanceTimersByTime(120 * 3) // …frames[2], frames[3], wrap to frames[0]
      await tick()
      expect(frame.textContent).toBe(frames[0])
    })

    it('does not advance before the interval elapses', async () => {
      vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
      const { container } = render(Spinner, { variant: 'squareCorners' }) // 180ms
      const frame = container.querySelector('.frame')!
      vi.advanceTimersByTime(179)
      await tick()
      expect(frame.textContent).toBe(SPINNER_VARIANTS.squareCorners.frames[0])
    })

    it('honours a speed override instead of the variant interval', async () => {
      vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
      const { container } = render(Spinner, { variant: 'toggle3', speed: 500 })
      const frame = container.querySelector('.frame')!
      const frames = SPINNER_VARIANTS.toggle3.frames

      vi.advanceTimersByTime(120) // the variant's own interval — must NOT tick
      await tick()
      expect(frame.textContent).toBe(frames[0])

      vi.advanceTimersByTime(380) // total 500ms — ticks once
      await tick()
      expect(frame.textContent).toBe(frames[1])
    })

    it('stops the interval on unmount', () => {
      vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
      const { unmount } = render(Spinner, {})
      expect(vi.getTimerCount()).toBe(1)
      unmount()
      expect(vi.getTimerCount()).toBe(0)
    })
  })

  describe('prefers-reduced-motion', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    it('shows a static first frame and never cycles', async () => {
      const restore = stubReducedMotion(true)
      try {
        vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
        const { container } = render(Spinner, { variant: 'pipe' })
        const frame = container.querySelector('.frame')!
        expect(vi.getTimerCount()).toBe(0) // no interval scheduled at all
        vi.advanceTimersByTime(1000)
        await tick()
        expect(frame.textContent).toBe(SPINNER_VARIANTS.pipe.frames[0])
      } finally {
        restore()
      }
    })
  })

  describe('a11y (axe)', () => {
    it('has no violations with the hidden label', async () => {
      const { container } = render(Spinner, {})
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })

    it('has no violations with a visible label', async () => {
      const { container } = render(Spinner, { label: 'Loading services', showLabel: true })
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })
  })
})
