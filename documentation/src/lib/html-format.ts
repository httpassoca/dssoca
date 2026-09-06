/**
 * Minimal, dependency-free HTML pretty-printer for the generated plain-HTML snippets
 * (DS-0148). One element per line, two-space indentation; an element whose content is only
 * text stays on a single line. Good enough for copy-paste snippets — not a general formatter.
 */

const VOID = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
  // SVG leaves that Svelte renders self-closed.
  'path',
  'rect',
  'circle',
  'line',
  'polyline',
  'polygon',
  'ellipse',
  'use',
])

type Tok = { kind: 'open' | 'close' | 'void' | 'text'; raw: string; name?: string }

function tokenize(html: string): Tok[] {
  const out: Tok[] = []
  const re = /<\/?[a-zA-Z][^>]*>|[^<]+/g
  for (const m of html.matchAll(re)) {
    const raw = m[0]
    if (raw.startsWith('</')) {
      out.push({ kind: 'close', raw, name: raw.slice(2, -1).trim().toLowerCase() })
    } else if (raw.startsWith('<')) {
      const name = /^<([a-zA-Z][\w-]*)/.exec(raw)![1].toLowerCase()
      const selfClosed = raw.endsWith('/>') || VOID.has(name)
      out.push({ kind: selfClosed ? 'void' : 'open', raw, name })
    } else {
      const text = raw.replace(/\s+/g, ' ').trim()
      if (text) out.push({ kind: 'text', raw: text })
    }
  }
  return out
}

export function formatHtml(html: string): string {
  const toks = tokenize(html)
  const lines: string[] = []
  let depth = 0
  const pad = () => '  '.repeat(Math.max(0, depth))
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i]
    if (t.kind === 'open') {
      const next = toks[i + 1]
      const after = toks[i + 2]
      if (next?.kind === 'close' && next.name === t.name) {
        lines.push(pad() + t.raw + next.raw)
        i += 1
        continue
      }
      if (next?.kind === 'text' && after?.kind === 'close' && after.name === t.name) {
        lines.push(pad() + t.raw + next.raw + after.raw)
        i += 2
        continue
      }
      lines.push(pad() + t.raw)
      depth++
    } else if (t.kind === 'close') {
      depth--
      lines.push(pad() + t.raw)
    } else {
      lines.push(pad() + t.raw)
    }
  }
  return lines.join('\n')
}
