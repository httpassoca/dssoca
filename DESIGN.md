# `dssoca` — Design System

Signal green on near-black, monospace-forward, **zero border-radius** everywhere
(house rule — never override). Derived from passoca.dev.

This package is the single source of truth for the look of every homelab
project. The hub is one consumer; other projects are free to consume it too,
which is exactly why the system has a **density** axis.

## Two axes

The system is configured along two independent axes. Each maps to a `data-*`
attribute that any ancestor element can carry (usually `<html>`), and tokens
cascade from there.

| Axis        | Attribute        | Values                | Default   |
|-------------|------------------|-----------------------|-----------|
| **Color**   | `data-theme`     | `dark` · `light`      | `dark`    |
| **Density** | `data-density`   | `comfy` · `compact`   | `comfy`   |

The axes are orthogonal — any of the four combinations is valid
(`dark/comfy`, `dark/compact`, `light/comfy`, `light/compact`).

### Color (`data-theme`)

Swaps surface + foreground tokens. Brand, status, and code colors are shared.
Nothing about layout changes.

### Density (`data-density`)

This is the new axis. It rescales the **chrome** — paddings, gaps, chrome font
sizes, control heights, shell dimensions, line-height — without touching colors,
fonts, or the squared-corner rule.

- **`comfy`** — roomy, general-purpose. The default. Use it for content-facing
  projects and anything that isn't a dense dashboard.
- **`compact`** — dense control-room layout. **The hub uses this.** More signal
  per screen: tighter rows, smaller chrome text, narrower shell.

`comfy` is the package default so a fresh project gets the comfortable layout
with no configuration. The hub explicitly opts into `compact`.

> Content typography (`h1`–`h3`, `--hs-size-*`, the `--hs-s-*` spacing scale) is
> intentionally **density-independent** — headings keep their rhythm in both
> modes. Only the dashboard chrome rescales. The one exception is `--hs-leading`
> (body line-height: `1.5` comfy / `1.3` compact).

## Config object

Density and theme can be driven from code via the config module
(`$lib/config.ts`, re-exported from the package root).

```ts
import { applyDesignConfig } from 'dssoca'

// flip one or both axes; merges over current config; writes to <html>
applyDesignConfig({ density: 'compact' })          // the hub
applyDesignConfig({ theme: 'light' })              // later, keeps density
applyDesignConfig({ theme: 'dark', density: 'comfy' })
```

SSR / no-flash: spread the attributes directly in markup instead of mutating
the DOM after hydration.

```svelte
<script>
  import { designAttributes } from 'dssoca'
</script>

<html {...designAttributes({ density: 'compact' })}>
```

Full API and types: [`docs/themes.md`](./docs/themes.md).

## Token reference

Every density-sensitive value is a CSS variable that flips with
`data-density`. The complete compact-vs-comfy table is in
[`docs/tokens.md`](./docs/tokens.md).

## Usage

```ts
import 'dssoca/theme.css'   // global tokens + base styles
import { Button, Card, applyDesignConfig } from 'dssoca'

applyDesignConfig({ density: 'comfy' }) // optional — comfy is already default
```

Components are unstyled wrappers over global `.hub-*` classes defined in
`theme.css`; they automatically pick up whatever density is active on an
ancestor.

## Preview both modes

`pnpm dev` opens the showcase. The page header has
**density** and **theme** toggles so you can compare all four combinations
live. It boots in `compact/dark` because it models the hub.

## House rules

- **Zero border-radius.** Every radius token is `0`. Never override.
- pnpm only.
- New chrome must read density tokens, not hardcoded px, or it won't rescale.
