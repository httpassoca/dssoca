# Theming & size — the config API

Both axes are plain `data-*` attributes (`data-theme`, `data-size-variant`) that
cascade tokens to descendants. You can set them by hand, or drive them from the
config module in `$lib/config.ts` (re-exported from the package root).

## Config manifest (`dssoca.config.ts`)

The available axes, their allowed values, and the defaults are declared once in
`dssoca.config.ts` — the single source of truth. `config.ts` derives its types
and `defaultDesignConfig` from it, so changing a default (or adding a value /
axis) is a one-place edit. It's exported from the package root:

```ts
import { dssocaConfig } from 'dssoca'

dssocaConfig.theme // { values: ['dark', 'light'],  default: 'dark' }
dssocaConfig.size // { values: ['sm', 'md', 'lg'], default: 'md' }
```

## Types

```ts
// Derived from the manifest in dssoca.config.ts:
export type ColorTheme = 'dark' | 'light'
export type Size = 'sm' | 'md' | 'lg'

export interface DesignConfig {
  theme: ColorTheme
  sizeVariant: Size // global default size ([data-size-variant])
  componentsSize: ComponentsSize // per-component default sizes
}

// defaultDesignConfig = { theme: 'dark', sizeVariant: 'md', componentsSize: {} }
export const defaultDesignConfig: DesignConfig
```

## Sizing layers

Highest priority first:

1. a component's **`size` prop** — `<Button size="lg">`
2. **`componentsSize[Name]`** — a per-component default in the config
3. **`sizeVariant`** on an ancestor — the global default (`md` out of the box)

`sm` ← the old `compact`, `md` ← the old `comfy`, and `lg` is new (renamed from
the density axis in 0.4.0).

## API

### `applyDesignConfig(config?, target?) → DesignConfig`

Writes `data-theme` / `data-size-variant` onto a target element (default
`document.documentElement`). The passed config is **merged over the current
config** (`componentsSize` merges key-by-key), so you can flip one axis without
restating the others. Returns the resolved config. SSR-safe: a no-op when
there's no `document` and no explicit `target`.

```ts
import { applyDesignConfig } from 'dssoca'

applyDesignConfig({ sizeVariant: 'sm' }) // global small
applyDesignConfig({ theme: 'light' }) // size stays 'sm'
applyDesignConfig({ componentsSize: { Button: 'lg' } }) // big buttons by default
```

### `designAttributes(config?) → { 'data-theme', 'data-size-variant' }`

Pure helper that returns the attribute map for a config (merged over defaults).
Use it for SSR / markup so the correct theme + size paint on the first frame —
no flash, no post-hydration mutation.

```svelte
<script>
  import { designAttributes } from 'dssoca'
</script>

<html {...designAttributes({ sizeVariant: 'sm' })}> … </html>
```

### `getDesignConfig() → DesignConfig`

Returns a copy of the last-applied config (or defaults).

### `resolveComponentSize(name, size?) → Size | undefined`

Resolves the size a component should apply on its own root (as
`data-size-variant`), or `undefined` to inherit the global `sizeVariant`.
Order: explicit `size` → `componentsSize[name]` → inherit. Components call this
internally; you rarely need it directly.

## Recipes

### Dense dashboard (everything small)

```svelte
<!-- app.html or root layout -->
<html {...designAttributes({ sizeVariant: 'sm' })}>
```

…or imperatively on mount:

```ts
import { applyDesignConfig } from 'dssoca'
applyDesignConfig({ sizeVariant: 'sm' })
```

### General project (default md)

Do nothing. `md` + `dark` are the defaults. Import the CSS and go.

### User-toggleable theme

```ts
import { applyDesignConfig, getDesignConfig } from 'dssoca'

function toggleTheme() {
  const next = getDesignConfig().theme === 'dark' ? 'light' : 'dark'
  applyDesignConfig({ theme: next })
}
```

### Per-instance and scoped size

A component's `size` prop overrides everything for that instance:

```svelte
<Button size="lg">Big</Button>
<Badge size="sm">tiny</Badge>
```

Because `data-size-variant` cascades, you can also resize a whole region by
putting it on a wrapper:

```svelte
<section data-size-variant="sm">
  <!-- dense subtree; rest of page keeps the global size -->
</section>
```

## Notes

- The two axes are independent — setting one never disturbs the other.
- Attributes can live on any ancestor; nearest one wins, so scoped overrides work.
- The showcase (`pnpm dev`) has live toggles for both axes.
- **Theme-tracked colors.** `data-theme` controls the _full_ color surface, not
  just bg/fg: the sentiment tokens (`--ss-success`/`-soft`,
  `--ss-danger`/`-hover`/`-soft`, `--ss-fg-on-danger`), the log-level accents
  (`--ss-log-info`/`-warn`/`-err`/`-ok`), and the per-tone badge fills/borders
  (`--ss-badge-<tone>-bg`/`-border` for `up`/`deg`/`down`/`maint`/`info`/`neutral`)
  all carry light-mode overrides so they hold AA contrast in both themes. Read
  these tokens (never raw hexes) so a theme flip recolors your component too. The
  full per-theme value table lives in `docs/tokens.md`.
- **Legacy `.hs-*` typography classes are deprecated.** `theme.css` still ships
  the pre-rename `hubssoca` helpers (`.hs-display`, `.hs-h1`…`.hs-h3`, `.hs-p`,
  `.hs-sm`, `.hs-caption`, `.hs-link`, `.hs-no-underline`, `.hs-mono`) for
  back-compat only — don't use them in new code (the bare elements are styled
  globally; use the `Heading` component for display titles). See
  `docs/tokens.md` → _Legacy `.hs-_` typography classes\*.

## June 2026 quality pass (`DS-0069`)

- Light `--ss-primary` darkened `#157f3b` → `#147c3a` (accent text on `--ss-bg` was 4.46:1,
  now 4.64:1 — WCAG 2.2 AA); `--ss-primary-rgb`/`--ss-primary-soft`/badge-up values track it.
- New per-theme `--ss-code-overlay` for inline code/kbd washes.
- `--ss-selection-bg/fg` now explicitly redeclared in the light block.
- `color-scheme: dark | light` set per theme in `_tokens.scss` (ships in `tokens.css` too).
