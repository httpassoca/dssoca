/**
 * Pure helpers behind `pnpm release` (DS-0077, DS-0196): turn conventional commits into a
 * Keep-a-Changelog stub and splice a release into CHANGELOG.md.
 *
 * The docs site renders CHANGELOG.md as `/changelog` and derives each component page's own
 * changelog from the bullets that name it in backticks. So a commit scoped to a component —
 * `fix(switch): …` — is drafted as "- **`Switch`**: …" and lands on the Switch page with no
 * further step.
 */

const REPO_URL = 'https://github.com/httpassoca/dssoca'

/** Conventional-commit type → changelog section, in output order. */
export const SECTIONS = [
  ['feat', 'Added'],
  ['fix', 'Fixed'],
  ['perf', 'Changed'],
  ['refactor', 'Changed'],
  ['docs', 'Docs'],
  ['test', 'Tests'],
  ['chore', 'Chores'],
]

const flat = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

/** The component a commit scope names (`switch`, `tier-list`, `tierlist`, `TierList`), if any. */
export function componentForScope(scope, names) {
  if (!scope) return undefined
  return names.find((n) => flat(n) === flat(scope))
}

/**
 * One commit subject → `{ section, text }`. A component scope becomes a bold backticked lead;
 * a `!` marks the bullet **BREAKING**.
 */
export function formatCommit(subject, names = []) {
  const m = subject.match(/^(\w+)(?:\(([^)]*)\))?(!)?:\s*(.+)$/)
  if (!m) return { section: 'Other', text: subject }
  const [, type, scope, bang, text] = m
  const section = (SECTIONS.find(([t]) => t === type) ?? ['other', 'Other'])[1]
  const components = (scope ?? '')
    .split(/[,/]/)
    .map((s) => componentForScope(s.trim(), names))
    .filter(Boolean)
  const lead = components.map((c) => `\`${c}\``).join(' / ')
  const breaking = bang ? 'BREAKING' : ''
  const head = lead
    ? `**${[breaking, lead].filter(Boolean).join(' — ')}**: `
    : breaking
      ? '**BREAKING** '
      : ''
  return { section, text: head + text }
}

/** Commit subjects → the `### Section` blocks of a release (no `##` heading). */
export function draftSections(subjects, names = []) {
  const groups = new Map()
  for (const s of subjects) {
    const { section, text } = formatCommit(s, names)
    if (!groups.has(section)) groups.set(section, [])
    groups.get(section).push(text)
  }
  const order = [...new Set([...SECTIONS.map(([, s]) => s), 'Other'])]
  return order
    .filter((s) => groups.has(s))
    .map(
      (s) =>
        `### ${s}\n\n${groups
          .get(s)
          .map((i) => `- ${i}`)
          .join('\n')}`,
    )
    .join('\n\n')
}

/**
 * Splice a release into the changelog text:
 * - whatever is under `## [Unreleased]` becomes the top of the new release, followed by `sections`;
 * - a fresh, empty `## [Unreleased]` stays above it (added above the newest release if missing);
 * - the link references at the end get `[version]` and an updated `[Unreleased]`.
 * Returns `null` when the version already has an entry.
 */
export function insertRelease(changelog, { version, date, sections, previousTag }) {
  if (changelog.includes(`## [${version}]`)) return null
  const heading = `## [${version}] — ${date}`
  const anchor = '## [Unreleased]'
  let out
  const at = changelog.indexOf(`${anchor}\n`)
  if (at >= 0) {
    const bodyStart = at + anchor.length
    const next = changelog.indexOf('\n## [', bodyStart)
    const end = next < 0 ? changelog.length : next
    const pending = changelog.slice(bodyStart, end).trim()
    const body = [pending, sections.trim()].filter(Boolean).join('\n\n')
    out = `${changelog.slice(0, at)}${anchor}\n\n${heading}\n\n${body}\n${changelog.slice(end)}`
  } else {
    const first = changelog.indexOf('\n## [')
    if (first < 0) return null
    out = `${changelog.slice(0, first)}\n${anchor}\n\n${heading}\n\n${sections.trim()}\n${changelog.slice(first)}`
  }

  const unreleasedRef = `[Unreleased]: ${REPO_URL}/compare/v${version}...HEAD`
  const versionRef = previousTag
    ? `[${version}]: ${REPO_URL}/compare/${previousTag}...v${version}`
    : `[${version}]: ${REPO_URL}/releases/tag/v${version}`
  if (/^\[Unreleased\]: .*$/m.test(out)) {
    out = out.replace(/^\[Unreleased\]: .*$/m, `${unreleasedRef}\n${versionRef}`)
  } else {
    out = `${out.trimEnd()}\n\n${unreleasedRef}\n${versionRef}\n`
  }
  return out
}
