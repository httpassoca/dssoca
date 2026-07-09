import { describe, it, expect } from 'vitest'
import { deriveMonoPalette } from '../src/lib/theme-builder/derive'
import { EXPORT_FORMATS } from '../src/lib/theme-builder/export'
import { SLOTS, SLOT_TO_CSS_VAR } from '../src/lib/theme-builder/types'
import { DEFAULT_SEED } from '../../scripts/lib/palette.mjs'

const palette = deriveMonoPalette({ accent: DEFAULT_SEED, tint: 0.35, neutralChroma: 1 })
const meta = { accent: DEFAULT_SEED, tint: 0.35 }

const format = (id: string) => {
  const f = EXPORT_FORMATS.find((f) => f.id === id)
  expect(f, id).toBeDefined()
  return f!
}

describe('theme-builder export — registry', () => {
  it('ships exactly the two v1 formats (ts + css)', () => {
    expect(EXPORT_FORMATS.map((f) => f.id)).toEqual(['ts', 'css'])
    for (const f of EXPORT_FORMATS) {
      expect(f.label).toBeTruthy()
      expect(f.lang).toBeTruthy()
    }
  })
})

describe('theme-builder export — TypeScript format', () => {
  const out = format('ts').generate(palette, meta)

  it('emits the import line and the applyDesignConfig call', () => {
    expect(out).toContain(`import { applyDesignConfig, type Palette } from 'dssoca'`)
    expect(out).toContain('applyDesignConfig({ palette })')
    expect(out).toContain(`accent ${DEFAULT_SEED}, tint 35%`)
  })

  it('lists all 19 slots twice (dark + light), each with its hex', () => {
    for (const slot of SLOTS) {
      const occurrences = out.split(`${slot}: '`).length - 1
      expect(occurrences, slot).toBe(2)
      expect(out).toContain(`${slot}: '${palette.dark[slot]}'`)
      expect(out).toContain(`${slot}: '${palette.light[slot]}'`)
    }
  })

  it('keeps the canonical slot order', () => {
    const keys = [...out.matchAll(/^\s{4}([a-zA-Z]+): '/gm)].map((m) => m[1])
    expect(keys).toEqual([...SLOTS, ...SLOTS])
  })
})

describe('theme-builder export — CSS format', () => {
  const out = format('css').generate(palette, meta)

  it('carries the load-order comment and both theme selectors', () => {
    expect(out.startsWith('/* dssoca palette override — Theme Builder')).toBe(true)
    expect(out).toContain('load AFTER dssoca/theme.css')
    expect(out).toContain(`:root,\n[data-theme='dark'] {`)
    expect(out).toContain(`[data-theme='light'] {`)
  })

  it('declares all 19 --ss-* custom properties per theme, incl. --ss-bright-white', () => {
    for (const slot of SLOTS) {
      const cssVar = SLOT_TO_CSS_VAR[slot]
      expect(out).toContain(`${cssVar}: ${palette.dark[slot]};`)
      expect(out).toContain(`${cssVar}: ${palette.light[slot]};`)
    }
    expect(out).toContain('--ss-bright-white:')
    expect(out.split('--ss-bright-white:').length - 1).toBe(2)
  })

  it('keeps the canonical slot order in both blocks', () => {
    const vars = [...out.matchAll(/^\s{2}(--ss-[a-z-]+):/gm)].map((m) => m[1])
    const expected = SLOTS.map((s) => SLOT_TO_CSS_VAR[s])
    expect(vars).toEqual([...expected, ...expected])
  })
})
