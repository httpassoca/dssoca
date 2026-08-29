import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// DS-0147 — source-text contract for the keyboard layer of the docs shell
// (the docs suite is node-only; behaviour is covered by the library's own
// SearchPalette / ShortcutsHelp / Topbar / registry tests + a browser check).
const read = (p: string) => readFileSync(resolve(process.cwd(), p), 'utf8')
const layout = read('src/routes/+layout.svelte')

describe('docs shell — keyboard layer', () => {
  it('dogfoods Topbar, SearchPalette, ShortcutsHelp and Toaster from dssoca', () => {
    for (const c of ['Topbar', 'SearchPalette', 'ShortcutsHelp', 'Toaster']) {
      expect(layout, c).toMatch(new RegExp(`<${c}\\b`))
    }
  })

  it('lets Topbar own mod+k on shell routes and the palette own it on the landing', () => {
    expect(layout).toContain('onCommand={() => (paletteOpen = true)}')
    expect(layout).toContain("shortcut={isLanding ? 'mod+k' : false}")
  })

  it('registers the site shortcuts through the registry with the agreed ids/keys', () => {
    expect(layout).toMatch(/id: 'docs:search',[\s\S]*?keys: '\/'/)
    expect(layout).toMatch(/id: 'docs:toggle-theme',[\s\S]*?keys: 'shift\+d'/)
    expect(layout).toMatch(/id: 'docs:cycle-size',[\s\S]*?keys: 'shift\+s'/)
  })

  it('mounts the palette and help outside the landing branch so they work on every route', () => {
    const afterIf = layout.slice(layout.lastIndexOf('{/if}'))
    expect(afterIf).toContain('<SearchPalette')
    expect(afterIf).toContain('<ShortcutsHelp')
  })

  it('makes the help overlay editable and persists overrides', () => {
    expect(layout).toMatch(/<ShortcutsHelp[^>]*\beditable\b/)
    expect(layout).toContain('restoreShortcutOverrides()')
    expect(layout).toContain('saveShortcutOverrides()')
    expect(read('src/lib/shortcut-persistence.ts')).toContain("'dssoca-docs:shortcuts'")
  })

  it('the keyboard guide documents the live site bindings', () => {
    const guide = read('src/routes/keyboard/+page.svx')
    expect(guide).toContain('## Try it on this site')
    for (const k of ['mod+k', '/', '?, mod+/', 'shift+d', 'shift+s']) {
      expect(guide, k).toContain(`keys="${k}"`)
    }
  })
})
