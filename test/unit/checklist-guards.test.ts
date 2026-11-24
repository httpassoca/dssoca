/**
 * Repo-wide guards for the rules that came out of the Front-End Checklist audit
 * (GitHub #139, agile DS-0161). They scan every component's <style> block, so a new
 * component (or a regression) fails here instead of in the next audit. The rules, with
 * their rationale, live in CLAUDE.md → "Accessibility & quality rules".
 */
import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const DIR = 'src/lib/components'
const components = readdirSync(DIR)
  .filter((f) => f.endsWith('.svelte'))
  .map((f) => {
    const src = readFileSync(`${DIR}/${f}`, 'utf8')
    const at = src.indexOf('<style')
    return { name: f, markup: at < 0 ? src : src.slice(0, at), style: at < 0 ? '' : src.slice(at) }
  })

/** `file:line  text` for every style line matching `re`. */
function offenders(re: RegExp): string[] {
  return components.flatMap(({ name, style }) =>
    style
      .split('\n')
      .filter((line) => !line.trim().startsWith('//') && re.test(line))
      .map((line) => `${name}: ${line.trim()}`),
  )
}

describe('checklist guards — every component', () => {
  it('finds the components', () => {
    expect(components.length).toBeGreaterThan(40)
  })

  it('never uses the --ss-primary-soft wash as a :focus-visible indicator (WCAG 1.4.11)', () => {
    // ~1.2–1.5:1 against the page. `:focus-within` halos on field wrappers are fine: the
    // solid --ss-primary border is the indicator there.
    const bad = components
      .filter(({ style }) => /:focus-visible\s*\{[^}]*--ss-primary-soft/.test(style))
      .map((c) => c.name)
    expect(bad).toEqual([])
  })

  it('uses logical margin/padding/border/text-align so layouts mirror under dir="rtl"', () => {
    expect(
      offenders(
        /^\s*(margin-(left|right)|padding-(left|right)|border-(left|right)(-[a-z]+)?)\s*:|text-align:\s*(left|right)\b/,
      ),
    ).toEqual([])
  })

  it('never dims interactive text with opacity alone below AA (use a colour token)', () => {
    // The LogStream off-chip bug: `opacity: 0.45` on a live toggle. Disabled controls are
    // exempt from contrast rules, so only un-disabled state selectors are checked.
    const bad = components
      .filter(({ style }) => /\[aria-pressed='false'\]\s*\{[^}]*opacity\s*:/.test(style))
      .map((c) => c.name)
    expect(bad).toEqual([])
  })

  it('does not expose chart/data marks as role="button" (they have no action)', () => {
    const bad = components
      .filter(({ markup }) => /<(rect|circle|path|g)\b[^>]*role="button"/s.test(markup))
      .map((c) => c.name)
    expect(bad).toEqual([])
  })
})

// Behaviour lives in `src/lib/core/` (agile DS-0197): a component or a vanilla module passes
// the key to its core and applies the action that comes back. Deciding what a key does inside
// the `.svelte` / `vanilla/*.ts` file is how the two paths drifted apart before.
describe('checklist guards — key handling lives in core/', () => {
  const KEY_LOGIC = /\.key\s*(===|!==)|switch\s*\(\s*\w+\.key\s*\)/

  /** Not migrated yet. Remove a file when it moves onto its core; never add one. */
  const LEGACY = [
    'components/Accordion.svelte',
    'components/BoxPlot.svelte',
    'components/BumpChart.svelte',
    'components/Chart.svelte',
    'components/FileDrop.svelte',
    'components/Heatmap.svelte',
    'components/Image.svelte',
    'components/ScatterPlot.svelte',
    'components/SearchPalette.svelte',
    'components/SegmentedControl.svelte',
    'components/Sidebar.svelte',
    'components/Table.svelte',
    'components/TierList.svelte',
    'components/Toaster.svelte',
    'components/Tooltip.svelte',
    'components/Topbar.svelte',
    'vanilla/accordion.ts',
    'vanilla/segmented.ts',
    'vanilla/tierlist.ts',
    'vanilla/toast.ts',
    'vanilla/tooltip.ts',
  ]

  const handlesKeys = [
    ...components.map(({ name, markup }) => ({ file: `components/${name}`, code: markup })),
    ...readdirSync('src/lib/vanilla')
      .filter((f) => f.endsWith('.ts'))
      .map((f) => ({ file: `vanilla/${f}`, code: readFileSync(`src/lib/vanilla/${f}`, 'utf8') })),
  ]
    .filter(({ code }) => KEY_LOGIC.test(code))
    .map(({ file }) => file)
    .sort()

  it('no file outside the legacy list decides what a key does', () => {
    expect(handlesKeys.filter((f) => !LEGACY.includes(f))).toEqual([])
  })

  it('the legacy list only names files that still handle keys (it shrinks as they migrate)', () => {
    expect(LEGACY.filter((f) => !handlesKeys.includes(f))).toEqual([])
  })
})
