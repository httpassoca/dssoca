import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { compileString } from 'sass'
import { COMPONENT_NAMES, dssocaConfig } from '$lib/dssoca.config'
import { SPINNER_VARIANTS } from '$lib/spinner-frames'
import {
  ROOT_CLASSES,
  ALL_ROOTS,
  scopeLimit,
  splitRules,
  deglobalize,
  scopeSelector,
  extractComponentCss,
  extractStyleBlock,
  spinnerCss,
  buildVanillaCss,
} from '../../scripts/lib/vanilla-css.mjs'

// The generator runs in `prepack` on the CSS svelte-package emits (SCSS already compiled to
// plain CSS). Tests reproduce that input from src by compiling each component's
// <style lang="scss"> body with Dart Sass — the same compiler vitePreprocess uses — so every
// invariant is pinned against the sources, not against a committed dist snapshot.
const componentsDir = resolve(process.cwd(), 'src/lib/components')
const files = readdirSync(componentsDir)
  .filter((f) => f.endsWith('.svelte'))
  .sort()

const sources: Record<string, string> = {}
const compiled: Record<string, string> = {}
for (const file of files) {
  const name = file.slice(0, -'.svelte'.length)
  const src = readFileSync(resolve(componentsDir, file), 'utf8')
  sources[name] = src
  const scss = extractStyleBlock(src)
  if (scss === null) continue
  compiled[name] = compileString(scss, { syntax: 'scss', style: 'expanded' }).css
}

const opts = {
  spinnerVariants: SPINNER_VARIANTS,
  defaultSpinnerVariant: dssocaConfig.spinner.default,
}
const css = buildVanillaCss(compiled, opts)

/** Rough selector specificity (a, b, c) — enough to compare against theme.css's layout rules. */
function specificity(selector: string): [number, number, number] {
  let s = selector.replace(/::?[a-z-]+\([^)]*\)/g, (m) => (m.startsWith('::') ? 'x' : m))
  // :where() contributes nothing; :not()/:is() are approximated by their content class count.
  s = s.replace(/:where\([^)]*\)/g, '')
  const ids = (s.match(/#[\w-]+/g) ?? []).length
  const classes =
    (s.match(/\.[\w-]+/g) ?? []).length +
    (s.match(/\[[^\]]+\]/g) ?? []).length +
    (s.match(/(?<!:):[a-z-]+/g) ?? []).length
  const elements =
    (s.match(/(^|[\s>+~])[a-z][\w-]*/g) ?? []).length + (s.match(/::[a-z-]+/g) ?? []).length
  return [ids, classes, elements]
}
const cmp = (a: number[], b: number[]) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]

describe('vanilla.css — manifest', () => {
  it('ROOT_CLASSES covers exactly the component files on disk', () => {
    const onDisk = files.map((f) => f.slice(0, -'.svelte'.length))
    expect(Object.keys(ROOT_CLASSES).sort()).toEqual(onDisk)
  })

  it('agrees with COMPONENT_NAMES (Heatmap/BoxPlot/BumpChart/ScatterPlot resolve as Chart)', () => {
    for (const n of COMPONENT_NAMES) expect(ROOT_CLASSES, n).toHaveProperty(n)
  })

  it('every listed root class appears as the leading class in that component markup', () => {
    for (const [name, roots] of Object.entries(ROOT_CLASSES)) {
      for (const root of roots) {
        expect(sources[name], `${name} → .${root}`).toMatch(
          new RegExp(`class="${root}(?:[\\s"]|\\{)`),
        )
      }
    }
  })

  it('root classes are unique and ss-prefixed; internals are not roots', () => {
    expect(new Set(ALL_ROOTS).size).toBe(ALL_ROOTS.length)
    for (const r of ALL_ROOTS) expect(r).toMatch(/^ss-/)
    expect(ALL_ROOTS).not.toContain('ss-toast')
    expect(ALL_ROOTS).not.toContain('ss-input')
  })
})

