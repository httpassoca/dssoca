import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// `dssoca/vanilla.js` must stay framework-free and loadable straight from a CDN as an ESM
// module graph: no Svelte, no runes modules, no aliases, only relative `.js` specifiers.
const dir = resolve(process.cwd(), 'src/lib/vanilla')
const files = readdirSync(dir).filter((f) => f.endsWith('.ts'))

describe('vanilla — purity', () => {
  it('has the expected modules', () => {
    expect(files).toContain('index.ts')
    expect(files.some((f) => f.endsWith('.svelte.ts'))).toBe(false)
  })

  it.each(files)('%s imports only relative .js modules and never Svelte', (file) => {
    const src = readFileSync(resolve(dir, file), 'utf8')
    const specifiers = [...src.matchAll(/from\s+'([^']+)'/g)].map((m) => m[1])
    for (const s of specifiers) {
      expect(s, `${file} → ${s}`).toMatch(/^\.\.?\//)
      expect(s, `${file} → ${s}`).toMatch(/\.js$/)
      expect(s, `${file} → ${s}`).not.toMatch(/\.svelte\.js$|\.svelte$/)
    }
    expect(src).not.toMatch(/\$state|\$derived|\$effect|\$props/)
    expect(src).not.toMatch(/from 'svelte/)
  })

  it('config.js (shared with the Svelte entry) is itself rune-free', () => {
    const src = readFileSync(resolve(process.cwd(), 'src/lib/config.ts'), 'utf8')
    expect(src).not.toMatch(/\$state|\$derived|\$effect/)
    expect(src).not.toMatch(/from 'svelte/)
  })
})
