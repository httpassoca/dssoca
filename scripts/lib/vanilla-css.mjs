/**
 * `dssoca/vanilla.css` generator (DS-0148).
 *
 * Turns the components' compiled `<style>` blocks into ONE global stylesheet that plain-HTML
 * consumers can load after `theme.css`/`tokens.css`. Every component's rules are wrapped in a
 * donut `@scope (.ss-root) to (<every component root>)` so the unprefixed internal class
 * names (`.label`, `.head`, …) that are safe under Svelte's hash scoping stay isolated from
 * nested components in a global sheet too.
 *
 * Dependency-free plain JS (like `palette.mjs`) so Node can run it directly from `prepack`
 * and Vitest can exercise the exact same function on Sass-compiled sources. Pure: identical
 * inputs always produce byte-identical output.
 *
 * Input contract (what Sass "expanded" output + svelte-package give us): well-formed CSS,
 * one top-level construct per `{…}`, `//` comments already stripped, `/* … *\/` comments
 * possible, strings only in declaration values, no braces inside strings or comments, and
 * conditional at-rules (`@media`/`@supports`) bubbled to the top level. Anything outside that
 * contract throws — the generator would rather fail `prepack` than emit a broken sheet.
 */

/**
 * Component file name → identity root class(es). Explicit on purpose: the irregular cases
 * (Input's root is `.ss-field`, Image has a sibling lightbox root, ShortcutsHelp renders inside
 * Modal) make markup heuristics unreliable. Drift-guarded by `test/unit/vanilla-css.test.ts`
 * against the file system and `COMPONENT_NAMES`.
 *
 * `.ss-toast` and `.ss-input` are deliberately NOT here: they are internals of Toaster /
 * Input+NumberField, and roots double as scope limits.
 */
export const ROOT_CLASSES = Object.freeze({
  Accordion: ['ss-accordion'],
  Avatar: ['ss-avatar'],
  Badge: ['ss-badge'],
  BottomNav: ['ss-bottom-nav'],
  BoxPlot: ['ss-boxplot'],
  BumpChart: ['ss-bump'],
  Button: ['ss-btn'],
  Card: ['ss-card'],
  Chart: ['ss-chart'],
  Container: ['ss-container'],
  DateField: ['ss-datefield'],
  EmptyState: ['ss-empty'],
  FileDrop: ['ss-filedrop'],
  Heading: ['ss-heading'],
  Heatmap: ['ss-heatmap'],
  Icon: ['ss-icon'],
  Image: ['ss-image', 'ss-image-lightbox'],
  Input: ['ss-field'],
  Kbd: ['ss-kbd'],
  Link: ['ss-link'],
  LogStream: ['ss-logs'],
  Menu: ['ss-menu'],
  MetricTile: ['ss-metric'],
  Modal: ['ss-modal'],
  NumberField: ['ss-numberfield'],
  Pagination: ['ss-pagination'],
  ScatterPlot: ['ss-scatter'],
  SearchPalette: ['ss-search-palette'],
  SegmentedControl: ['ss-segmented'],
  Select: ['ss-select'],
  ServiceCard: ['ss-svc'],
  ShortcutsHelp: ['ss-shortcuts-help'],
  Sidebar: ['ss-side'],
  Sparkline: ['ss-spark'],
  Spinner: ['ss-spinner'],
  Switch: ['ss-switch'],
  Table: ['ss-table'],
  Textarea: ['ss-textarea'],
  Toaster: ['ss-toaster'],
  Tooltip: ['ss-tooltip'],
  Topbar: ['ss-topbar'],
})

/** Every root class, flattened, in manifest order. Doubles as the `@scope … to (…)` limit list. */
export const ALL_ROOTS = Object.freeze(Object.values(ROOT_CLASSES).flat())

/** Selector list used as the donut lower bound of every scope block. */
export const SCOPE_LIMIT = ALL_ROOTS.map((c) => `.${c}`).join(', ')

