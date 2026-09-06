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
