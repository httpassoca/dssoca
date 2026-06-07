# `dssoca` — Design System

Signal green on near-black, monospace-forward, **zero border-radius** everywhere
(house rule — never override). Derived from passoca.dev.

This package is the single source of truth for the look of every homelab
project. The hub is one consumer; other projects are free to consume it too,
which is exactly why the system has a **size** axis.

## Two axes

The system is configured along two independent axes. Each maps to a `data-*`
attribute that any ancestor element can carry (usually `<html>`), and tokens
cascade from there.

| Axis       | Attribute             | Values               | Default |
|------------|-----------------------|----------------------|---------|
| **Color**  | `data-theme`          | `dark` · `light`     | `dark`  |
| **Size**   | `data-size-variant`   | `sm` · `md` · `lg`   | `md`    |

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
applyDesignConfig({ sizeVariant: 'sm' })                 // global: everything small
applyDesignConfig({ theme: 'light' })                    // later, keeps size
applyDesignConfig({ componentsSize: { Button: 'lg' } })  // all buttons large by default
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
import 'dssoca/theme.css'   // global tokens, base styles + app-shell layout
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

> **Breaking in 0.3.0:** the global `.ss-*` *component* rules were removed from
> `theme.css` (they now live in the components). Use the exported components;
> hand-rolling raw `<button class="ss-btn">` against `theme.css` no longer works.

> **Breaking in 0.4.0:** the **density** axis became the **size** axis.
> `data-density` → `data-size-variant`, `Density`(comfy/compact) → `Size`(sm/md/lg)
> with `compact → sm`, `comfy → md` (+ new `lg`), `applyDesignConfig({ density })`
> → `{ sizeVariant }`. Components gained a `size` prop; Icon/PassocaMark's numeric
> `size` prop was renamed to `px`.

## Preview both modes

`pnpm dev` opens the showcase. The page header has **size** and **theme** toggles
so you can compare combinations live. It boots in `sm/dark` because it models the hub.

## House rules

- **Zero border-radius.** Every radius token is `0`. Never override.
- pnpm only.
- New chrome must read size tokens, not hardcoded px, or it won't rescale.
