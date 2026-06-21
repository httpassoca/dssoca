# `dssoca` — Design System

Signal green on near-black, monospace-forward, **zero border-radius** everywhere
(house rule — never override).

This package is the single source of truth for the look of every homelab
project. The hub is one consumer; other projects are free to consume it too,
which is exactly why the system has a **size** axis.

## Two axes

The system is configured along two independent axes. Each maps to a `data-*`
attribute that any ancestor element can carry (usually `<html>`), and tokens
cascade from there.

| Axis      | Attribute           | Values             | Default |
| --------- | ------------------- | ------------------ | ------- |
| **Color** | `data-theme`        | `dark` · `light`   | `dark`  |
| **Size**  | `data-size-variant` | `sm` · `md` · `lg` | `md`    |

The axes are orthogonal — any combination is valid (`dark/md`, `dark/sm`,
`light/lg`, …).

### Color (`data-theme`)

Swaps surface + foreground tokens. Brand, status, and code colors are shared.
Nothing about layout changes.

### Size (`data-size-variant`)

Rescales the **chrome** — paddings, gaps, chrome font sizes, control heights,
shell dimensions, line-height — without touching colors, fonts, or the
squared-corner rule. (Renamed from the former **density** axis in 0.4.0:
`compact → sm`, `comfy → md`, plus a new larger `lg`.)

- **`sm`** — dense control-room layout (what the hub uses). More signal per
  screen: tighter rows, smaller chrome text, narrower shell.
- **`md`** — roomy, general-purpose. **The default.**
- **`lg`** — oversized; generous targets / large displays.

Size resolves in three layers (highest priority first):

1. a component's **`size` prop** (per instance) — `<Button size="lg">`
2. **`componentsSize[Name]`** in the config (per-component default)
3. **`sizeVariant`** on an ancestor (global default; `md` out of the box)

> Content typography (`h1`–`h3`, `--ss-size-*`, the `--ss-s-*` spacing scale) is
> intentionally **size-independent** — headings keep their rhythm at every size.
> Only the chrome rescales. The one exception is `--ss-leading` (body
> line-height: `1.3` sm / `1.5` md / `1.6` lg).

## Config object

The available axes, their values, and the defaults are declared once in
`dssoca.config.ts` (the manifest, exported as `dssocaConfig`); `config.ts`
derives its types + `defaultDesignConfig` from it. Size and theme can be driven
from code via the config module (`$lib/config.ts`, re-exported from the package
root).

```ts
import { applyDesignConfig } from 'dssoca'

// flip axes; merges over current config; writes to <html>
applyDesignConfig({ sizeVariant: 'sm' }) // global: everything small
applyDesignConfig({ theme: 'light' }) // later, keeps size
applyDesignConfig({ componentsSize: { Button: 'lg' } }) // all buttons large by default
```

Per instance, set the component's `size` prop directly: `<Button size="lg">`.

SSR / no-flash: spread the attributes directly in markup instead of mutating
the DOM after hydration.

```svelte
<script>
  import { designAttributes } from 'dssoca'
</script>

<html {...designAttributes({ sizeVariant: 'sm' })}>
```

Full API and types: [`docs/themes.md`](./docs/themes.md).

## Token reference

Every size-sensitive value is a CSS variable that flips with
`data-size-variant`. The complete sm/md/lg table is in
[`docs/tokens.md`](./docs/tokens.md).

## Usage

```ts
import 'dssoca/theme.css' // global tokens, base styles + app-shell layout
import { Button, Card, applyDesignConfig } from 'dssoca'

applyDesignConfig({ sizeVariant: 'md' }) // optional — md is already default
```

Each component styles itself in a **scoped `<style lang="scss">`** block and
consumes the global `--ss-*` tokens (custom properties cascade through Svelte's
scoped boundary), so it automatically picks up whatever theme/size is active
on an ancestor. `theme.css` carries only the tokens, base/element styles, and
app-shell/layout classes — **not** per-component rules.

The `ss-` prefix is reserved for **component-identity / design-system** classes
(`.ss-btn`, `.ss-panel`, `.ss-badge`, …); generic internal elements use plain,
unprefixed scoped names (`.head`, `.title`, `.dot`, …).

> **Breaking in 0.3.0:** the global `.ss-*` _component_ rules were removed from
> `theme.css` (they now live in the components). Use the exported components;
> hand-rolling raw `<button class="ss-btn">` against `theme.css` no longer works.

> **Breaking in 0.4.0:** the **density** axis became the **size** axis.
> `data-density` → `data-size-variant`, `Density`(comfy/compact) → `Size`(sm/md/lg)
> with `compact → sm`, `comfy → md` (+ new `lg`), `applyDesignConfig({ density })`
> → `{ sizeVariant }`. Components gained a `size` prop; the icon-style numeric
> `size` prop (e.g. `Icon`) was renamed to `px`.

## Component API conventions

Prop naming follows one convention across the library (DS-0078):

