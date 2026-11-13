/**
 * Per-component release history (DS-0196).
 *
 * Two layers, merged by {@link componentChangelog}:
 *
 * 1. **Backfill** — `./<slug>.json`, one file per component, researched once from the git
 *    history, PRs, agile items and CHANGELOG for every release up to {@link BACKFILLED_THROUGH}.
 *    These files are frozen history: nobody needs to touch them again.
 * 2. **Automatic** — every release AFTER that is derived from the repo-root `CHANGELOG.md`: a
 *    bullet that names the component in backticks lands on its page (`deriveComponentReleases`
 *    in `../changelog.ts`). Writing the release notes IS updating the component pages.
 *
 * A component added later has no JSON file; its whole history is derived.
 */
import {
  compareVersions,
  deriveComponentReleases,
  type ChangelogRelease,
  type ComponentChange,
  type ComponentRelease,
} from '../changelog'

/** Last release covered by the hand-researched JSON files. Never needs to move. */
export const BACKFILLED_THROUGH = '0.20.0'

/** Every release the backfill may name — the git tags up to {@link BACKFILLED_THROUGH}. */
export const BACKFILLED_RELEASES: Record<string, string> = {
  '0.1.0': '2026-06-06',
  '0.2.0': '2026-06-06',
  '0.5.0': '2026-06-08',
  '0.6.0': '2026-06-09',
  '0.7.0': '2026-06-09',
  '0.8.0': '2026-06-09',
  '0.8.1': '2026-06-09',
  '0.8.2': '2026-06-09',
  '0.9.0': '2026-06-12',
  '0.10.0': '2026-06-15',
  '0.11.0': '2026-06-15',
  '0.12.0': '2026-07-11',
  '0.13.0': '2026-07-12',
  '0.14.0': '2026-07-12',
  '0.15.0': '2026-08-16',
  '0.16.0': '2026-08-30',
  '0.17.0': '2026-09-06',
  '0.18.0': '2026-09-06',
  '0.19.0': '2026-09-18',
  '0.20.0': '2026-11-13',
}

export interface ComponentHistoryFile {
  /** Exported component name — must match the docs entry with the same slug. */
  component: string
  releases: { version: string; changes: ComponentChange[] }[]
}

const files = import.meta.glob<ComponentHistoryFile>('./*.json', { eager: true, import: 'default' })

/** slug → backfilled history file. */
export const COMPONENT_HISTORY: Record<string, ComponentHistoryFile> = Object.fromEntries(
  Object.entries(files).map(([path, file]) => [path.replace(/^\.\/|\.json$/g, ''), file]),
)

/**
 * The full history of one component, newest first: `Unreleased` and releases after the backfill
 * (derived from `CHANGELOG.md`), then the backfilled releases.
 */
export function componentChangelog(
  doc: { name: string; slug: string },
  releases: readonly ChangelogRelease[],
  names: readonly string[],
): ComponentRelease[] {
  const history = COMPONENT_HISTORY[doc.slug]
  const derived = deriveComponentReleases(
    releases,
    doc.name,
    names,
    history ? BACKFILLED_THROUGH : undefined,
  )
  const backfill = (history?.releases ?? [])
    .map((r) => ({ ...r, date: BACKFILLED_RELEASES[r.version] }))
    .sort((a, b) => compareVersions(b.version, a.version))
  return [...derived, ...backfill]
}