describe('vanilla.css — parser', () => {
  it('splits top-level rules, keeping nested bodies intact', () => {
    const rules = splitRules(
      `.a { color: red; }\n@media (x) { .b { content: "{"; } }\n@keyframes ss-k { to { opacity: 0 } }`,
    )
    expect(rules.map((r) => r.kind)).toEqual(['style', 'media', 'keyframes'])
    expect(rules[1].body).toContain('content: "{"')
  })

  it('rejects at-rules and statements outside the contract', () => {
    expect(() => splitRules('@layer x { .a { b: c } }')).toThrow(/unsupported at-rule/)
    expect(() => splitRules('@import "x";')).toThrow(/unsupported top-level statement/)
    expect(() => splitRules('.a { b: c')).toThrow(/unbalanced/)
  })

  it('deglobalize strips wrappers and anchors unrooted selectors to the root', () => {
    expect(deglobalize('.media :global(img), .media :global(svg)', ['ss-card'])).toBe(
      '.ss-card .media img, .ss-card .media svg',
    )
    expect(deglobalize(':global(.ss-link .ss-link-ext)', ['ss-link'])).toBe('.ss-link .ss-link-ext')
    expect(deglobalize('.ss-icon :global(.ss-icon-dot)', ['ss-icon'])).toBe('.ss-icon .ss-icon-dot')
  })

  it('scopeSelector anchors root-led selectors with a zero-specificity :where(:scope)', () => {
    expect(scopeSelector('.ss-btn', ['ss-btn'])).toBe(':where(:scope).ss-btn')
    expect(scopeSelector('.ss-btn.primary:hover, .ss-btn .label', ['ss-btn'])).toBe(
      ':where(:scope).ss-btn.primary:hover, :where(:scope).ss-btn .label',
    )
    expect(scopeSelector('.ss-btn:not(.a .b) > .x', ['ss-btn'])).toBe(
      ':where(:scope).ss-btn:not(.a .b) > .x',
    )
    // internals and lookalike classes are left alone; multi-root keeps the class
    expect(scopeSelector('.label', ['ss-btn'])).toBe('.label')
    expect(scopeSelector('.ss-btn-x .y', ['ss-btn'])).toBe('.ss-btn-x .y')
    expect(scopeSelector('.ss-image-lightbox .close', ['ss-image', 'ss-image-lightbox'])).toBe(
      ':where(:scope).ss-image-lightbox .close',
    )
    expect(scopeSelector(':where(:scope).ss-btn', ['ss-btn'])).toBe(':where(:scope).ss-btn')
  })

  it('applies the root anchor inside nested @media blocks too', () => {
    const { scoped } = extractComponentCss(
      'Badge',
      '.ss-badge { color: red; }\n@media (x) {\n  .ss-badge { color: blue; }\n  .dot { a: b; }\n}',
    )
    expect(scoped[0]).toContain(':where(:scope).ss-badge {')
    expect(scoped[1]).toContain('@media (x) {')
    expect(scoped[1]).toContain(':where(:scope).ss-badge {')
    expect(scoped[1]).toContain('    .dot {')
  })

  it('refuses unprefixed @keyframes (they would be global)', () => {
    expect(() => extractComponentCss('Badge', '@keyframes pulse { to { opacity: 0 } }')).toThrow(
      /ss-prefixed/,
    )
  })
})

