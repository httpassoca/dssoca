import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  compareVersions,
  componentsIn,
  deriveComponentReleases,
  extractRefs,
  parseChangelog,
  refUrl,
  releaseId,
  renderInline,
} from '../src/lib/changelog'
import {
  BACKFILLED_RELEASES,
  BACKFILLED_THROUGH,
  COMPONENT_HISTORY,
  componentChangelog,
} from '../src/lib/component-changelog'
import { COMPONENTS, NAV } from '../src/lib/docs.config'

// DS-0196 — the docs changelog. `pnpm docs:test` runs with cwd = documentation/.
const read = (p: string) => readFileSync(resolve(process.cwd(), p), 'utf8')
const NAMES = COMPONENTS.map((c) => c.name)

const SAMPLE = `# Changelog

Preamble with a [link](https://example.com).

## [Unreleased]

### Fixed

- **\`Switch\`** (\`DS-9001\`): pending fix
  on two lines.

## [1.2.0] — Big one — 2026-03-03

Intro paragraph
wrapped.

### Added

- **\`Card\` \`external\` prop** (\`DS-0158\`) — composes \`Modal\` in passing ([#12](https://github.com/httpassoca/dssoca/pull/12)).
- **Focus rings** — \`Switch\`, \`Input\` (clear button) and \`Menu\`.
- **BREAKING — \`Table\`**: renders \`data-align\`.

### Docs

- \`Switch\` page rewritten.

## [1.1.0] — 2026-02-02

### Changed

- **\`Switch\`**: old change.

## [0.4.x] — accessibility — 2026-01-01

### Added

- **\`Switch\`**: untagged.

[1.2.0]: https://github.com/httpassoca/dssoca/compare/v1.1.0...v1.2.0
`

describe('parseChangelog', () => {
  const releases = parseChangelog(SAMPLE)

  it('reads version, title, date, anchor id and compare link per release', () => {
    expect(releases.map((r) => r.version)).toEqual(['Unreleased', '1.2.0', '1.1.0', '0.4.x'])
    expect(releases[1]).toMatchObject({
      id: 'v1.2.0',
      semver: true,
      title: 'Big one',
      date: '2026-03-03',
      url: 'https://github.com/httpassoca/dssoca/compare/v1.1.0...v1.2.0',
      intro: ['Intro paragraph wrapped.'],
    })
    expect(releases[2]).toMatchObject({ title: undefined, date: '2026-02-02', url: undefined })
    expect(releases[0]).toMatchObject({ id: 'unreleased', semver: false, date: undefined })
    expect(releases[3]).toMatchObject({ id: '0.4.x', semver: false, title: 'accessibility' })
  })

  it('splits sections and joins wrapped bullets', () => {
    expect(releases[0].sections[0]).toMatchObject({
      heading: 'Fixed',
      type: 'fixed',
      items: ['**`Switch`** (`DS-9001`): pending fix on two lines.'],
    })
    expect(releases[1].sections.map((s) => [s.heading, s.type, s.items.length])).toEqual([
      ['Added', 'added', 3],
      ['Docs', undefined, 1],
    ])
  })

  it('parses the real CHANGELOG.md: every release has an id, sections and content', () => {
    const real = parseChangelog(read('../CHANGELOG.md'))
    expect(real.length).toBeGreaterThan(20)
    expect(new Set(real.map((r) => r.id)).size).toBe(real.length)
    for (const r of real) {
      expect(r.id, r.version).toMatch(/^[a-z0-9.-]+$/)
      const blocks = r.intro.length + r.sections.reduce((n, s) => n + s.items.length, 0)
      expect(blocks, `${r.version} has content`).toBeGreaterThan(0)
      for (const s of r.sections) {
        expect(s.items.length + s.paragraphs.length, `${r.version} › ${s.heading}`).toBeGreaterThan(
          0,
        )
      }
    }
    const v20 = real.find((r) => r.version === '0.20.0')!
    expect(v20).toMatchObject({ date: '2026-11-13', title: 'Accessibility & quality audit' })
    expect(v20.url).toContain('/compare/v0.19.0...v0.20.0')
    // Tagged semver releases stay in descending order.
    const semver = real.filter((r) => r.semver).map((r) => r.version)
    expect([...semver].sort((a, b) => compareVersions(b, a))).toEqual(semver)
  })
})