/** Pull the `<style>` body out of a `.svelte` source (compiled or not). `null` when absent. */
export function extractStyleBlock(svelteSource) {
  const m = /<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/.exec(svelteSource)
  return m ? m[1] : null
}

/** Remove `@charset` and `/* … *\/` comments (the input never nests braces inside either). */
export function stripCommentsAndCharset(css) {
  return css.replace(/^@charset\s+"[^"]*";\s*/m, '').replace(/\/\*[\s\S]*?\*\//g, '')
}

/**
 * Split a CSS text into its top-level constructs.
 * @returns {Array<{ prelude: string, body: string, kind: 'style'|'keyframes'|'media'|'supports' }>}
 */
export function splitRules(css) {
  const rules = []
  let depth = 0
  let quote = null
  let buf = ''
  let bodyStart = -1
  for (let i = 0; i < css.length; i++) {
    const ch = css[i]
    if (quote) {
      if (ch === quote && css[i - 1] !== '\\') quote = null
      continue
    }
    if (ch === '"' || ch === "'") {
      quote = ch
      continue
    }
    if (ch === '{') {
      if (depth === 0) {
        buf = css.slice(bodyStart === -1 ? 0 : bodyStart, i)
        bodyStart = i + 1
        buf = buf.trim()
      }
      depth++
      continue
    }
    if (ch === '}') {
      depth--
      if (depth < 0) throw new Error('vanilla-css: unbalanced "}"')
      if (depth === 0) {
        const prelude = buf.replace(/\s+/g, ' ')
        if (!prelude) throw new Error('vanilla-css: rule without a prelude')
        rules.push({ prelude, body: css.slice(bodyStart, i), kind: kindOf(prelude) })
        bodyStart = i + 1
        buf = ''
      }
      continue
    }
    if (ch === ';' && depth === 0) {
      // A top-level statement (e.g. a stray `@import`) — not part of the contract.
      const stmt = css.slice(bodyStart === -1 ? 0 : bodyStart, i).trim()
      if (stmt) throw new Error(`vanilla-css: unsupported top-level statement "${stmt}"`)
      bodyStart = i + 1
    }
  }
  if (depth !== 0) throw new Error('vanilla-css: unbalanced "{"')
  const tail = css.slice(bodyStart === -1 ? 0 : bodyStart).trim()
  if (tail) throw new Error(`vanilla-css: trailing text outside any rule: "${tail.slice(0, 40)}"`)
  return rules
}