describe('vanilla.css — output', () => {
  const componentCount = Object.keys(ROOT_CLASSES).length

  it('has one donut @scope block per component, limited by every OTHER root', () => {
    const blocks = css.match(/^@scope \((.+?)\) to \((.+?)\) \{$/gm) ?? []
    expect(blocks).toHaveLength(componentCount)
    for (const [, roots] of Object.entries(ROOT_CLASSES)) {
      const head = `@scope (${roots.map((r) => `.${r}`).join(', ')}) to (${scopeLimit(roots)}) {`
      expect(css).toContain(head)
      // Own roots are never limits (Chrome would exclude the root itself); all others are.
      const limit = scopeLimit(roots)
      for (const r of roots) expect(limit).not.toContain(`.${r},`)
      for (const other of ALL_ROOTS)
        if (!roots.includes(other)) expect(limit).toContain(`.${other}`)
    }
  })

  it('never leaves a bare root class as the first compound of a scoped rule', () => {
    // Inside @scope such a selector could only match a DESCENDANT, never the root.
    for (const [name, roots] of Object.entries(ROOT_CLASSES)) {
      const start = css.indexOf(`/* ── ${name} ── */`)
      const block = css.slice(css.indexOf('@scope (', start), css.indexOf('\n}\n', start) + 1)
      for (const line of block.split('\n').slice(1)) {
        const t = line.trim()
        if (!t.endsWith('{') || t.startsWith('@')) continue
        for (const r of roots) {
          expect(t, `${name}: ${t}`).not.toMatch(new RegExp(`^\\.${r}(?![\\w-])`))
        }
      }
    }
  })

  it('carries no Svelte scoping artefacts', () => {
    expect(css).not.toMatch(/svelte-[a-z0-9]{4,}/)
    expect(css).not.toContain(':global(')
    expect(css).not.toContain('lang="scss"')
  })

  it('starts with a single @charset and the generated banner', () => {
    expect(css.startsWith('@charset "UTF-8";\n/*')).toBe(true)
    expect(css.match(/@charset/g)).toHaveLength(1)
    expect(css).toContain('Load AFTER dssoca/theme.css or dssoca/tokens.css')
  })

  it('hoists every @keyframes to the top level with ss- names, and references resolve', () => {
    const declared = new Set<string>()
    let depth = 0
    for (const line of css.split('\n')) {
      const m = /^@keyframes ([\w-]+) \{$/.exec(line)
      if (m) {
        expect(depth, `${m[1]} must be top-level`).toBe(0)
        expect(m[1]).toMatch(/^ss-/)
        declared.add(m[1])
      }
      depth += (line.match(/\{/g) ?? []).length - (line.match(/\}/g) ?? []).length
    }
    const sourceKeyframes = Object.values(compiled).flatMap((c) =>
      [...c.matchAll(/@keyframes ([\w-]+)/g)].map((m) => m[1]),
    )
    for (const k of sourceKeyframes) expect(declared.has(k), k).toBe(true)
    const refs = [...css.matchAll(/animation(?:-name)?: ([\w-]+)/g)].map((m) => m[1])
    for (const r of refs) if (r !== 'none') expect(declared.has(r), `animation ${r}`).toBe(true)
  })

  it('emits the four :global rules unscoped, anchored to their roots', () => {
    const globalsExpected = [
      '.ss-card .media img, .ss-card .media svg, .ss-card .media video {',
      '.ss-link .ss-link-ext {',
      '.ss-segmented .segment .ic {',
      '.ss-icon .ss-icon-dot {',
    ]
    // Top-level rules are the only unindented non-at-rule selectors in the sheet.
    const topLevelStyleRules = css.split('\n').filter((l) => /^[^\s@/}]/.test(l) && l.endsWith('{'))
    for (const g of globalsExpected) expect(topLevelStyleRules).toContain(g)
    expect(topLevelStyleRules).toHaveLength(globalsExpected.length)
  })

  it('keeps @media/@supports blocks inside their component scope', () => {
    // Every conditional at-rule is indented (inside a scope), never at column 0.
    expect(css).not.toMatch(/^@(media|supports)/m)
    const sourceMedia = Object.values(compiled).reduce(
      (n, c) => n + (c.match(/@media/g)?.length ?? 0) + (c.match(/@supports/g)?.length ?? 0),
      0,
    )
    const outputMedia =
      (css.match(/^ {2}@media/gm)?.length ?? 0) + (css.match(/^ {2}@supports/gm)?.length ?? 0)
    // +1: the spinner appendix adds its own reduced-motion block.
    expect(outputMedia).toBe(sourceMedia + 1)
  })

  it('preserves every source style rule inside its scope block', () => {
    for (const [name, c] of Object.entries(compiled)) {
      const rules = splitRules(c.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^@charset[^\n]*\n/, ''))
      const styleCount = rules.filter(
        (r) => r.kind === 'style' && !r.prelude.includes(':global('),
      ).length
      const section = css.slice(
        css.indexOf(`/* ── ${name} ── */`),
        css.indexOf('/* ── ', css.indexOf(`/* ── ${name} ── */`) + 1) === -1
          ? undefined
          : css.indexOf('/* ── ', css.indexOf(`/* ── ${name} ── */`) + 1),
      )
      // Count only inside the @scope block (keyframe stops are also indented by two).
      const start = section.indexOf('@scope (')
      const block = section.slice(start, section.indexOf('\n}\n', start) + 1)
      const emitted = (block.match(/^ {2}[^\s@}][^\n]*\{$/gm) ?? []).length
      const extra =
        name === 'Spinner' ? 1 + Object.keys(SPINNER_VARIANTS).length : name === 'Toaster' ? 6 : 0
      expect(emitted, name).toBe(styleCount + extra)
    }
  })

  it('is deterministic', () => {
    expect(buildVanillaCss(compiled, opts)).toBe(css)
  })

  it('fails loudly on manifest mismatch', () => {
    const { Badge: _drop, ...rest } = compiled
    void _drop
    expect(() => buildVanillaCss(rest, opts)).toThrow(/missing: \[Badge\]/)
    expect(() => buildVanillaCss({ ...compiled, Nope: '.x{}' }, opts)).toThrow(/unknown: \[Nope\]/)
  })
})

