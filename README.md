# dssoca

[![npm](https://img.shields.io/npm/v/dssoca.svg)](https://www.npmjs.com/package/dssoca)
[![CI](https://github.com/httpassoca/dssoca/actions/workflows/ci.yml/badge.svg)](https://github.com/httpassoca/dssoca/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/dssoca.svg)](./LICENSE)

A Svelte 5 design system — **signal green on near-black, monospace-forward, zero border-radius**
everywhere. Configured along two orthogonal axes:

| Axis      | Attribute           | Values             | Default |
| --------- | ------------------- | ------------------ | ------- |
| **Color** | `data-theme`        | `dark` · `light`   | `dark`  |
| **Size**  | `data-size-variant` | `sm` · `md` · `lg` | `md`    |

Each component styles itself in a scoped block and consumes token-driven CSS custom properties;
flip an axis on any ancestor (usually `<html>`) and everything below rescales/recolors. Components
also take a per-instance `size` prop. See [`DESIGN.md`](./DESIGN.md) for the full rationale and
[`docs/tokens.md`](./docs/tokens.md) for the token reference.

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

Apps that own their global styles can import **tokens only** — every `--ss-*`
custom property (both themes, all size tiers, reduced-motion zeroing) with no
element styles and no webfont loading:

```js
import 'dssoca/tokens.css'
```

### Configure the axes from code

```ts
import { applyDesignConfig, designAttributes } from 'dssoca'

// flip axes; merges over current config; writes to <html>
applyDesignConfig({ sizeVariant: 'sm' }) // global: everything small
applyDesignConfig({ theme: 'light' }) // keeps size
applyDesignConfig({ componentsSize: { Button: 'lg' } }) // per-component default
```

Per instance, just set the `size` prop: `<Button size="lg">`.

SSR / no-flash — spread the attributes directly in markup instead of mutating the DOM:

```svelte
<script>
  import { designAttributes } from 'dssoca'
</script>

<html {...designAttributes({ sizeVariant: 'sm' })}>
```

## What's in the box

**Components (23):** `Icon`, `Badge`, `Button`, `Input`, `Textarea`, `Card`, `Sparkline`,
`ServiceCard`, `MetricTile`, `Topbar`, `Sidebar`, `BottomNav`, `Menu`, `Link`,
`SegmentedControl`, `Accordion`, `LogStream`, `Toaster`, `EmptyState`, `Image`,
`Heading`, `Container`, `Spinner`.

**Toasts:** `toast` (`.success` / `.error` / `.info` / `.loading` / `.promise`) + the `toasts`
store (`update` / `dismiss` / `pause` / `resume` / `clear`, `max` cap) — render once with
`<Toaster />`. Types: `Toast`, `ToastKind`, `ToastAction`, `ToastOptions`, `ToastPatch`,
`PromiseMessages`.

**Config:** `dssocaConfig` (the manifest), `applyDesignConfig`, `designAttributes`,
`getDesignConfig`, `resolveComponentSize`, `defaultDesignConfig`, and the `ColorTheme` / `Size` /
`DesignConfig` / `ComponentsSize` / `DesignAxis` / `ComponentName` / `DssocaConfig` types.

**Component types:** `IconName` (+ `registerIcon`), `TopbarTab`, `TopbarServices`, `SideItem` /
`SideGroup` / `SideStatus`, `LogLevel` / `LogLine`, `MenuItem`, `AccordionItem`,
`SegmentOption`, `BottomNavItem`, `ImageSource`, and `SpinnerVariant` / `SpinnerFrames`
(+ `SPINNER_VARIANTS` / `SPINNER_VARIANT_NAMES`).

## Accessibility

Targets **WCAG 2.2 AA**: native/keyboard-operable controls (Enter + Space), labelled
inputs (auto-associated ids, `aria-invalid` / `aria-describedby`), live-region toasts
(`role="status"`, `role="alert"` for errors), `aria-current` on active nav/tabs, decorative
icons/graphics `aria-hidden`, AA-contrast text tokens, and `prefers-reduced-motion` support
(motion-duration tokens collapse; the toast transition is guarded). Components are checked with
`vitest-axe` in unit tests and `@storybook/addon-a11y` in Storybook.

## House rules

- **Zero border-radius.** Every radius token is `0` — never override.
- New chrome reads size tokens (`--ss-*`), not hardcoded px, so it rescales with `data-size-variant`.

## Documentation

A custom documentation site lives in [`documentation/`](./documentation) (SvelteKit + mdsvex). It
dogfoods dssoca for its own chrome and covers the Introduction, Installation, Theming & config, a
live Tokens gallery, and a page per component that embeds the component's live Storybook story.

```sh
pnpm docs:dev      # docs site (run `pnpm storybook` alongside for the live demos)
pnpm docs:build    # static build of the docs site
```

The docs app is **not** part of the published npm package.

### Deployment (maintainers)

The docs site and Storybook deploy to **Vercel as two projects** from this one repo; the
repo-root `vercel.json` branches its `buildCommand` on a `VERCEL_DEPLOY_TARGET=storybook` env
var. The per-component Storybook embeds on the deployed docs default to
`http://localhost:6006` — set **`VITE_STORYBOOK_URL`** (Vercel env var on the **docs**
project) to the deployed Storybook URL and redeploy, or the iframes stay blank. Full setup:
[`documentation/CLAUDE.md`](./documentation/CLAUDE.md) → _Deployment_.

## Develop

```sh
pnpm install
pnpm dev        # library SvelteKit app (stub landing)
pnpm storybook  # interactive component explorer (:6006)
pnpm docs:dev   # documentation site
pnpm test       # Vitest component/unit suite
pnpm pack       # build dist/ (svelte-package) + validate (publint)
```

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the full workflow and [`CHANGELOG.md`](./CHANGELOG.md)
for release history.

## License

[MIT](./LICENSE) © Rafael Passoca