- **`title`** — the _visible_ heading / primary text of a content block
  (Card, EmptyState).
- **`label`** — the _visible_ text that names a control or an item inside one
  (Accordion items, Menu items, `SegmentOption`, Topbar tabs).
- **`ariaLabel`** (camelCase) — the standard prop for a **non-visible
  accessible name**: icon-only controls, landmarks, and live regions
  (BottomNav, LogStream, Topbar's `<nav>`, EmptyState's status region). It
  maps straight to the `aria-label` attribute.
- _Grandfathered exceptions_ (kept for backwards compatibility; any rename is
  batched for a semver-major): `Menu.label` and `SegmentedControl.label`
  provide a non-visible accessible name and would be `ariaLabel` under this
  convention.

Disabled states: interactive components take **`disabled`** — per item on
collection components (`MenuItem`, `AccordionItem`, `SegmentOption`,
BottomNav items) and component-wide where it makes sense (Link,
SegmentedControl). Disabled chrome is rendered **inert** (no activation, no
navigation, out of or skipped by the keyboard model) _and_ communicated to
assistive tech (native `disabled` or `aria-disabled="true"`); it is never
just styled out.

## Icons (DS-0109 / DS-0110)

- **One icon primitive.** Every icon a component draws renders through the
  shared `Icon` (`.ss-icon`) component — never a bespoke CSS-border shape or an
  ad-hoc inline `<svg>`. This centralises the stroke, the named size scale, and
  the a11y attributes. Need a new glyph? Add it to `BUILTIN_PATHS` in
  `Icon.svelte` (and the `IconName` union), don't draw it locally.
  - _Documented non-icons:_ the Button loading indicator is a **`Spinner`** (a
    text-frame glyph, not an SVG) and the Badge status dot is a **styled span**
    (a colour token, not a glyph). These are intentional and not forced through
    `Icon`.
- **Interactive icons get a wrapper.** An icon that _does_ something (toggle,
  dismiss, navigate) is never the clickable element itself. It sits inside a real
  control — a native `<button>` (preferred) or a roled/focusable hit-area — with
  the accessible name on the **control** (`aria-label`) and the icon marked
  `aria-hidden`. This also lets the hit area meet WCAG 2.2 AA target-size (2.5.8)
  independent of the glyph's px.
- **Named size scale.** `Icon` has a fixed local scale — **xs 12 / sm 16 / md 20
  / lg 24 px**. `xs` is Icon-only (no global `data-size-variant` counterpart). An
  unset `size` inherits the active `--ss-icon` token (16/20/24 across sm/md/lg);
  `px` is the escape hatch.

## Coordinated inner sizes (DS-0111)

A component at a given size drives its nested icons, text, and spacing to the
matching step — so a `sm` component is `sm` icons + `sm` text + tightened spacing
as one coherent unit, not an accidental cascade. The repeatable rule:

1. **Resolve once, at the root.** Resolve the effective size with
   `resolveComponentSize(name, size)` and apply it as `data-size-variant` on the
   component root. That is the single size decision for the whole subtree.
2. **Pass size down explicitly.** When rendering a nested _component_ (`Icon`,
   `Spinner`, nested `Badge`…), hand it the resolved size as a prop —
   `<Icon size={resolved} />` — rather than trusting the cascade. The global axis
   (`sm | md | lg`) is a subset of Icon's local scale (`xs | sm | md | lg`), so a
   resolved `Size` is a valid `Icon` size; map a component step to the matching
   icon step (icons generally sit one optical step below the text box). A
   `resolved` of `undefined` means "inherit" — pass it through and the Icon
   inherits the active `--ss-icon` token, still coordinated.
3. **Step spacing in lockstep.** Inner padding/gap use size-stepped `--ss-*`
   tokens, or component-local micro-tokens defined per `[data-size-variant]`
   named **`--ss-<name>-*`** (e.g. Accordion's `--ss-acc-*`). Never hardcode
   inner px — it won't rescale. Every component follows this micro-token shape
   rather than inventing its own.
4. **Don't break harmony.** Coordinated steps must preserve alignment and optical
   balance (heights, baselines) across sm/md/lg.

Reference implementation: **Accordion** resolves its size once and passes it to
the chevron `Icon`, with `--ss-acc-*` micro-tokens stepping the spacing.

## Preview both modes

`pnpm dev` opens the showcase. The page header has **size** and **theme** toggles
so you can compare combinations live. It boots in `sm/dark` because it models the hub.

## House rules

- **Zero border-radius.** Every radius token is `0`. Never override.
- pnpm only.
- New chrome must read size tokens, not hardcoded px, or it won't rescale.
- **Icons via `Icon`.** All component-drawn icons render through the shared
  `Icon` component; interactive icons are wrapped in a real control (see _Icons_).
- **Coordinated inner sizes.** Resolve size once at the root, pass it explicitly
  to nested `Icon`/`Spinner`, and step spacing with `--ss-*` / `--ss-<name>-*`
  tokens (see _Coordinated inner sizes_).
