import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { compile, compileString } from 'sass'
import { axe } from 'vitest-axe'
import { SPINNER_VARIANTS } from '$lib/spinner-frames'
import { dssocaConfig } from '$lib/dssoca.config'
import { buildVanillaCss, extractStyleBlock } from '../../scripts/lib/vanilla-css.mjs'
import {
  GALLERY_MARKER,
  INSPIRATIONS_DIR,
  listInspirations,
  loadManifest,
  relocateFontUrls,
  renderGallery,
  renderGalleryCard,
  thumbAlt,
  vendorFiles,
} from '../../scripts/lib/inspirations.mjs'
import { COMPONENT_NAMES } from '$lib/dssoca.config'
import { fileAt, startServer } from '../../scripts/serve-inspirations.mjs'

/**
 * Inspirations (DS-0150): the example websites under `inspirations/` are plain HTML on the
 * vanilla path. These guards pin the page contract (what every page must load and declare),
 * catch drift between the gallery and the folders, verify that every `ss-*` class a page uses
 * actually exists in the generated CSS (a typo would silently render unstyled), run axe over
 * each page, and enforce the page-CSS policy (tokens only, zero radius). Everything is derived
 * from source — no `dist/` needed.
 */

const VALID_THEMES = ['dark', 'light']
const VALID_SIZES = ['sm', 'md', 'lg']

const slugs = listInspirations()
const manifest = loadManifest()
const readPage = (dir: string) => readFileSync(join(dir, 'index.html'), 'utf8')
const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html')
/** The gallery as the build ships it: the source template with its cards rendered (DS-0158). */
const galleryHtml = () => renderGallery(readPage(INSPIRATIONS_DIR), manifest)

/** Every page (the gallery + one per site) with the prefix its dssoca links must use. */
const pages: Array<{ name: string; dir: string; prefix: string; html: string }> = [
  { name: 'gallery', dir: INSPIRATIONS_DIR, prefix: './', html: galleryHtml() },
  ...slugs.map((slug) => ({
    slug,
    name: slug,
    dir: join(INSPIRATIONS_DIR, slug),
    prefix: '../',
    html: readPage(join(INSPIRATIONS_DIR, slug)),
  })),
]

