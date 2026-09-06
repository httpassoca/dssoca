import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { compileString } from 'sass'
import { extractStyleBlock } from '../../scripts/lib/vanilla-css.mjs'

/**
 * theme.css styles every `<a>` with an animated `::before` underline (see `_base.scss`). The
 * components that render anchors as chrome (nav items, tabs, card overlays, service tiles,
 * palette rows) must cancel it in their own scoped CSS, otherwise a stray 1px primary line shows
 * under sidebar items, bottom-nav tabs and along the bottom edge of linked cards — in Svelte and
 * in vanilla.css alike (found while building the Inspirations pages, DS-0150).
 */
const RESETS: Record<string, string[]> = {
  Sidebar: ['.item::before'],
  BottomNav: ['.tab::before'],
  Topbar: ['.tab::before', '.skip::before'],
  Card: ['.overlay::before'],
  ServiceCard: ['.ss-svc::before'],
  SearchPalette: ['.row::before'],
}

describe('component anchors cancel the global a::before underline', () => {
  it.each(Object.entries(RESETS))('%s', (name, selectors) => {
    const src = readFileSync(resolve(process.cwd(), `src/lib/components/${name}.svelte`), 'utf8')
    expect(src, `${name} renders an <a>`).toMatch(/<a\b/)
    const css = compileString(extractStyleBlock(src)!, { syntax: 'scss', style: 'expanded' }).css
    for (const sel of selectors) {
      const rule = css.split('}').find((r) => r.includes(sel))
      expect(rule, `${name}: ${sel} rule`).toBeDefined()
      expect(rule).toMatch(/content:\s*none/)
    }
  })
})
