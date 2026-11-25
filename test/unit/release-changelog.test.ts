import { describe, expect, it } from 'vitest'
import {
  componentForScope,
  draftSections,
  formatCommit,
  insertRelease,
} from '../../scripts/lib/changelog.mjs'

// DS-0196 — `pnpm release` drafts bullets the docs site can route to component pages.
const NAMES = ['Switch', 'TierList', 'Card', 'ServiceCard']

describe('release changelog helpers', () => {
  it('maps a commit scope to a component, ignoring case and separators', () => {
    expect(componentForScope('switch', NAMES)).toBe('Switch')
    expect(componentForScope('tier-list', NAMES)).toBe('TierList')
    expect(componentForScope('tierlist', NAMES)).toBe('TierList')
    expect(componentForScope('card', NAMES)).toBe('Card')
    expect(componentForScope('docs', NAMES)).toBeUndefined()
    expect(componentForScope(undefined, NAMES)).toBeUndefined()
  })

  it('leads a component-scoped commit with the backticked component name', () => {
    expect(formatCommit('fix(switch): visible focus ring (DS-0171)', NAMES)).toEqual({
      section: 'Fixed',
      text: '**`Switch`**: visible focus ring (DS-0171)',
    })
    expect(formatCommit('feat(card,service-card): overlay link', NAMES).text).toBe(
      '**`Card` / `ServiceCard`**: overlay link',
    )
  })

  it('flags breaking commits and leaves other scopes alone', () => {
    expect(formatCommit('feat(tier-list)!: new placements shape', NAMES).text).toBe(
      '**BREAKING — `TierList`**: new placements shape',
    )
    expect(formatCommit('feat(config)!: drop rgb triplets', NAMES).text).toBe(
      '**BREAKING** drop rgb triplets',
    )
    expect(formatCommit('docs(inspirations): polish', NAMES)).toEqual({
      section: 'Docs',
      text: 'polish',
    })
    expect(formatCommit('just a subject', NAMES)).toEqual({
      section: 'Other',
      text: 'just a subject',
    })
  })

  it('groups commits into Keep-a-Changelog sections in a stable order', () => {
    const out = draftSections(['fix(switch): a', 'feat: b', 'chore: c', 'fix: d'], NAMES)
    expect(out).toBe('### Added\n\n- b\n\n### Fixed\n\n- **`Switch`**: a\n- d\n\n### Chores\n\n- c')
  })

  const BASE = [
    '# Changelog',
    '',
    '## [Unreleased]',
    '',
    '### Docs',
    '',
    '- pending note',
    '',
    '## [1.0.0] — 2026-01-01',
    '',
    '### Added',
    '',
    '- first',
    '',
    '[Unreleased]: https://github.com/httpassoca/dssoca/compare/v1.0.0...HEAD',
    '[1.0.0]: https://github.com/httpassoca/dssoca/releases/tag/v1.0.0',
    '',
  ].join('\n')

  it('splices a release in, keeping pending Unreleased notes on top of it', () => {
    const out = insertRelease(BASE, {
      version: '1.1.0',
      date: '2026-02-02',
      sections: '### Fixed\n\n- **`Switch`**: x',
      previousTag: 'v1.0.0',
    })!
    expect(out).toContain(
      '## [Unreleased]\n\n## [1.1.0] — 2026-02-02\n\n### Docs\n\n- pending note\n\n### Fixed\n\n- **`Switch`**: x\n\n## [1.0.0]',
    )
    expect(out).toContain(
      '[Unreleased]: https://github.com/httpassoca/dssoca/compare/v1.1.0...HEAD\n[1.1.0]: https://github.com/httpassoca/dssoca/compare/v1.0.0...v1.1.0\n[1.0.0]:',
    )
  })

  it('adds the Unreleased anchor when the file has none, and refuses a duplicate version', () => {
    const bare = BASE.replace('## [Unreleased]\n\n### Docs\n\n- pending note\n\n', '')
    const out = insertRelease(bare, {
      version: '1.1.0',
      date: '2026-02-02',
      sections: '### Fixed\n\n- x',
    })!
    expect(out).toContain(
      '## [Unreleased]\n\n## [1.1.0] — 2026-02-02\n\n### Fixed\n\n- x\n\n## [1.0.0]',
    )
    expect(insertRelease(BASE, { version: '1.0.0', date: 'x', sections: '' })).toBeNull()
  })
})
