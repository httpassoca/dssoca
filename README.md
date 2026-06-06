# dssoca

A Svelte 5 design system — **signal green on near-black, monospace-forward, zero border-radius**
everywhere. Configured along two orthogonal axes:

| Axis        | Attribute      | Values              | Default |
|-------------|----------------|---------------------|---------|
| **Color**   | `data-theme`   | `dark` · `light`    | `dark`  |
| **Density** | `data-density` | `comfy` · `compact` | `comfy` |

Components are thin wrappers over a token-driven `theme.css`; flip an axis on any ancestor
(usually `<html>`) and everything below rescales/recolors. See [`DESIGN.md`](./DESIGN.md) for the
full rationale and [`docs/tokens.md`](./docs/tokens.md) for the token reference.

## Install

```sh
npm i dssoca
```

Svelte 5 is a peer dependency:

```sh
npm i -D svelte@^5
```

## Usage

Import the stylesheet once (global tokens + base styles), then use components:

```svelte
<script>
  import { Button, Card, toast } from 'dssoca'
  import 'dssoca/theme.css'
</script>

<Card title="Hello">
  <Button onclick={() => toast.success('it works')}>Click</Button>
</Card>
```

### Configure the axes from code

```ts
import { applyDesignConfig, designAttributes } from 'dssoca'

// flip one or both axes; merges over current config; writes to <html>
applyDesignConfig({ density: 'compact' })          // dense dashboard
applyDesignConfig({ theme: 'light' })              // keeps density
```

SSR / no-flash — spread the attributes directly in markup instead of mutating the DOM:

```svelte
<script>
  import { designAttributes } from 'dssoca'
</script>

<html {...designAttributes({ density: 'compact' })}>
```

## What's in the box

**Components:** `PassocaMark`, `Icon`, `Badge`, `Button`, `Input`, `Card`, `Sparkline`,
`ServiceCard`, `MetricTile`, `Topbar`, `Sidebar`, `LogStream`, `Toaster`, `EmptyState`.

**Toasts:** `toast` (`.success` / `.error` / `.info`) + the `toasts` store — render once with
`<Toaster />`.

**Config:** `applyDesignConfig`, `designAttributes`, `getDesignConfig`, `defaultDesignConfig`, and
the `ColorTheme` / `Density` / `DesignConfig` types.

## House rules

- **Zero border-radius.** Every radius token is `0` — never override.
- New chrome reads density tokens (`--ss-*`), not hardcoded px, so it rescales with `data-density`.

## Develop

```sh
pnpm install
pnpm dev      # showcase app with live theme + density toggles
pnpm test     # Vitest component/unit suite
pnpm pack     # build dist/ (svelte-package) + validate (publint)
```

## License

[MIT](./LICENSE) © Rafael Passoca
