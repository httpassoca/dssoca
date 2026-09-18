import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { listInspirations, loadManifest } from '../../scripts/lib/inspirations.mjs'
import { COMPONENTS, INSPIRATIONS_URL, NAV } from '../src/lib/docs.config'
import { pageItems } from '../src/lib/search'

// DS-0158 — the Inspirations gallery inside the docs. The docs suite is node-only, so this pins
// the data contract (one manifest, agreeing with the site folders) and the page's source-text
// contract; rendering is covered by the library's Card tests + the browser pass.
const repo = (p: string) => resolve(process.cwd(), '..', p)
const read = (p: string) => readFileSync(resolve(process.cwd(), p), 'utf8')
const manifest = loadManifest(repo('inspirations/manifest.json'))
const page = read('src/routes/inspirations/+page.svelte')

describe('docs — inspirations gallery', () => {
  it('the manifest lists exactly the example-site folders', () => {
    expect(manifest.map((e) => e.slug).sort()).toEqual(listInspirations(repo('inspirations')))
  })

  it('every component chip names a documented component', () => {
    const names = new Set(COMPONENTS.map((c) => c.name))
    for (const e of manifest)
      for (const c of e.components) expect(names, `${e.slug}: ${c}`).toContain(c)
  })

  it('the page renders from the shared manifest, never a hand-copied card list', () => {
    expect(page).toContain("from '@dssoca/inspirations/manifest.json'")
    expect(page).toContain('{#each sites as site (site.slug)}')
    // No card copy inlined: none of the blurbs appear verbatim in the page source.
    for (const e of manifest) expect(page, e.slug).not.toContain(e.blurb)
  })

  it('cards open the example on the Pages host in a new tab and hot-link its thumbnail', () => {
    expect(page).toContain('INSPIRATIONS_URL')
    expect(page).toMatch(/href=\{siteUrl\(site\.slug\)\}\s+external/)
    expect(page).toContain('thumbs/${slug}.png')
    expect(page).toContain('class="placeholder"')
    expect(page).toContain('rel="noopener noreferrer"') // the standalone-site link in the intro
  })

  it('is an internal nav entry in the explore group, and search routes to it', () => {
    const explore = NAV.find((g) => g.section === 'explore')!
    const item = explore.items.find((i) => i.label === 'Inspirations')!
    expect(item).toMatchObject({ href: '/inspirations', icon: 'film' })
    expect(item.external).toBeUndefined()
    expect(item.keywords).toContain('examples')
    const hit = pageItems().find((p) => p.label === 'Inspirations')!
    expect(hit.href).toBe('/inspirations')
    expect(hit.url).toBeUndefined()
    expect(INSPIRATIONS_URL.endsWith('/')).toBe(true)
  })

  it('the docs route is prerendered like every other page', () => {
    expect(read('src/routes/+layout.ts')).toContain('export const prerender = true')
  })
})
