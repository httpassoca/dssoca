#!/usr/bin/env node
/**
 * Tiny static server for `inspirations-dist/` (DS-0150) — mirrors GitHub Pages closely enough
 * for local previews and the screenshot step: directory URLs serve `index.html`, a bare
 * `/slug` redirects to `/slug/` (so relative links resolve the same way as on Pages), and ES
 * modules get `text/javascript`. Zero deps. `PORT` env (default 4380).
 *
 *   pnpm build:inspirations && node scripts/serve-inspirations.mjs
 */
import { createServer } from 'node:http'
import { createReadStream, statSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'
import { OUT_DIR } from './lib/inspirations.mjs'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain; charset=utf-8',
}

/** Resolve a URL path inside `root`: a file path, 'redirect' (dir without slash) or null. */
export function fileAt(root, urlPath) {
  const clean = normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, '')
  const abs = join(root, clean)
  if (!abs.startsWith(root)) return null
  try {
    const st = statSync(abs)
    if (st.isDirectory()) {
      return urlPath.endsWith('/') ? fileAt(root, urlPath + 'index.html') : 'redirect'
    }
    return abs
  } catch {
    return null
  }
}

/** Start the server; resolves with `{ port, url, close() }`. */
export function startServer(port = Number(process.env.PORT) || 4380, root = OUT_DIR) {
  const server = createServer((req, res) => {
    const urlPath = new URL(req.url ?? '/', 'http://x').pathname
    const hit = fileAt(root, urlPath)
    if (hit === 'redirect') {
      res.writeHead(301, { Location: urlPath + '/' })
      return res.end()
    }
    if (!hit) {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      return res.end('not found')
    }
    res.writeHead(200, { 'Content-Type': MIME[extname(hit)] ?? 'application/octet-stream' })
    createReadStream(hit).pipe(res)
  })
  return new Promise((resolveStart, reject) => {
    server.once('error', reject)
    server.listen(port, '127.0.0.1', () => {
      const actual = server.address().port
      const url = `http://127.0.0.1:${actual}/`
      resolveStart({ port: actual, url, root, close: () => new Promise((r) => server.close(r)) })
    })
  })
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))
if (isMain) {
  const { url } = await startServer()
  console.log(`inspirations: serving inspirations-dist/ at ${url}`)
}
