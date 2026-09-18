/**
 * Shared helpers for the Inspirations site (DS-0150) — the example websites under
 * `inspirations/`, built on the plain-HTML path (`dssoca/vanilla.css` + `dssoca/vanilla.js`).
 * Used by the build/serve/screenshot scripts and the vitest guard; zero dependencies.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

export const INSPIRATIONS_DIR = resolve(process.cwd(), 'inspirations')
export const OUT_DIR = resolve(process.cwd(), 'inspirations-dist')
export const DIST_DIR = resolve(process.cwd(), 'dist')
export const STATIC_FONTS_DIR = resolve(process.cwd(), 'static/fonts')
/** Folder inside the built site that carries the vendored dssoca files (dist layout preserved). */
export const VENDOR = 'vendor'

/**
 * The one source of truth for the gallery cards (DS-0158): `inspirations/manifest.json`. The
 * Pages gallery renders its cards from it at build time (`renderGallery`) and the docs site's
 * `/inspirations` page imports it directly, so a site's title, kind, blurb and component chips
 * are written exactly once. Adding a site = a new folder + one entry here.
 */
export const MANIFEST_FILE = join(INSPIRATIONS_DIR, 'manifest.json')

/** Where the gallery's `index.html` expects its cards; replaced at build time. */
export const GALLERY_MARKER = '<!-- inspirations:cards -->'

/**
 * Read and validate the manifest. Throws on a malformed entry or a duplicate slug so a typo
 * fails the build (and the vitest guard) instead of rendering a broken card.
 * @returns {Array<{ slug: string, title: string, kind: string, blurb: string, components: string[] }>}
 */
export function loadManifest(file = MANIFEST_FILE) {
  const entries = JSON.parse(readFileSync(file, 'utf8'))
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error('inspirations: manifest.json must be a non-empty array')
  }
  const seen = new Set()
  for (const e of entries) {
    for (const key of ['slug', 'title', 'kind', 'blurb']) {
      if (typeof e[key] !== 'string' || !e[key].trim()) {
        throw new Error(`inspirations: manifest entry "${e.slug ?? '?'}" is missing "${key}"`)
      }
    }
    if (!/^[a-z][a-z0-9-]*$/.test(e.slug)) throw new Error(`inspirations: bad slug "${e.slug}"`)
    if (seen.has(e.slug)) throw new Error(`inspirations: duplicate slug "${e.slug}"`)
    seen.add(e.slug)
    if (!Array.isArray(e.components) || e.components.some((c) => typeof c !== 'string' || !c)) {
      throw new Error(`inspirations: manifest entry "${e.slug}" needs a components: string[]`)
    }
  }
  return entries
}

/** The thumbnail's alt text, derived so it can't drift from the title. */
export function thumbAlt(entry) {
  return `Screenshot of the ${entry.title.toLowerCase()} example`
}

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/**
 * One gallery card as plain HTML on the vanilla contract — the exact DOM the Svelte `Card`
 * renders (`media` / `head` / `body` / `overlay`, `external` link), with the thumbnail +
 * placeholder pair the gallery's `site.js` swaps on a missing screenshot.
 */
export function renderGalleryCard(entry) {
  const id = `insp-${entry.slug}`
  const chips = entry.components
    .map((c) => `                <span class="ss-badge neutral">${escapeHtml(c)}</span>`)
    .join('\n')
  return `        <li>
          <div class="ss-card interactive" aria-labelledby="${id}">
            <div class="media">
              <div class="insp-thumb">
                <img
                  src="./thumbs/${entry.slug}.png"
                  alt="${escapeHtml(thumbAlt(entry))}"
                  loading="lazy"
                  width="1280"
                  height="800"
                />
                <span class="placeholder" aria-hidden="true">${escapeHtml(entry.slug)}</span>
              </div>
            </div>
            <div class="head">
              <div class="heading">
                <div class="title" id="${id}" role="heading" aria-level="2">${escapeHtml(entry.title)}</div>
                <div class="desc">${escapeHtml(entry.kind)}</div>
              </div>
              <div class="actions">
                <div class="meta">↗</div>
              </div>
            </div>
            <div class="body">
              <p>${escapeHtml(entry.blurb)}</p>
              <div class="insp-chips">
${chips}
              </div>
            </div>
            <a
              class="overlay"
              href="./${entry.slug}/"
              target="_blank"
              rel="noopener noreferrer"
              data-inspiration="${entry.slug}"
              aria-labelledby="${id}"
            >
              <span class="sr-only">${escapeHtml(entry.title)} (opens in a new tab)</span>
            </a>
          </div>
        </li>`
}

/** Fill the gallery template's card marker from the manifest. Throws when the marker is absent. */
export function renderGallery(html, manifest) {
  if (!html.includes(GALLERY_MARKER)) {
    throw new Error(`inspirations: gallery index.html has no ${GALLERY_MARKER} marker`)
  }
  return html.replace(GALLERY_MARKER, manifest.map(renderGalleryCard).join('\n').trimStart())
}

/** Slugs of every example site: the sub-folders of `inspirations/` that carry an index.html. */
export function listInspirations(root = INSPIRATIONS_DIR) {
  return readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(root, d.name, 'index.html')))
    .map((d) => d.name)
    .sort()
}

/**
 * The dssoca files an example page needs, relative to `dist/`: the two stylesheets, the
 * vanilla module and — transitively — every relative import it reaches, so the module graph
 * resolves from the vendored copy exactly as it does from `node_modules/dssoca/dist`.
 */
export function vendorFiles(dist = DIST_DIR) {
  const files = new Set()
  for (const css of ['theme.css', 'vanilla.css']) {
    if (!existsSync(join(dist, css))) {
      throw new Error(`inspirations: missing ${join(dist, css)} — run \`pnpm pack\` first`)
    }
    files.add(css)
  }
  const queue = ['vanilla/index.js']
  while (queue.length) {
    const rel = queue.shift()
    if (files.has(rel)) continue
    files.add(rel)
    const abs = join(dist, rel)
    if (!existsSync(abs)) throw new Error(`inspirations: missing ${abs} — run \`pnpm pack\` first`)
    const src = readFileSync(abs, 'utf8')
    for (const m of src.matchAll(/from\s+['"](\.{1,2}\/[^'"]+)['"]/g)) {
      queue.push(resolve('/' + rel, '..', m[1]).slice(1))
    }
    for (const m of src.matchAll(/import\s+['"](\.{1,2}\/[^'"]+)['"]/g)) {
      queue.push(resolve('/' + rel, '..', m[1]).slice(1))
    }
  }
  return [...files].sort()
}

/**
 * `theme.css` declares local fallback fonts at the app-absolute `/fonts/…` (the consuming app
 * copies `static/fonts/` there). Under the Pages base path (`/dssoca/`) that would 404, so the
 * vendored copy points at `fonts/` next to itself (URLs in CSS resolve relative to the sheet).
 */
export function relocateFontUrls(css) {
  return css.replace(/url\((['"]?)\/fonts\//g, 'url($1fonts/')
}