describe('vanilla.css — Table vs the deprecated theme.css layout .ss-table', () => {
  it('component rules for th/td/.head/.cell are more specific than the layout rules', () => {
    // theme.css (loaded first) has `.ss-table th, .ss-table td` at (0,1,1). Every Table rule
    // that styles those cells must be ≥ (0,2,0) so it wins regardless of tie-breaks.
    const { scoped } = extractComponentCss('Table', compiled.Table)
    const preludes = scoped
      .filter((r) => !r.trimStart().startsWith('@'))
      .map((r) => r.slice(0, r.indexOf('{')).trim())
    const cellRules = preludes.filter((p) => /\b(th|td|\.head|\.cell)\b/.test(p))
    expect(cellRules.length).toBeGreaterThan(0)
    for (const p of cellRules) {
      for (const sel of p.split(',')) {
        expect(cmp(specificity(sel.trim()), [0, 2, 0]), sel).toBeGreaterThanOrEqual(0)
      }
    }
  })
})

describe('vanilla.css — spinner appendix', () => {
  it('generates one steps() keyframes per variant with frames.length + 1 stops', () => {
    const { keyframes, scoped } = spinnerCss(SPINNER_VARIANTS, 'pipe')
    const names = Object.keys(SPINNER_VARIANTS)
    expect(keyframes).toHaveLength(names.length)
    for (const [i, v] of names.entries()) {
      const { frames, interval } = SPINNER_VARIANTS[v as keyof typeof SPINNER_VARIANTS]
      expect(keyframes[i]).toContain(`@keyframes ss-spinner-${v} {`)
      expect(keyframes[i].match(/content: /g)).toHaveLength(frames.length + 1)
      expect(keyframes[i]).toContain(`content: "${frames[0]}"`)
      expect(scoped.join('\n')).toContain(`.ss-spinner[data-variant="${v}"] .frame:empty::before`)
      expect(scoped.join('\n')).toContain(`animation-duration: ${interval * frames.length}ms`)
    }
    expect(scoped[0]).toContain('animation: ss-spinner-pipe 800ms steps(1, end) infinite')
    expect(scoped.at(-1)).toContain('prefers-reduced-motion: reduce')
    expect(() => spinnerCss(SPINNER_VARIANTS, 'nope')).toThrow(/unknown default/)
  })

  it('uses the manifest default variant in the built sheet', () => {
    expect(css).toContain(`animation: ss-spinner-${dssocaConfig.spinner.default} `)
  })
})