// ---- allowed `ss-*` classes: whatever the generated stylesheets define -----------------
let allowed: Set<string>
const MARKER_PREFIXES: string[] = []
beforeAll(() => {
  const componentsDir = resolve(process.cwd(), 'src/lib/components')
  const compiled: Record<string, string> = {}
  for (const file of readdirSync(componentsDir)
    .filter((f) => f.endsWith('.svelte'))
    .sort()) {
    const scss = extractStyleBlock(readFileSync(join(componentsDir, file), 'utf8'))
    if (scss === null) continue
    compiled[file.slice(0, -'.svelte'.length)] = compileString(scss, {
      syntax: 'scss',
      style: 'expanded',
    }).css
  }
  const vanilla = buildVanillaCss(compiled, {
    spinnerVariants: SPINNER_VARIANTS,
    defaultSpinnerVariant: dssocaConfig.spinner.default,
  })
  const theme = compile(resolve(process.cwd(), 'src/styles/theme.scss')).css
  allowed = new Set([...`${vanilla}\n${theme}`.matchAll(/\.(ss-[\w-]+)/g)].map((m) => m[1]))
  // Marker classes/prefixes the vanilla module itself adds or reads (not selectors).
  const vanillaDir = resolve(process.cwd(), 'src/lib/vanilla')
  for (const file of readdirSync(vanillaDir)) {
    const src = readFileSync(join(vanillaDir, file), 'utf8')
    for (const m of src.matchAll(/['"`](ss-[\w-]+)['"`]/g)) allowed.add(m[1])
    for (const m of src.matchAll(/['"`](ss-[\w]+-)['"`]/g)) MARKER_PREFIXES.push(m[1])
  }
  document.documentElement.lang = 'en'
})

describe('inspirations: folders ↔ gallery', () => {
  it('has at least the planned twelve sites, each with an index.html', () => {
    expect(slugs.length).toBeGreaterThanOrEqual(12)
    for (const slug of slugs)
      expect(existsSync(join(INSPIRATIONS_DIR, slug, 'index.html'))).toBe(true)
  })

  it('every sub-folder except assets/ is a site (no stray folders)', () => {
    const dirs = readdirSync(INSPIRATIONS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory() && d.name !== 'assets')
      .map((d) => d.name)
      .sort()
    expect(dirs).toEqual(slugs)
  })

  it('the gallery links every site (new tab, noopener) and nothing else', () => {
    const doc = parse(galleryHtml())
    const cards = [...doc.querySelectorAll<HTMLAnchorElement>('a[data-inspiration]')]
    const linked = cards.map((a) => a.getAttribute('data-inspiration')).sort()
    expect(linked).toEqual(slugs)
    for (const a of cards) {
      const slug = a.getAttribute('data-inspiration') ?? ''
      expect(a.getAttribute('href'), slug).toBe(`./${slug}/`)
      expect(a.getAttribute('target'), slug).toBe('_blank')
      expect(a.getAttribute('rel'), slug).toMatch(/\bnoopener\b/)
      // The link is the Card's overlay anchor; the thumbnail lives in the same Card's media.
      const img = a.closest('.ss-card')?.querySelector('img')
      expect(img?.getAttribute('src'), slug).toBe(`./thumbs/${slug}.png`)
      expect(img?.getAttribute('alt'), slug).toBeTruthy()
      expect(img?.getAttribute('loading'), slug).toBe('lazy')
    }
  })
})

// DS-0158: one manifest feeds both galleries (Pages + the docs site's /inspirations page).
describe('inspirations: manifest', () => {
  it('lists exactly the site folders, each once', () => {
    expect(manifest.map((e) => e.slug).sort()).toEqual(slugs)
  })

  it('has a title, kind, blurb and real component chips per site', () => {
    for (const e of manifest) {
      expect(e.title.trim(), e.slug).not.toBe('')
      expect(e.kind.trim(), e.slug).not.toBe('')
      expect(e.blurb.trim(), e.slug).not.toBe('')
      expect(e.components.length, e.slug).toBeGreaterThan(0)
      for (const c of e.components) expect(COMPONENT_NAMES, `${e.slug}: ${c}`).toContain(c)
    }
  })

  it('the source gallery carries the card marker exactly once, and the build fills it', () => {
    const src = readPage(INSPIRATIONS_DIR)
    expect(src.split(GALLERY_MARKER)).toHaveLength(2)
    const built = galleryHtml()
    expect(built).not.toContain(GALLERY_MARKER)
    expect(built.match(/data-inspiration="/g)).toHaveLength(manifest.length)
    expect(() => renderGallery('<ul></ul>', manifest)).toThrow(/marker/)
  })

  it('renders a card on the vanilla Card contract, escaped, with a derived alt', () => {
    const entry = {
      slug: 'demo',
      title: 'A <b>& B</b>',
      kind: 'k',
      blurb: 'says "hi"',
      components: ['Card'],
    }
    const card = renderGalleryCard(entry)
    expect(card).toContain('A &lt;b&gt;&amp; B&lt;/b&gt;')
    expect(card).toContain('says &quot;hi&quot;')
    expect(card).toContain(
      `alt="${thumbAlt(entry).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}"`,
    )
    expect(card).toContain('href="./demo/"')
    expect(card).toContain('rel="noopener noreferrer"')
    expect(card).toContain('(opens in a new tab)')
    expect(thumbAlt({ title: 'Ops console' })).toBe('Screenshot of the ops console example')
  })

  it('loadManifest rejects malformed entries', () => {
    const dir = mkdtempSync(join(tmpdir(), 'dssoca-manifest-'))
    const f = join(dir, 'manifest.json')
    writeFileSync(
      f,
      JSON.stringify([
        { slug: 'a', title: 'A', kind: 'k', blurb: 'b', components: [] },
        { slug: 'a', title: 'A', kind: 'k', blurb: 'b', components: [] },
      ]),
    )
    expect(() => loadManifest(f)).toThrow(/duplicate slug/)
    writeFileSync(
      f,
      JSON.stringify([{ slug: 'a', title: '', kind: 'k', blurb: 'b', components: [] }]),
    )
    expect(() => loadManifest(f)).toThrow(/missing "title"/)
    writeFileSync(
      f,
      JSON.stringify([{ slug: 'Bad Slug', title: 'A', kind: 'k', blurb: 'b', components: [] }]),
    )
    expect(() => loadManifest(f)).toThrow(/bad slug/)
    writeFileSync(
      f,
      JSON.stringify([{ slug: 'a', title: 'A', kind: 'k', blurb: 'b', components: 'Card' }]),
    )
    expect(() => loadManifest(f)).toThrow(/components/)
    writeFileSync(f, '[]')
    expect(() => loadManifest(f)).toThrow(/non-empty/)
  })
})

describe.each(pages.map((p) => [p.name, p] as const))('inspirations page: %s', (_n, page) => {
  const html = page.html
  const doc = parse(html)

  it('declares the document contract (doctype, lang, both design axes, viewport, title)', () => {
    expect(doc.doctype?.name).toBe('html')
    expect(html.trimStart().toLowerCase().startsWith('<!doctype html>')).toBe(true)
    const root = doc.documentElement
    expect(root.getAttribute('lang')).toBeTruthy()
    expect(VALID_THEMES).toContain(root.getAttribute('data-theme'))
    expect(VALID_SIZES).toContain(root.getAttribute('data-size-variant'))
    expect(doc.querySelector('meta[name="viewport"]')?.getAttribute('content')).toContain(
      'width=device-width',
    )
    expect(doc.querySelector('meta[charset]')).not.toBeNull()
    expect(doc.title.trim().length).toBeGreaterThan(0)
  })

  it('loads dssoca from the vendored build in the right order, then the axes module', () => {
    const p = page.prefix
    const sheets = [...doc.head.querySelectorAll('link[rel="stylesheet"]')].map((l) =>
      l.getAttribute('href'),
    )
    expect(sheets.slice(0, 2)).toEqual([`${p}vendor/theme.css`, `${p}vendor/vanilla.css`])
    for (const href of sheets) expect(href, 'stylesheets are local').not.toMatch(/^(https?:)?\/\//)
    const modules = [...doc.head.querySelectorAll('script[type="module"]')].map((s) =>
      s.getAttribute('src'),
    )
    expect(modules).toContain(`${p}vendor/vanilla/index.js`)
    expect(modules).toContain(`${p}assets/axes.js`)
    for (const src of [...doc.querySelectorAll('script[src]')].map(
      (s) => s.getAttribute('src') ?? '',
    )) {
      expect(src, 'scripts are local').not.toMatch(/^(https?:)?\/\//)
    }
    for (const src of [...doc.querySelectorAll('img[src]')].map(
      (i) => i.getAttribute('src') ?? '',
    )) {
      expect(src, 'images are self-contained').not.toMatch(/^(https?:)?\/\//)
    }
  })

  it('carries no Svelte artefacts and no raw colour literals in inline styles', () => {
    expect(html).not.toMatch(/svelte-[a-z0-9]{4,}/)
    expect(html).not.toMatch(/<!--\s*\[?\]?\s*-->/)
    for (const el of doc.querySelectorAll('[style]')) {
      const style = el.getAttribute('style') ?? ''
      expect(style, `${el.tagName}.${el.className}`).not.toMatch(
        /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(/i,
      )
      expect(style).not.toMatch(/border-radius/)
    }
  })

  it('only uses ss-* classes that exist in the generated CSS', () => {
    const used = new Set<string>()
    for (const el of doc.querySelectorAll('[class]')) {
      for (const c of el.getAttribute('class')!.split(/\s+/)) if (c.startsWith('ss-')) used.add(c)
    }
    const unknown = [...used].filter(
      (c) => !allowed.has(c) && !MARKER_PREFIXES.some((p) => c.startsWith(p)),
    )
    expect(unknown, 'unknown ss-* classes').toEqual([])
    expect(used.size, 'the page is built from dssoca components').toBeGreaterThan(3)
  })

  it('has landmarks and a single h1', () => {
    expect(doc.querySelector('main'), 'a <main> landmark').not.toBeNull()
    expect(doc.querySelectorAll('h1, [role="heading"][aria-level="1"]').length).toBe(1)
  })

  it('has no axe violations (jsdom; colour contrast is checked in the browser pass)', async () => {
    const results = await axe(doc.body.innerHTML, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results).toHaveNoViolations()
  }, 30_000)

  it('keeps its own CSS to layout: tokens only, no colour literals, zero radius', () => {
    const css = existsSync(join(page.dir, 'site.css'))
      ? readFileSync(join(page.dir, 'site.css'), 'utf8')
      : ''
    const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '')
    expect(stripped).not.toMatch(/#[0-9a-f]{3,8}\b/i)
    expect(stripped).not.toMatch(/\b(rgba?|hsla?|oklch|oklab)\(/i)
    expect(stripped).not.toMatch(/border-radius/)
    expect(stripped).not.toMatch(/@import|url\(\s*['"]?https?:/)
    for (const style of doc.querySelectorAll('style')) {
      expect(style.textContent, 'no inline <style> blocks — use site.css').toBe('')
    }
  })
})

describe('inspirations: build helpers', () => {
  it('vendorFiles follows the vanilla module graph from a dist folder', () => {
    const dist = mkdtempSync(join(tmpdir(), 'dssoca-dist-'))
    mkdirSync(join(dist, 'vanilla'))
    writeFileSync(join(dist, 'theme.css'), '')
    writeFileSync(join(dist, 'vanilla.css'), '')
    writeFileSync(
      join(dist, 'vanilla/index.js'),
      "import { a } from './menu.js'\nexport * from '../config.js'\n",
    )
    writeFileSync(join(dist, 'vanilla/menu.js'), "import '../icons.js'\nexport const a = 1\n")
    writeFileSync(join(dist, 'config.js'), "import { x } from './dssoca.config.js'\n")
    writeFileSync(join(dist, 'dssoca.config.js'), 'export const x = 1\n')
    writeFileSync(join(dist, 'icons.js'), '')
    expect(vendorFiles(dist)).toEqual([
      'config.js',
      'dssoca.config.js',
      'icons.js',
      'theme.css',
      'vanilla.css',
      'vanilla/index.js',
      'vanilla/menu.js',
    ])
  })

  it('relocateFontUrls points theme.css fallback fonts at the vendored copy', () => {
    expect(relocateFontUrls("src: url('/fonts/Caskaydia-Cove-Mono.ttf') format('truetype');")).toBe(
      "src: url('fonts/Caskaydia-Cove-Mono.ttf') format('truetype');",
    )
    expect(relocateFontUrls('url("/fonts/a.ttf") url(/fonts/b.ttf) url(/other/c.png)')).toBe(
      'url("fonts/a.ttf") url(fonts/b.ttf) url(/other/c.png)',
    )
    expect(relocateFontUrls('https://fonts.googleapis.com/css2?family=X')).toBe(
      'https://fonts.googleapis.com/css2?family=X',
    )
  })

  it('the screenshot script never blocks its own server (async child processes only)', () => {
    // The server lives in the script's process; a synchronous child would starve the event loop
    // and the browser's first request would never be answered (the first Pages run hung).
    const src = readFileSync(resolve(process.cwd(), 'scripts/screenshot-inspirations.mjs'), 'utf8')
    expect(src).not.toMatch(/execFileSync|execSync|spawnSync/)
    expect(src).toMatch(/timeout:\s*\d/)
  })

  it('vendorFiles fails loudly when dist is incomplete', () => {
    const dist = mkdtempSync(join(tmpdir(), 'dssoca-dist-'))
    expect(() => vendorFiles(dist)).toThrow(/pnpm pack/)
  })

  describe('static server', () => {
    const root = mkdtempSync(join(tmpdir(), 'dssoca-site-'))
    let server: Awaited<ReturnType<typeof startServer>>
    beforeAll(async () => {
      mkdirSync(join(root, 'a'))
      writeFileSync(join(root, 'a/index.html'), '<!doctype html><title>a</title>')
      writeFileSync(join(root, 'm.js'), 'export {}')
      server = await startServer(0, root)
    })
    afterAll(() => server.close())

    it('serves directory index files and module scripts with the right types', async () => {
      const page = await fetch(`${server.url}a/`)
      expect(page.status).toBe(200)
      expect(page.headers.get('content-type')).toContain('text/html')
      const js = await fetch(`${server.url}m.js`)
      expect(js.headers.get('content-type')).toContain('text/javascript')
    })

    it('redirects a bare folder URL to the trailing-slash form (as GitHub Pages does)', async () => {
      const res = await fetch(`${server.url}a`, { redirect: 'manual' })
      expect(res.status).toBe(301)
      expect(res.headers.get('location')).toBe('/a/')
    })

    it('404s for missing files and never escapes the root', () => {
      expect(fileAt(root, '/nope.html')).toBeNull()
      expect(fileAt(root, '/../../etc/passwd')).toBeNull()
    })
  })
})
