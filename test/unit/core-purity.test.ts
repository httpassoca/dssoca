import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { resolve, relative } from 'node:path'

// `src/lib/core/` is the behaviour layer shared by the Svelte components and `vanilla.js`
// (DS-0197). It must stay framework-free and DOM-free: pure functions over state, so both
// paths can call it and it can be unit-tested without a document.
const dir = resolve(process.cwd(), 'src/lib/core')
const files = (readdirSync(dir, { recursive: true }) as string[])
  .filter((f) => f.endsWith('.ts'))
  .map((f) => f.replaceAll('\\', '/'))

describe('core — purity', () => {
  it('has the expected modules', () => {
    expect(files).toContain('menu.ts')
    expect(files).toContain('switch.ts')
    expect(files).toContain('behaviors/roving.ts')
    expect(files.some((f) => f.endsWith('.svelte.ts'))).toBe(false)
  })

  it.each(files)('%s imports only core modules, by relative .js specifier', (file) => {
    const src = readFileSync(resolve(dir, file), 'utf8')
    const specifiers = [...src.matchAll(/from\s+'([^']+)'/g)].map((m) => m[1])
    for (const s of specifiers) {
      expect(s, `${file} → ${s}`).toMatch(/^\.\.?\/.*\.js$/)
      const target = relative(dir, resolve(dir, file, '..', s))
      expect(target.startsWith('..'), `${file} → ${s} leaves core/`).toBe(false)
    }
    expect(src).not.toMatch(/\$(state|derived|effect|props)\s*[(.<]/)
  })

  it.each(files)('%s never touches the DOM', (file) => {
    const code = readFileSync(resolve(dir, file), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '')
    expect(code).not.toMatch(/\b(document|window)\./)
    expect(code).not.toMatch(/\b(querySelector|addEventListener|getAttribute|setAttribute)\b/)
    expect(code).not.toMatch(/\bHTML[A-Za-z]*Element\b/)
  })
})