function kindOf(prelude) {
  if (!prelude.startsWith('@')) return 'style'
  const name = prelude.split(/[\s(]/, 1)[0]
  if (name === '@keyframes') return 'keyframes'
  if (name === '@media') return 'media'
  if (name === '@supports') return 'supports'
  throw new Error(`vanilla-css: unsupported at-rule "${name}" (add explicit handling)`)
}

const GLOBAL_RE = /:global\(([^()]*)\)/g

/**
 * Strip `:global(...)` wrappers and anchor the selector list to the component root when its
 * first compound isn't already one of the component's roots.
 */
export function deglobalize(prelude, roots) {
  if (/:global\([^()]*\(/.test(prelude)) {
    throw new Error(`vanilla-css: nested parens inside :global() are unsupported: ${prelude}`)
  }
  const stripped = prelude.replace(GLOBAL_RE, '$1')
  return stripped
    .split(',')
    .map((sel) => {
      const s = sel.trim()
      const first = s.split(/[\s>+~]/, 1)[0]
      const rooted = roots.some((r) => first.split('.').includes(r))
      return rooted ? s : `.${roots[0]} ${s}`
    })
    .join(', ')
}

/** Re-indent a raw rule body by `indent` (keeping its relative nesting) for readable output. */
function indentBlock(text, indent) {
  const lines = text.split('\n').filter((l) => l.trim())
  const min = Math.min(...lines.map((l) => l.length - l.trimStart().length))
  return lines.map((l) => indent + l.slice(min).trimEnd()).join('\n')
}

function renderRule(prelude, body, indent) {
  const inner = indentBlock(body, indent + '  ')
  return `${indent}${prelude} {\n${inner}\n${indent}}`
}

/**
 * Process one component's compiled CSS.
 * @returns {{ keyframes: string[], scoped: string[], globals: string[] }} rendered rule texts
 */
export function extractComponentCss(name, css) {
  const roots = ROOT_CLASSES[name]
  if (!roots) throw new Error(`vanilla-css: "${name}" is not in ROOT_CLASSES`)
  const out = { keyframes: [], scoped: [], globals: [] }
  for (const rule of splitRules(stripCommentsAndCharset(css))) {
    if (rule.kind === 'keyframes') {
      const kfName = rule.prelude.slice('@keyframes '.length).trim()
      if (!kfName.startsWith('ss-')) {
        throw new Error(
          `vanilla-css: ${name} declares @keyframes "${kfName}" — global keyframe names must be ss-prefixed`,
        )
      }
      out.keyframes.push(renderRule(rule.prelude, rule.body, ''))
      continue
    }
    if (rule.kind === 'media' || rule.kind === 'supports') {
      if (rule.body.includes(':global(')) {
        throw new Error(`vanilla-css: ${name} has :global() inside ${rule.prelude} (unsupported)`)
      }
      if (rule.body.includes('@keyframes')) {
        throw new Error(
          `vanilla-css: ${name} nests @keyframes inside ${rule.prelude} (unsupported)`,
        )
      }
      out.scoped.push(renderRule(rule.prelude, rule.body, '  '))
      continue
    }
    if (rule.prelude.includes(':global(')) {
      out.globals.push(renderRule(deglobalize(rule.prelude, roots), rule.body, ''))
      continue
    }
    out.scoped.push(renderRule(rule.prelude, rule.body, '  '))
  }
  return out
}

/** Wrap rendered rules in the component's donut scope block. */
export function scopeBlock(roots, scopedRules) {
  const head = `@scope (${roots.map((r) => `.${r}`).join(', ')}) to (${SCOPE_LIMIT}) {`
  return `${head}\n${scopedRules.join('\n')}\n}`
}

/** Escape a glyph for use inside a double-quoted CSS string. */
function cssString(glyph) {
  return `"${glyph.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

/**
 * Pure-CSS replacement for Spinner.svelte's JS frame ticker: one `steps()` keyframes per
 * variant that flips `content` on `.frame:empty::before`. Vanilla markup leaves `.frame`
 * empty; a `data-variant` attribute on the root picks the frame set.
 */
export function spinnerCss(variants, defaultVariant) {
  if (!variants[defaultVariant]) {
    throw new Error(`vanilla-css: unknown default spinner variant "${defaultVariant}"`)
  }
  const names = Object.keys(variants)
  const keyframes = names.map((v) => {
    const { frames } = variants[v]
    const n = frames.length
    const stops = frames.map(
      (g, i) => `  ${fmtPct((i / n) * 100)} {\n    content: ${cssString(g)};\n  }`,
    )
    stops.push(`  100% {\n    content: ${cssString(frames[0])};\n  }`)
    return `@keyframes ss-spinner-${v} {\n${stops.join('\n')}\n}`
  })
  const dur = (v) => `${variants[v].interval * variants[v].frames.length}ms`
  const rules = [
    `  .frame:empty::before {\n    content: ${cssString(variants[defaultVariant].frames[0])};\n    display: inline-block;\n    min-width: 1ch;\n    text-align: center;\n    animation: ss-spinner-${defaultVariant} ${dur(defaultVariant)} steps(1, end) infinite;\n  }`,
    ...names.map(
      (v) =>
        `  .ss-spinner[data-variant="${v}"] .frame:empty::before {\n    content: ${cssString(variants[v].frames[0])};\n    animation-name: ss-spinner-${v};\n    animation-duration: ${dur(v)};\n  }`,
    ),
    `  @media (prefers-reduced-motion: reduce) {\n    .frame:empty::before {\n      animation: none;\n    }\n  }`,
  ]
  return { keyframes, scoped: rules }
}

function fmtPct(n) {
  const r = Math.round(n * 1000) / 1000
  return `${r}%`
}

/**
 * Enter/exit motion for vanilla toasts (Toaster.svelte uses `transition:fly`, which has no CSS
 * to extract). `--ss-dur-fast` is already `0ms` under `prefers-reduced-motion`, so the
 * animations collapse to an instant swap there without a separate media query.
 */
export const TOASTER_EXTRA = {
  keyframes: [
    `@keyframes ss-toast-in {\n  from {\n    opacity: 0;\n    transform: translate(var(--ss-toast-fly-x, 16px), var(--ss-toast-fly-y, 0));\n  }\n  to {\n    opacity: 1;\n    transform: none;\n  }\n}`,
    `@keyframes ss-toast-out {\n  to {\n    opacity: 0;\n    transform: translate(var(--ss-toast-fly-x, 16px), var(--ss-toast-fly-y, 0));\n  }\n}`,
  ],
  scoped: [
    `  .ss-toast {\n    animation: ss-toast-in var(--ss-dur-fast) var(--ss-ease) both;\n  }`,
    `  .ss-toast.leaving {\n    animation: ss-toast-out var(--ss-dur-fast) var(--ss-ease) forwards;\n    pointer-events: none;\n  }`,
    `  .ss-toaster[data-position$="left"] {\n    --ss-toast-fly-x: -16px;\n  }`,
    `  .ss-toaster[data-position$="center"] {\n    --ss-toast-fly-x: 0px;\n  }`,
    `  .ss-toaster[data-position="top-center"] {\n    --ss-toast-fly-y: -16px;\n  }`,
    `  .ss-toaster[data-position="bottom-center"] {\n    --ss-toast-fly-y: 16px;\n  }`,
  ],
}

export const BANNER = `/*
 * dssoca vanilla.css — GENERATED by scripts/build-vanilla.mjs from the components' <style>
 * blocks (DS-0148). Do not edit.
 *
 * Load AFTER dssoca/theme.css or dssoca/tokens.css. Every component is wrapped in a donut
 * @scope (…) to (…) block, so the browser must support CSS @scope
 * (Chrome/Edge 118+, Safari 17.4+, Firefox 2026+). Markup contract: the exact DOM the Svelte
 * components render — see the "Plain HTML & CSS" guide in the docs.
 */`

/**
 * Assemble the whole stylesheet.
 * @param {Record<string, string>} components  component name → compiled CSS of its <style> block
 * @param {{ spinnerVariants: Record<string, {interval:number, frames:readonly string[]}>, defaultSpinnerVariant: string }} opts
 */
export function buildVanillaCss(components, opts) {
  const names = Object.keys(components).sort()
  const missing = Object.keys(ROOT_CLASSES).filter((n) => !(n in components))
  const unknown = names.filter((n) => !(n in ROOT_CLASSES))
  if (missing.length || unknown.length) {
    throw new Error(
      `vanilla-css: manifest mismatch — missing: [${missing.join(', ')}] unknown: [${unknown.join(', ')}]`,
    )
  }
  const spinner = spinnerCss(opts.spinnerVariants, opts.defaultSpinnerVariant)
  const parts = ['@charset "UTF-8";', BANNER]
  for (const name of names) {
    const roots = ROOT_CLASSES[name]
    const { keyframes, scoped, globals } = extractComponentCss(name, components[name])
    const extra = name === 'Spinner' ? spinner : name === 'Toaster' ? TOASTER_EXTRA : null
    parts.push(`/* ── ${name} ── */`)
    parts.push(...keyframes, ...(extra?.keyframes ?? []))
    parts.push(scopeBlock(roots, [...scoped, ...(extra?.scoped ?? [])]))
    parts.push(...globals)
  }
  return parts.join('\n') + '\n'
}
