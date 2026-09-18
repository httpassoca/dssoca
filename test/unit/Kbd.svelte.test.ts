import { describe, it, expect, afterEach, vi } from 'vitest'
import { render } from '@testing-library/svelte'
import { axe } from 'vitest-axe'
import { compileString } from 'sass'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { tick } from 'svelte'
import KbdHarness from '../harness/KbdHarness.svelte'

// DS-0137 — Kbd, the display-only key-cap chip. Rendering goes through
// `formatShortcutParts` (DS-0136), so combo-grammar coverage lives in
// shortcuts.svelte.test.ts; these tests pin the markup contract.

const caps = (container: HTMLElement): string[] =>
  Array.from(container.querySelectorAll('.ss-kbd .key')).map((el) => el.textContent ?? '')

describe('Kbd', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('nested-<kbd> structure', () => {
    it('renders an outer <kbd class="ss-kbd"> with one inner <kbd class="key"> per key', () => {
      const { container } = render(KbdHarness, { keys: 'mod+shift+k', platform: 'other' })
      const root = container.querySelector('.ss-kbd')!
      expect(root).not.toBeNull()
      expect(root.tagName).toBe('KBD')
      const keys = root.querySelectorAll('kbd.key')
      expect(keys).toHaveLength(3)
      expect(caps(container)).toEqual(['Ctrl', 'Shift', 'K'])
    })

    it('separates keys with aria-hidden "+" spans', () => {
      const { container } = render(KbdHarness, { keys: 'mod+shift+k', platform: 'other' })
      const seps = container.querySelectorAll('.ss-kbd .sep')
      expect(seps).toHaveLength(2)
      for (const sep of seps) {
        expect(sep).toHaveTextContent('+')
        expect(sep).toHaveAttribute('aria-hidden', 'true')
      }
    })

    it('throws on a malformed combo (same parser as registration)', () => {
      expect(() => render(KbdHarness, { keys: 'hyper+k', platform: 'other' })).toThrow(
        /cannot parse/,
      )
    })
  })

  describe('glyph vs label × platform', () => {
    it('glyph on apple: modifier glyphs, concatenated (no separators)', () => {
      const { container } = render(KbdHarness, {
        keys: 'mod+k',
        format: 'glyph',
        platform: 'apple',
      })
      expect(caps(container)).toEqual(['⌘', 'K'])
      expect(container.querySelector('.ss-kbd .sep')).toBeNull()
    })

    it('glyph on other: words with "+" separators', () => {
      const { container } = render(KbdHarness, {
        keys: 'mod+k',
        format: 'glyph',
        platform: 'other',
      })
      expect(caps(container)).toEqual(['Ctrl', 'K'])
      expect(container.querySelectorAll('.ss-kbd .sep')).toHaveLength(1)
    })

    it('label on apple: full words with separators', () => {
      const { container } = render(KbdHarness, {
        keys: 'mod+k',
        format: 'label',
        platform: 'apple',
      })
      expect(caps(container)).toEqual(['Command', 'K'])
      expect(container.querySelectorAll('.ss-kbd .sep')).toHaveLength(1)
    })

    it('label on other: words', () => {
      const { container } = render(KbdHarness, {
        keys: 'mod+k',
        format: 'label',
        platform: 'other',
      })
      expect(caps(container)).toEqual(['Ctrl', 'K'])
    })

    it('renders key glyphs in glyph format and words in label format', () => {
      const glyph = render(KbdHarness, { keys: 'enter', format: 'glyph', platform: 'apple' })
      expect(caps(glyph.container)).toEqual(['↵'])
      const label = render(KbdHarness, { keys: 'enter', format: 'label', platform: 'apple' })
      expect(caps(label.container)).toEqual(['Enter'])
    })
  })

  describe('accessible name', () => {
    it('glyph roots carry a full-word aria-label via role="img"', () => {
      const { container } = render(KbdHarness, {
        keys: 'mod+k',
        format: 'glyph',
        platform: 'apple',
      })
      const root = container.querySelector('.ss-kbd')!
      expect(root).toHaveAttribute('role', 'img')
      expect(root).toHaveAttribute('aria-label', 'Command K')
    })

    it('uses the platform words on non-Apple platforms', () => {
      const { container } = render(KbdHarness, {
        keys: 'mod+k',
        format: 'glyph',
        platform: 'other',
      })
      expect(container.querySelector('.ss-kbd')).toHaveAttribute('aria-label', 'Ctrl K')
    })

    it('label format reads naturally — no role or aria-label', () => {
      const { container } = render(KbdHarness, {
        keys: 'mod+k',
        format: 'label',
        platform: 'apple',
      })
      const root = container.querySelector('.ss-kbd')!
      expect(root).not.toHaveAttribute('role')
      expect(root).not.toHaveAttribute('aria-label')
    })
  })

  describe('comma alternatives', () => {
    it('renders sibling groups joined by a muted "or"', () => {
      const { container } = render(KbdHarness, {
        keys: '?, mod+/',
        format: 'glyph',
        platform: 'other',
      })
      expect(caps(container)).toEqual(['?', 'Ctrl', '/'])
      const or = container.querySelectorAll('.ss-kbd .or')
      expect(or).toHaveLength(1)
      expect(or[0]).toHaveTextContent('or')
      expect(or[0]).not.toHaveAttribute('aria-hidden')
    })

    it('joins the aria-label alternatives with "or"', () => {
      const { container } = render(KbdHarness, {
        keys: '?, mod+/',
        format: 'glyph',
        platform: 'apple',
      })
      expect(container.querySelector('.ss-kbd')).toHaveAttribute('aria-label', '? or Command /')
    })
  })

  describe('children escape hatch', () => {
    it('renders raw content as a single key cap', () => {
      const { container } = render(KbdHarness, { text: 'F12' })
      expect(caps(container)).toEqual(['F12'])
      const root = container.querySelector('.ss-kbd')!
      expect(root).not.toHaveAttribute('role')
      expect(root).not.toHaveAttribute('aria-label')
    })

    it('is ignored when keys is set', () => {
      const { container } = render(KbdHarness, { keys: 'k', platform: 'other', text: 'F12' })
      expect(caps(container)).toEqual(['K'])
    })
  })

  describe('size', () => {
    it('writes the per-instance size as data-size-variant', () => {
      const { container } = render(KbdHarness, { keys: 'mod+k', platform: 'other', size: 'lg' })
      expect(container.querySelector('.ss-kbd')).toHaveAttribute('data-size-variant', 'lg')
    })

    it('inherits the ancestor size when unset (no attribute)', () => {
      const { container } = render(KbdHarness, { keys: 'mod+k', platform: 'other' })
      expect(container.querySelector('.ss-kbd')).not.toHaveAttribute('data-size-variant')
    })
  })

  // DS-0157 — hide on keyboard-less devices. jsdom evaluates no media queries, so the
  // markup contract (the opt-out attribute) and the CSS rule are pinned separately.
  describe('hideOnMobile (DS-0157)', () => {
    it('defaults to true: no opt-out attribute on the root', () => {
      const { container } = render(KbdHarness, { keys: 'mod+k', platform: 'other' })
      expect(container.querySelector('.ss-kbd')).not.toHaveAttribute('data-hide-on-mobile')
    })

    it('hideOnMobile={false} reflects data-hide-on-mobile="false" on the root', () => {
      const { container } = render(KbdHarness, {
        keys: 'mod+k',
        platform: 'other',
        hideOnMobile: false,
      })
      expect(container.querySelector('.ss-kbd')).toHaveAttribute('data-hide-on-mobile', 'false')
    })

    it('applies to the raw-content escape hatch too', () => {
      const { container } = render(KbdHarness, { text: 'F12', hideOnMobile: false })
      expect(container.querySelector('.ss-kbd')).toHaveAttribute('data-hide-on-mobile', 'false')
    })

    it('hides with a capability query, not a width, and only without the opt-out', () => {
      const src = readFileSync(resolve(__dirname, '../../src/lib/components/Kbd.svelte'), 'utf8')
      const scss = /<style lang="scss">([\s\S]*?)<\/style>/.exec(src)![1]
      const css = compileString(scss, { syntax: 'scss', style: 'expanded' }).css
      const block = /@media \(hover: none\) and \(pointer: coarse\) \{([\s\S]*?)\n\}/.exec(css)
      expect(block, 'capability media query').not.toBeNull()
      expect(block![1]).toContain('.ss-kbd:not([data-hide-on-mobile=false])')
      expect(block![1]).toMatch(/display:\s*none/)
      expect(css).not.toMatch(/max-width/)
    })

    it('is axe-clean in both states', async () => {
      const shown = render(KbdHarness, { keys: 'mod+k', platform: 'apple', hideOnMobile: false })
      expect(await axe(shown.container)).toHaveNoViolations()
      const hidden = render(KbdHarness, { keys: 'mod+k', platform: 'apple' })
      expect(await axe(hidden.container)).toHaveNoViolations()
    })
  })

  describe('platform auto-detection (hydration posture)', () => {
    it('defaults to "other" and corrects to the detected platform in an effect', async () => {
      vi.stubGlobal('navigator', { platform: 'MacIntel', userAgent: '' })
      const { container } = render(KbdHarness, { keys: 'mod+k', format: 'glyph' })
      await tick() // effect correction has flushed
      expect(caps(container)).toEqual(['⌘', 'K'])
    })

    it('renders "other" when the platform is not Apple', async () => {
      const { container } = render(KbdHarness, { keys: 'mod+k', format: 'glyph' })
      await tick()
      expect(caps(container)).toEqual(['Ctrl', 'K'])
    })

    it('an explicit platform prop wins over detection', async () => {
      vi.stubGlobal('navigator', { platform: 'MacIntel', userAgent: '' })
      const { container } = render(KbdHarness, {
        keys: 'mod+k',
        format: 'glyph',
        platform: 'other',
      })
      await tick()
      expect(caps(container)).toEqual(['Ctrl', 'K'])
    })
  })
})
