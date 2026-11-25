/**
 * Changelog model for the docs site (DS-0196).
 *
 * ONE source: the repo-root `CHANGELOG.md` (Keep a Changelog). This module parses it into
 * releases → sections → bullets, renders the inline Markdown it uses, and derives each
 * component's own history from the bullets that name it — so a release note written once shows
 * up on `/changelog` AND at the end of every component page it mentions, with no extra step.
 *
 * Pure and DOM-free (strings in, data out): the server loads and the node-only test suite both
 * import it.
 */

export const REPO_URL = 'https://github.com/httpassoca/dssoca'

export type ChangeType = 'added' | 'changed' | 'fixed' | 'removed' | 'deprecated'

/** Section headings that describe a change to the published library. */
const SECTION_TYPES: Record<string, ChangeType> = {
  added: 'added',
  changed: 'changed',
  fixed: 'fixed',
  removed: 'removed',
  deprecated: 'deprecated',
  security: 'fixed',
}

export interface ChangelogSection {
  /** The `###` heading as written ("Added", "Docs", …). */
  heading: string
  /** Set for the Keep-a-Changelog change sections; undefined for Docs / Tests / Chores / …. */
  type?: ChangeType
  /** Paragraphs between the heading and the first bullet (Markdown). */
  paragraphs: string[]
  /** One Markdown string per bullet (continuation lines joined with a space). */
  items: string[]
}

export interface ChangelogRelease {
  /** The text inside the brackets: `0.20.0`, `Unreleased`, `0.4.x`, … */
  version: string
  /** Anchor id on `/changelog` (`v0.20.0`, `unreleased`). */
  id: string
  /** True when `version` is a plain `x.y.z`. */
  semver: boolean
  title?: string
  /** ISO date (`YYYY-MM-DD`). */
  date?: string
  /** Paragraphs between the `##` heading and the first `###` (Markdown). */
  intro: string[]
  sections: ChangelogSection[]
  /** From the link-reference block at the end of the file (`[0.20.0]: …compare/…`). */
  url?: string
}

const SEMVER = /^\d+\.\d+\.\d+$/
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export function releaseId(version: string): string {
  return SEMVER.test(version)
    ? `v${version}`
    : version
        .toLowerCase()
        .replace(/[^a-z0-9.]+/g, '-')
        .replace(/^-|-$/g, '')
}

/** `a` newer than `b` → positive. Only meaningful for plain `x.y.z` strings. */
export function compareVersions(a: string, b: string): number {
  const [x, y] = [a, b].map((v) => v.split('.').map(Number))
  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]
}

/** Parse a Keep-a-Changelog file. Releases come back in file order (newest first). */
export function parseChangelog(md: string): ChangelogRelease[] {
  const releases: ChangelogRelease[] = []
  const links = new Map<string, string>()
  let release: ChangelogRelease | undefined
  let section: ChangelogSection | undefined
  // The block being accumulated: a bullet or a paragraph, closed by a blank line / new block.
  let block: { kind: 'li' | 'p'; lines: string[] } | undefined

  const flush = () => {
    if (!block || !release) return void (block = undefined)
    const text = block.lines.join(' ').replace(/\s+/g, ' ').trim()
    if (text) {
      if (block.kind === 'li' && section) section.items.push(text)
      else if (section) section.paragraphs.push(text)
      else release.intro.push(text)
    }
    block = undefined
  }

  for (const raw of md.split(/\r?\n/)) {
    const line = raw.trimEnd()
    const ref = line.match(/^\[([^\]]+)\]:\s*(\S+)\s*$/)
    if (ref) {
      flush()
      links.set(ref[1], ref[2])
      continue
    }
    const h2 = line.match(/^## \[([^\]]+)\](.*)$/)
    if (h2) {
      flush()
      const parts = h2[2]
        .split(' — ')
        .map((p) => p.trim())
        .filter(Boolean)
      const date = parts.length && ISO_DATE.test(parts[parts.length - 1]) ? parts.pop() : undefined
      release = {
        version: h2[1],
        id: releaseId(h2[1]),
        semver: SEMVER.test(h2[1]),
        title: parts.join(' — ') || undefined,
        date,
        intro: [],
        sections: [],
      }
      section = undefined
      releases.push(release)
      continue
    }
    if (!release) continue // preamble above the first release
    const h3 = line.match(/^### (.+)$/)
    if (h3) {
      flush()
      const heading = h3[1].trim()
      section = { heading, type: SECTION_TYPES[heading.toLowerCase()], paragraphs: [], items: [] }
      release.sections.push(section)
      continue
    }
    if (!line.trim()) {
      flush()
      continue
    }
    const li = line.match(/^[-*] (.*)$/)
    if (li) {
      flush()
      block = { kind: 'li', lines: [li[1]] }
    } else if (block) {
      block.lines.push(line.trim())
    } else {
      block = { kind: 'p', lines: [line.trim()] }
    }
  }
  flush()

  for (const r of releases) r.url = links.get(r.version)
  return releases
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * Render the inline Markdown the changelog uses — `` `code` ``, `**bold**`, `_em_` / `*em*` and
 * `[label](url)` — to HTML. Everything else is escaped, and only `http(s)`, root-relative and
 * `#` links become anchors, so the result is safe to drop into `{@html}`.
 */
export function renderInline(md: string): string {
  const codes: string[] = []
  // Code spans first: their content is literal (no bold/links inside).
  let s = md.replace(/`([^`]+)`/g, (_, c: string) => {
    codes.push(`<code>${escapeHtml(c)}</code>`)
    return `\u0000${codes.length - 1}\u0000`
  })
  s = escapeHtml(s)
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label: string, url: string) => {
    if (!/^(https?:\/\/|\/|#)/.test(url)) return m
    const ext = /^https?:\/\//.test(url)
    return `<a href="${url}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>${label}</a>`
  })
  s = s.replace(/\*\*([^*]+(?:\*(?!\*)[^*]*)*)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/(^|[\s(])\*([^*\s][^*]*)\*(?=$|[\s).,;:!?])/g, '$1<em>$2</em>')
  s = s.replace(/(^|[\s(])_([^_\s][^_]*)_(?=$|[\s).,;:!?])/g, '$1<em>$2</em>')
  // eslint-disable-next-line no-control-regex
  return s.replace(/\u0000(\d+)\u0000/g, (_, i: string) => codes[Number(i)])
}

