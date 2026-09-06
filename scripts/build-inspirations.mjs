#!/usr/bin/env node
/**
 * Assemble the Inspirations site (DS-0150) into `inspirations-dist/`: the pages under
 * `inspirations/` plus a vendored copy of the dssoca files they link (`vendor/theme.css`,
 * `vendor/vanilla.css`, `vendor/vanilla/index.js` and its imports) taken from `dist/` — so the
 * examples always track the current source, never a published version. Needs `dist/`
 * (`pnpm pack`, or `svelte-package && pnpm build:css && pnpm build:vanilla`). Zero deps.
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join } from 'node:path'
import {
  DIST_DIR,
  INSPIRATIONS_DIR,
  OUT_DIR,
  STATIC_FONTS_DIR,
  VENDOR,
  listInspirations,
  relocateFontUrls,
  vendorFiles,
} from './lib/inspirations.mjs'

if (!existsSync(join(DIST_DIR, 'vanilla.css'))) {
  console.error('build-inspirations: dist/vanilla.css not found — run `pnpm pack` first')
  process.exit(1)
}

rmSync(OUT_DIR, { recursive: true, force: true })
mkdirSync(OUT_DIR, { recursive: true })
cpSync(INSPIRATIONS_DIR, OUT_DIR, { recursive: true })

const files = vendorFiles()
for (const rel of files) {
  const to = join(OUT_DIR, VENDOR, rel)
  mkdirSync(dirname(to), { recursive: true })
  cpSync(join(DIST_DIR, rel), to)
}

// Local fallback fonts referenced by theme.css (`/fonts/…` → `vendor/fonts/…`, see helper).
const themeCss = join(OUT_DIR, VENDOR, 'theme.css')
writeFileSync(themeCss, relocateFontUrls(readFileSync(themeCss, 'utf8')))
if (existsSync(STATIC_FONTS_DIR)) {
  mkdirSync(join(OUT_DIR, VENDOR, 'fonts'), { recursive: true })
  for (const f of readdirSync(STATIC_FONTS_DIR).filter((f) => /\.(ttf|otf|woff2?)$/.test(f))) {
    cpSync(join(STATIC_FONTS_DIR, f), join(OUT_DIR, VENDOR, 'fonts', f))
  }
}

const slugs = listInspirations()
console.log(
  `inspirations: ${slugs.length} sites (${slugs.join(', ')}) + ${files.length} vendored dssoca files → inspirations-dist/`,
)