describe('renderInline', () => {
  it('renders code, bold, emphasis and links, and escapes everything else', () => {
    expect(renderInline('**`Card`** is _new_ — see [#12](https://x.dev/12) & <b>')).toBe(
      '<strong><code>Card</code></strong> is <em>new</em> — see ' +
        '<a href="https://x.dev/12" target="_blank" rel="noopener noreferrer">#12</a> &amp; &lt;b&gt;',
    )
    expect(renderInline('`<Modal a="**x**">`')).toBe(
      '<code>&lt;Modal a=&quot;**x**&quot;&gt;</code>',
    )
    expect(renderInline('[docs](/changelog) and [bad](javascript:alert(1))')).toBe(
      '<a href="/changelog">docs</a> and [bad](javascript:alert(1))',
    )
    expect(renderInline('snake_case_name stays, 2 * 3 * 4 stays')).toBe(
      'snake_case_name stays, 2 * 3 * 4 stays',
    )
  })

  it('renders every bullet of the real changelog and of the backfill without raw markup', () => {
    const texts = [
      ...parseChangelog(read('../CHANGELOG.md')).flatMap((r) => [
        ...r.intro,
        ...r.sections.flatMap((s) => [...s.paragraphs, ...s.items]),
      ]),
      ...Object.values(COMPONENT_HISTORY).flatMap((h) =>
        h.releases.flatMap((r) => r.changes.map((c) => c.text)),
      ),
    ]
    for (const t of texts) {
      const html = renderInline(t)
      expect(html.includes('\u0000'), t).toBe(false)
      // Only the tags the renderer emits.
      expect(html.replace(/<\/?(code|strong|em|a)\b[^>]*>/g, ''), t).not.toMatch(/[<>]/)
    }
  })
})

describe('refs', () => {
  it('extracts agile ids and GitHub numbers, linking only the latter', () => {
    expect(
      extractRefs('(`DS-0171`, `DS-0171`) fixes [#139](https://x/issues/139) not a#b#1'),
    ).toEqual(['DS-0171', '#139'])
    expect(refUrl('#140')).toBe('https://github.com/httpassoca/dssoca/issues/140')
    expect(refUrl('DS-0171')).toBeUndefined()
    expect(releaseId('0.20.0')).toBe('v0.20.0')
    expect(releaseId('Unreleased — earlier')).toBe('unreleased-earlier')
  })
})

describe('component changes derived from the changelog', () => {
  const releases = parseChangelog(SAMPLE)

  it('a bold lead naming components wins over mentions in the body', () => {
    const [card, focus, table] = releases[1].sections[0].items
    expect(componentsIn(card, NAMES)).toEqual(['Card'])
    expect(componentsIn(focus, NAMES).sort()).toEqual(['Input', 'Menu', 'Switch'])
    expect(componentsIn(table, NAMES)).toEqual(['Table'])
    // `Card` never matches inside `ServiceCard`.
    expect(componentsIn('**`ServiceCard`**: x', NAMES)).toEqual(['ServiceCard'])
    expect(componentsIn('uses `<Modal>` and `Table.svelte`', NAMES).sort()).toEqual([
      'Modal',
      'Table',
    ])
  })

  it('collects change sections only, per release, with type / breaking / refs', () => {
    const sw = deriveComponentReleases(releases, 'Switch', NAMES)
    // Unreleased + tagged releases; the Docs bullet and the untagged 0.4.x are skipped.
    expect(sw.map((r) => [r.version, r.changes.map((c) => c.type)])).toEqual([
      ['Unreleased', ['fixed']],
      ['1.2.0', ['added']],
      ['1.1.0', ['changed']],
    ])
    expect(sw[0].changes[0].refs).toEqual(['DS-9001'])
    const table = deriveComponentReleases(releases, 'Table', NAMES)
    expect(table[0].changes[0]).toMatchObject({ type: 'added', breaking: true })
    const card = deriveComponentReleases(releases, 'Card', NAMES)
    expect(card[0].changes[0].refs).toEqual(['DS-0158', '#12'])
    expect(deriveComponentReleases(releases, 'Modal', NAMES)).toEqual([])
  })

  it('`after` keeps only newer releases (and Unreleased)', () => {
    expect(
      deriveComponentReleases(releases, 'Switch', NAMES, '1.1.0').map((r) => r.version),
    ).toEqual(['Unreleased', '1.2.0'])
  })
})