/** Agile ids (`DS-0171`) and GitHub numbers (`#140`) named in a bullet, in order, de-duplicated. */
export function extractRefs(md: string): string[] {
  return [...new Set(md.match(/\bDS-\d{4}\b|(?<![\w/&])#\d+\b/g) ?? [])]
}

/** Link for a ref: GitHub numbers resolve (issues redirect to pulls); agile ids have no URL. */
export function refUrl(ref: string): string | undefined {
  return ref.startsWith('#') ? `${REPO_URL}/issues/${ref.slice(1)}` : undefined
}

// ── per-component history ───────────────────────────────────────────────────

export interface ComponentChange {
  type: ChangeType
  /** Inline Markdown. */
  text: string
  breaking?: boolean
  refs?: string[]
}

export interface ComponentRelease {
  version: string
  date?: string
  changes: ComponentChange[]
}

/**
 * Which components a bullet is about. A component is named by its exported name in backticks
 * (`` `Switch` ``, `` `<Modal>` ``, `` `Card.svelte` ``).
 *
 * If the bullet opens with a bold lead (`- **`Card`** …`, `- **BREAKING — `Table`** …`) and the
 * lead names components, ONLY those count: the body often mentions others in passing ("composes
 * `Modal`"). A lead without a component name (`- **Focus rings** — `Switch`, `Input` …`) is a
 * topic, so every component named in the body counts.
 */
export function componentsIn(item: string, names: readonly string[]): string[] {
  const named = (text: string) =>
    names.filter((n) => new RegExp('`<?' + n + '(?![\\w-])[^`]*`').test(text))
  const lead = item.match(/^\*\*(.+?)\*\*(?!\*)/)
  if (lead) {
    const inLead = named(lead[1])
    if (inLead.length) return inLead
  }
  return named(item)
}

/**
 * A component's history derived from the parsed changelog: every bullet in a change section
 * (Added / Changed / Fixed / Removed / Deprecated) that names it — see {@link componentsIn}.
 * `after` limits it to releases newer than that version (plus `Unreleased`).
 */
export function deriveComponentReleases(
  releases: readonly ChangelogRelease[],
  name: string,
  names: readonly string[],
  after?: string,
): ComponentRelease[] {
  const out: ComponentRelease[] = []
  for (const r of releases) {
    const unreleased = /^unreleased$/i.test(r.version)
    if (!unreleased && !r.semver) continue
    if (after && r.semver && compareVersions(r.version, after) <= 0) continue
    const changes: ComponentChange[] = []
    for (const s of r.sections) {
      if (!s.type) continue
      for (const item of s.items) {
        if (!componentsIn(item, names).includes(name)) continue
        const refs = extractRefs(item)
        changes.push({
          type: s.type,
          text: item,
          ...(/\bBREAKING\b/.test(item) ? { breaking: true } : {}),
          ...(refs.length ? { refs } : {}),
        })
      }
    }
    if (changes.length) out.push({ version: r.version, date: r.date, changes })
  }
  return out
}
