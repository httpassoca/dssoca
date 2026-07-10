import { describe, it, expect } from 'vitest'
import { compile } from 'sass'
import { resolve } from 'node:path'
import { PALETTE_SLOTS } from '$lib/dssoca.config'
import { paletteSlotVar } from '$lib/config'

// Compile the tokens-only entry (same partials as theme.scss) and assert on
// the emitted CSS text. jsdom cannot *resolve* var()/color-mix()/oklch(), so
// these are structural guarantees; visual truth comes from the generator's
// mathematical AA assertions (palette-generator.test.ts) + the Storybook audit.
const css = compile(resolve(process.cwd(), 'src/styles/tokens.scss')).css

describe('tokens.css — root slots (Layer A)', () => {
  it('declares all 19 palette slots in both theme blocks', () => {
    for (const slot of PALETTE_SLOTS) {
      const decl = new RegExp(`${paletteSlotVar(slot)}: oklch\\(`, 'g')
      const count = (css.match(decl) ?? []).length
      expect(count, `${paletteSlotVar(slot)} declared per theme`).toBeGreaterThanOrEqual(2)
    }
  })

  it('sets color-scheme per theme', () => {
    expect(css).toContain('color-scheme: dark')
    expect(css).toContain('color-scheme: light')
  })
})

describe('tokens.css — semantic layer (Layer B)', () => {
  it('keeps the deprecated aliases for one minor (purple → magenta, lime → green)', () => {
    expect(css).toContain('--ss-purple: var(--ss-magenta)')
    expect(css).toContain('--ss-lime: var(--ss-green)')
  })

  it('primary/success/danger re-base onto the slots', () => {
    expect(css).toContain('--ss-primary: var(--ss-accent)')
    expect(css).toContain('--ss-success: var(--ss-accent)')
    expect(css).toContain('--ss-danger: var(--ss-red)')
  })

  it('derives surfaces and washes via color-mix from the slots', () => {
    for (const needle of [
      '--ss-bg-elev: color-mix(in oklab, var(--ss-bg) 88%, var(--ss-bright-white))',
      '--ss-line: color-mix(in srgb, var(--ss-bright-white) 12%, transparent)',
      '--ss-primary-soft: color-mix(in srgb, var(--ss-accent) 18%, transparent)',
      '--ss-badge-critical-bg: color-mix(in srgb, var(--ss-red) 12%, transparent)',
    ]) {
      expect(css).toContain(needle)
    }
  })

  it('maps the code palette onto the terminal slots', () => {
    expect(css).toContain('--ss-code-string: var(--ss-green)')
    expect(css).toContain('--ss-code-keyword: var(--ss-magenta)')
    expect(css).toContain('--ss-code-comment: var(--ss-bright-black)')
  })

  it('ships no -rgb triplets and no raw brand-green rgba anywhere', () => {
    expect(css).not.toMatch(/--ss-[a-z-]*-rgb:/)
    expect(css).not.toContain('rgba(102, 239')
  })

  it('carries the shared aliases (declared once; resolved per-element by the cascade)', () => {
    expect(css).toContain('--ss-selection-bg: var(--ss-accent)')
    expect(css).toContain('--ss-fg-faint: var(--ss-bright-black)')
  })
})
