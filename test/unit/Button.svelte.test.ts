import { describe, it, expect, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createRawSnippet } from 'svelte'
import { render, screen, fireEvent } from '@testing-library/svelte'
import ButtonHarness from '../harness/ButtonHarness.svelte'

describe('Button', () => {
  it('renders a button with its children text', () => {
    render(ButtonHarness, { text: 'Save' })
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('defaults to the secondary variant and type=button', () => {
    const { container } = render(ButtonHarness, { text: 'x' })
    const btn = container.querySelector('button')!
    expect(btn).toHaveClass('ss-btn', 'secondary')
    expect(btn).toHaveAttribute('type', 'button')
  })

  it.each(['primary', 'secondary', 'ghost', 'danger'] as const)(
    'applies the %s variant class',
    (variant) => {
      const { container } = render(ButtonHarness, { variant, text: 'x' })
      expect(container.querySelector('button')).toHaveClass(variant)
    },
  )

  it('honours the type prop', () => {
    const { container } = render(ButtonHarness, { type: 'submit', text: 'go' })
    expect(container.querySelector('button')).toHaveAttribute('type', 'submit')
  })

  it('is disabled when disabled=true', () => {
    const { container } = render(ButtonHarness, { disabled: true, text: 'x' })
    expect(container.querySelector('button')).toBeDisabled()
  })

  it('fires onclick when clicked', async () => {
    const onclick = vi.fn()
    render(ButtonHarness, { onclick, text: 'Tap' })
    await fireEvent.click(screen.getByRole('button', { name: 'Tap' }))
    expect(onclick).toHaveBeenCalledOnce()
  })

  it('renders the disabled attribute so a real browser blocks clicks', () => {
    // A disabled <button> is non-interactive in a real browser: the native
    // click gate (which jsdom's synthetic fireEvent bypasses) is what stops
    // onclick, so assert the actual rendered guarantee — the attribute.
    const onclick = vi.fn()
    const { container } = render(ButtonHarness, { onclick, disabled: true, text: 'Tap' })
    expect(container.querySelector('button')).toBeDisabled()
  })

  describe('disabled — no glow / brighten', () => {
    // jsdom's getComputedStyle does not apply Svelte's scoped <style> cascade,
    // and :hover can't be simulated, so the disabled-glow guard can't be read
    // off the rendered DOM. It is a pure CSS contract — assert it at the source
    // so a regression (re-introducing a bare hover glow) fails the suite.
    const source = readFileSync(resolve(process.cwd(), 'src/lib/components/Button.svelte'), 'utf8')

    it('still renders disabled buttons as natively disabled (inert)', () => {
      const { container } = render(ButtonHarness, {
        variant: 'primary',
        disabled: true,
        text: 'Save',
      })
      expect(container.querySelector('button')).toBeDisabled()
    })

    it('has no un-guarded &:hover rule (every hover affordance excludes :disabled)', () => {
      expect(source).not.toContain('&:hover')
      expect(source).toContain('&:not(:disabled):hover')
    })

    it('gates the primary brand glow behind :not(:disabled):hover', () => {
      expect(source).toMatch(/&:not\(:disabled\):hover\s*\{[^}]*--ss-shadow-glow/)
    })

    it('resets box-shadow to none on :disabled', () => {
      expect(source).toMatch(/&:disabled\s*\{[^}]*box-shadow:\s*none/)
    })

    it('has no ungated :hover anywhere (every :hover is :not(:disabled)-guarded)', () => {
      // Stronger than the bare-&:hover check: also catches a full-selector
      // hover (e.g. `.ss-btn.primary:hover { … }`) that skips the SCSS parent.
      // Strip comments first so prose mentioning ":hover" isn't counted.
      const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
      const hovers = (code.match(/:hover/g) ?? []).length
      const guarded = (code.match(/:not\(:disabled\):hover/g) ?? []).length
      expect(hovers).toBeGreaterThan(0)
      expect(guarded).toBe(hovers)
    })
  })

  describe('loading', () => {
    it('sets aria-busy and a loading class when loading', () => {
      const { container } = render(ButtonHarness, { loading: true, text: 'Save' })
      const btn = container.querySelector('button')!
      expect(btn).toHaveAttribute('aria-busy', 'true')
      expect(btn).toHaveAttribute('aria-disabled', 'true')
      expect(btn).toHaveClass('loading')
    })

    it('is not aria-busy when not loading', () => {
      const { container } = render(ButtonHarness, { text: 'Save' })
      const btn = container.querySelector('button')!
      expect(btn).not.toHaveAttribute('aria-busy')
      expect(btn).not.toHaveAttribute('aria-disabled')
    })

    it('renders the shared Spinner while loading (no bespoke .spinner markup)', () => {
      const { container } = render(ButtonHarness, { loading: true, text: 'Save' })
      // The shared Spinner root is `.ss-spinner`; the old bespoke `.spinner`
      // ring (and its ss-btn-spin keyframe) are gone (DS-0113).
      expect(container.querySelector('.ss-spinner')).toBeInTheDocument()
      expect(container.querySelector('.spinner')).not.toBeInTheDocument()
    })

    it('loading=true renders the configured default Spinner variant (boxBounce2)', () => {
      const { container } = render(ButtonHarness, { loading: true, text: 'Save' })
      const frame = container.querySelector('.ss-spinner .frame')!.textContent!
      // boxBounce2 frames: ▌ ▀ ▐ ▄ — the default house variant.
      expect(['▌', '▀', '▐', '▄']).toContain(frame)
    })

    it("loading='pipe' renders the pipe Spinner variant (explicit override)", () => {
      const { container } = render(ButtonHarness, { loading: 'pipe', text: 'Save' })
      const frame = container.querySelector('.ss-spinner .frame')!.textContent!
      expect(['┤', '┘', '┴', '└', '├', '┌', '┬', '┐']).toContain(frame)
    })

    it('loading=false renders no spinner and is not aria-busy', () => {
      const { container } = render(ButtonHarness, { loading: false, text: 'Save' })
      expect(container.querySelector('.ss-spinner')).not.toBeInTheDocument()
      expect(container.querySelector('button')).not.toHaveAttribute('aria-busy')
    })

    it('suppresses the Spinner role so the button is the single live-region', () => {
      const { container } = render(ButtonHarness, { loading: true, text: 'Save' })
      const spinner = container.querySelector('.ss-spinner')!
      // role="status" is suppressed + aria-hidden so we don't get a double
      // announcement alongside the button's aria-busy name (DS-0113).
      expect(spinner).not.toHaveAttribute('role')
      expect(spinner).toHaveAttribute('aria-hidden', 'true')
    })

    it('guards onclick while loading (handler does not fire)', async () => {
      const onclick = vi.fn()
      render(ButtonHarness, { onclick, loading: true, text: 'Tap' })
      await fireEvent.click(screen.getByRole('button', { name: 'Tap' }))
      expect(onclick).not.toHaveBeenCalled()
    })

    it("guards onclick while loading via an explicit variant ('pipe')", async () => {
      const onclick = vi.fn()
      render(ButtonHarness, { onclick, loading: 'pipe', text: 'Tap' })
      await fireEvent.click(screen.getByRole('button', { name: 'Tap' }))
      expect(onclick).not.toHaveBeenCalled()
    })

    it('stays focusable while loading (soft-disable, no native disabled)', () => {
      const { container } = render(ButtonHarness, { loading: true, text: 'Save' })
      expect(container.querySelector('button')).not.toBeDisabled()
    })

    it('keeps a stable accessible name via loadingLabel', () => {
      render(ButtonHarness, { loading: true, loadingLabel: 'Saving…', text: 'Save' })
      expect(screen.getByRole('button', { name: 'Saving…' })).toBeInTheDocument()
    })

    it('passes the resolved size down to the Spinner (coordinated sizes)', () => {
      const { container } = render(ButtonHarness, { loading: true, size: 'lg', text: 'Save' })
      expect(container.querySelector('.ss-spinner')).toHaveAttribute('data-size-variant', 'lg')
    })

    it('loading with no children shows the spinner as the only flex child', () => {
      // Icon-only / no-text loading: the spinner affix is the single visible
      // child — no `.label` competing with it (DS-0114).
      const { container } = render(ButtonHarness, {
        loading: true,
        text: false,
        label: 'Saving',
      })
      expect(container.querySelector('.label')).not.toBeInTheDocument()
      const affixes = container.querySelectorAll('.affix')
      expect(affixes).toHaveLength(1)
      expect(affixes[0].querySelector('.ss-spinner')).toBeInTheDocument()
    })
  })

  describe('empty label span (DS-0114)', () => {
    it('renders no .label element when there are no children', () => {
      const { container } = render(ButtonHarness, { text: false, label: 'Settings' })
      expect(container.querySelector('.label')).not.toBeInTheDocument()
    })

    it('renders a .label only when children are present', () => {
      const { container } = render(ButtonHarness, { text: 'Hi' })
      expect(container.querySelector('.label')?.textContent).toBe('Hi')
    })
  })

  describe('icon height invariance (DS-0112)', () => {
    // jsdom has no layout engine (offsetHeight is always 0), so the px-equal
    // assertion the story describes can't be measured here. Instead assert the
    // structural/style invariants that GUARANTEE the equal height: the control
    // owns a deterministic min-height from control tokens, and `.affix` clamps
    // its icon to the text line-box so a taller glyph can't grow the control.
    const source = readFileSync(resolve(process.cwd(), 'src/lib/components/Button.svelte'), 'utf8')

    it('pins a deterministic control height from control tokens (not the icon)', () => {
      expect(source).toMatch(
        /min-height:\s*calc\(var\(--ss-control-font\)\s*\+\s*var\(--ss-control-py\)\s*\*\s*2\)/,
      )
    })

    it('clamps the .affix to the text line-box so the icon never grows the control', () => {
      expect(source).toMatch(/\.affix\s*\{[^}]*height:\s*1em/)
    })

    it('defangs the flex auto-min-size on .affix so an oversized icon cannot grow the control', () => {
      // As a flex item of `.ss-btn`, `.affix` would otherwise take a content-based
      // automatic minimum from the (taller) --ss-icon glyph, overriding `height: 1em`.
      expect(source).toMatch(/\.affix\s*\{[^}]*min-height:\s*0/)
    })

    it('renders leading/trailing icons inside a clamped .affix', () => {
      const { container } = render(ButtonHarness, {
        text: 'Next',
        leading: createRawSnippet(() => ({ render: () => '<svg></svg>' })),
        trailing: createRawSnippet(() => ({ render: () => '<svg></svg>' })),
      })
      expect(container.querySelectorAll('.affix')).toHaveLength(2)
    })
  })

  describe('icon-only', () => {
    it('exposes label as the aria-label and applies the icon-only class', () => {
      const { container } = render(ButtonHarness, { iconOnly: true, label: 'Settings', text: '⚙' })
      const btn = container.querySelector('button')!
      expect(btn).toHaveClass('icon-only')
      expect(screen.getByRole('button', { name: 'Settings' })).toBe(btn)
    })
  })

  describe('fullWidth', () => {
    it('applies the full-width class', () => {
      const { container } = render(ButtonHarness, { fullWidth: true, text: 'Wide' })
      expect(container.querySelector('button')).toHaveClass('full-width')
    })
  })

  describe('leading / trailing snippets', () => {
    it('renders leading and trailing affixes around the label', () => {
      const { container } = render(ButtonHarness, {
        text: 'Next',
        leading: createRawSnippet(() => ({ render: () => '<i>L</i>' })),
        trailing: createRawSnippet(() => ({ render: () => '<i>T</i>' })),
      })
      const affixes = container.querySelectorAll('.affix')
      expect(affixes).toHaveLength(2)
      expect(container.querySelector('.label')?.textContent).toBe('Next')
    })
  })

  describe('rest props', () => {
    it('forwards unknown attributes onto the <button>', () => {
      const { container } = render(ButtonHarness, { text: 'x', 'data-testid': 'my-btn' })
      expect(container.querySelector('button')).toHaveAttribute('data-testid', 'my-btn')
    })
  })
})
