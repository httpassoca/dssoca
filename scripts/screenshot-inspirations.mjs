#!/usr/bin/env node
/**
 * Thumbnails for the Inspirations gallery (DS-0150): one 1280×800 PNG per example site,
 * captured from the built `inspirations-dist/` with the Playwright CLI (fetched on demand by
 * `pnpm dlx`, nothing installed in the repo) into `inspirations-dist/thumbs/<slug>.png`.
 * Runs in the Pages workflow; locally it needs a Playwright-compatible Chromium
 * (`pnpm dlx playwright@<ver> install --with-deps --only-shell chromium`). The gallery falls
 * back to a placeholder when a thumbnail is missing, so the site builds without this step.
 */
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { OUT_DIR, listInspirations } from './lib/inspirations.mjs'
import { startServer } from './serve-inspirations.mjs'

export const PLAYWRIGHT = 'playwright@1.63.0'
const VIEWPORT = '1280,800'
const SETTLE_MS = '3000' // lets the Google Fonts in theme.css (display=swap) paint

const only = process.argv.slice(2)
const slugs = only.length ? only : listInspirations()
const thumbs = join(OUT_DIR, 'thumbs')
mkdirSync(thumbs, { recursive: true })

const run = promisify(execFile)
const server = await startServer(Number(process.env.PORT) || 4381)
try {
  for (const slug of slugs) {
    const out = join(thumbs, `${slug}.png`)
    // Async on purpose: the server above lives in THIS process, so a synchronous child would
    // block the event loop and the browser's first request would never be answered (the first
    // Pages run hung on "Navigating to …/blog/" for 12 minutes). A hard timeout fails loudly.
    const { stdout, stderr } = await run(
      'pnpm',
      [
        'dlx',
        PLAYWRIGHT,
        'screenshot',
        '--viewport-size',
        VIEWPORT,
        '--wait-for-timeout',
        SETTLE_MS,
        `${server.url}${slug}/`,
        out,
      ],
      { timeout: 180_000, maxBuffer: 8 * 1024 * 1024 },
    )
    if (stderr.trim()) console.error(stderr.trim())
    if (stdout.trim()) console.log(stdout.trim())
    console.log(`inspirations: thumbs/${slug}.png`)
  }
} finally {
  await server.close()
}