describe('component history backfill', () => {
  const TYPES = ['added', 'changed', 'fixed', 'removed', 'deprecated']
  const files = readdirSync(resolve(process.cwd(), 'src/lib/component-changelog')).filter((f) =>
    f.endsWith('.json'),
  )

  it('has one file per documented component, matching slug and name', () => {
    expect(files.map((f) => f.replace('.json', '')).sort()).toEqual(
      Object.keys(COMPONENT_HISTORY).sort(),
    )
    for (const [slug, file] of Object.entries(COMPONENT_HISTORY)) {
      const doc = COMPONENTS.find((c) => c.slug === slug)
      expect(doc, `${slug}.json has no component doc`).toBeDefined()
      expect(file.component, slug).toBe(doc!.name)
    }
  })

  it('every entry is well-formed: known release, newest first, typed, non-empty', () => {
    for (const [slug, file] of Object.entries(COMPONENT_HISTORY)) {
      const versions = file.releases.map((r) => r.version)
      expect(versions.length, slug).toBeGreaterThan(0)
      expect(new Set(versions).size, `${slug}: duplicate release`).toBe(versions.length)
      expect(
        [...versions].sort((a, b) => compareVersions(b, a)),
        `${slug}: order`,
      ).toEqual(versions)
      for (const r of file.releases) {
        expect(BACKFILLED_RELEASES[r.version], `${slug}: ${r.version}`).toBeDefined()
        expect(compareVersions(r.version, BACKFILLED_THROUGH)).toBeLessThanOrEqual(0)
        expect(r.changes.length, `${slug} ${r.version}`).toBeGreaterThan(0)
        for (const c of r.changes) {
          expect(TYPES, `${slug} ${r.version}`).toContain(c.type)
          expect(c.text.trim().length, `${slug} ${r.version}`).toBeGreaterThan(10)
          expect(c.text, `${slug} ${r.version}: single line`).not.toMatch(/\n/)
          for (const ref of c.refs ?? []) expect(ref, slug).toMatch(/^(DS-\d{4}|#\d+)$/)
          if ('breaking' in c) expect(c.breaking).toBe(true)
        }
      }
      // The oldest release is the one that introduced the component.
      expect(
        file.releases.at(-1)!.changes.some((c) => c.type === 'added'),
        `${slug}: origin`,
      ).toBe(true)
    }
  })

  it('merges derived releases (after the backfill) on top of the backfilled history', () => {
    const doc = COMPONENTS.find((c) => c.name === 'Switch')!
    const future = parseChangelog(
      `## [Unreleased]\n\n### Fixed\n\n- **\`Switch\`**: pending.\n\n## [0.21.0] — 2027-01-01\n\n### Added\n\n- **\`Switch\`**: later.\n\n## [0.20.0] — 2026-11-13\n\n### Fixed\n\n- **\`Switch\`**: must come from the backfill, not from here.\n`,
    )
    const merged = componentChangelog(doc, future, NAMES)
    expect(merged.slice(0, 3).map((r) => r.version)).toEqual(['Unreleased', '0.21.0', '0.20.0'])
    expect(merged[2].changes.map((c) => c.text).join(' ')).not.toContain('must come from')
    expect(merged[2].date).toBe('2026-11-13')
    expect(merged.at(-1)!.version).toBe(COMPONENT_HISTORY.switch.releases.at(-1)!.version)
    // A component with no backfill file derives its whole history.
    const fresh = componentChangelog({ name: 'Switch', slug: 'not-backfilled' }, future, NAMES)
    expect(fresh.map((r) => r.version)).toEqual(['Unreleased', '0.21.0', '0.20.0'])
  })
})

describe('docs wiring', () => {
  it('the nav lists /changelog and the pages render the data', () => {
    expect(NAV.flatMap((g) => g.items).some((i) => i.href === '/changelog')).toBe(true)
    expect(read('src/routes/changelog/+page.server.ts')).toContain('releaseViews()')
    expect(read('src/routes/components/[slug]/+page.server.ts')).toContain(
      'componentChangelogView(doc)',
    )
    expect(read('src/lib/components/ComponentPage.svelte')).toMatch(/<ComponentChangelog\b/)
  })

  it('the shell and the landing link the GitHub repository by name', () => {
    for (const f of ['src/routes/+layout.svelte', 'src/routes/+page.svelte']) {
      const s = read(f)
      expect(s, f).toContain('href={GITHUB_URL}')
      expect(s, f).toContain('<Icon name="github"')
      expect(s, f).toMatch(/>GitHub</)
    }
  })
})
