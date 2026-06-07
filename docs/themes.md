# Theming & density — the config API

Both axes are plain `data-*` attributes (`data-theme`, `data-density`) that
cascade tokens to descendants. You can set them by hand, or drive them from the
config module in `$lib/config.ts` (re-exported from the package root).

## Config manifest (`dssoca.config.ts`)

The available axes, their allowed values, and the defaults are declared once in
`dssoca.config.ts` — the single source of truth. `config.ts` derives its types
and `defaultDesignConfig` from it, so changing a default (or adding a value /
axis) is a one-place edit. It's exported from the package root:

```ts
import { dssocaConfig } from 'dssoca'

dssocaConfig.theme    // { values: ['dark', 'light'],   default: 'dark' }
dssocaConfig.density  // { values: ['comfy', 'compact'], default: 'comfy' }
```

## Types

```ts
// Derived from the manifest in dssoca.config.ts:
export type ColorTheme = 'dark' | 'light'
export type Density    = 'comfy' | 'compact'

export interface DesignConfig {
  theme: ColorTheme
  density: Density
}

// defaultDesignConfig = { theme: 'dark', density: 'comfy' }
// (general-purpose default; hub overrides to 'compact'), read from the manifest.
export const defaultDesignConfig: DesignConfig
```

## API

### `applyDesignConfig(config?, target?) → DesignConfig`

Writes `data-theme` / `data-density` onto a target element (default
`document.documentElement`). The passed config is **merged over the current
config**, so you can flip one axis without restating the other. Returns the
resolved config. SSR-safe: a no-op when there's no `document` and no explicit
`target`.

```ts
import { applyDesignConfig } from 'dssoca'

applyDesignConfig({ density: 'compact' })   // hub bootstrap
applyDesignConfig({ theme: 'light' })        // density stays 'compact'
```

### `designAttributes(config?) → { 'data-theme', 'data-density' }`

Pure helper that returns the attribute map for a config (merged over defaults).
Use it for SSR / markup so the correct theme + density paint on the first frame
— no flash, no post-hydration mutation.

```svelte
<script>
  import { designAttributes } from 'dssoca'
</script>

<html {...designAttributes({ density: 'compact' })}>
  …
</html>
```

### `getDesignConfig() → DesignConfig`

Returns a copy of the last-applied config (or defaults).

## Recipes

### Hub (always compact)

Set it once at the app root. Cleanest with no flash is the SSR form:

```svelte
<!-- app.html or root layout -->
<html {...designAttributes({ density: 'compact' })}>
```

…or imperatively on mount:

```ts
import { applyDesignConfig } from 'dssoca'
applyDesignConfig({ density: 'compact' })
```

### General project (default comfy)

Do nothing. `comfy` + `dark` are the defaults. Import the CSS and go.

### User-toggleable theme

```ts
import { applyDesignConfig, getDesignConfig } from 'dssoca'

function toggleTheme() {
  const next = getDesignConfig().theme === 'dark' ? 'light' : 'dark'
  applyDesignConfig({ theme: next })
}
```

### Scoped density (one region only)

Because the attribute cascades, you can run a compact widget inside an otherwise
comfy page by putting `data-density="compact"` on just that subtree:

```svelte
<section data-density="compact">
  <!-- dense table here; rest of page stays comfy -->
</section>
```

## Notes

- The two axes are independent — setting one never disturbs the other.
- Attributes can live on any ancestor; nearest one wins, so scoped overrides
  work as shown above.
- The showcase (`pnpm dev`) has live toggles for both axes.
