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

## Custom palettes (0.12.0 color rework)

The color surface is a monochromatic 16-slot terminal palette: 19 root slots
per theme (`bg`, `fg`, `accent` + the 16 ANSI colors) that every semantic
`--ss-*` token derives from (see `docs/tokens.md`). Because the semantics
chain through the slots, replacing the 19 slots recolors the whole system —
that is the custom-palette API. Palettes are generated interactively in the
documentation app's **Theme Builder** page, which exports both consumption
formats below.

### Types

```ts
import { PALETTE_SLOTS, type Palette, type ThemePalette, type PaletteSlot } from 'dssoca'

// PaletteSlot  = 'bg' | 'fg' | 'accent' | 'black' | … | 'brightWhite'  (19 slots)
// ThemePalette = Record<PaletteSlot, string>   // any CSS <color> per slot
// Palette      = { dark: ThemePalette; light: ThemePalette }
```

### Runtime path — `applyDesignConfig({ palette })`

```ts
import { applyDesignConfig } from 'dssoca'
import { myPalette } from './my-palette'

applyDesignConfig({ palette: myPalette }) // custom colors, both themes covered
applyDesignConfig({ theme: 'light' }) // flip themes — palette follows
applyDesignConfig({ palette: null }) // back to the built-in palette
```

Semantics: the **active theme's** 19 values are written as inline custom
properties on the target (default `<html>`) and re-written on every call, so
a later theme flip can never be masked by stale inline values. The `palette`
field is tri-state in partials: omit = keep the current palette, an object =
set it, `null` = clear it (`el.style.removeProperty` per slot — the
stylesheet palette resumes). `getDesignConfig().palette` returns a deep copy.

### CSS path — `paletteToCss(palette)` (zero-JS / SSR)

```ts
import { paletteToCss } from 'dssoca'
const css = paletteToCss(myPalette)
```

Emits a `:root, [data-theme='dark'] { … }` + `[data-theme='light'] { … }`
override block (the Theme Builder's "CSS" export is exactly this output).
Ship it **after** `dssoca/theme.css` in source order — the selectors have
equal specificity, so order decides. This is the recommended SSR path: no
flash, no post-hydration mutation, works with `designAttributes()` as usual.

### Preset palettes (`PRESET_THEMES`)

Because any terminal theme can be a website theme, the library ships six
ready-made palettes ported from well-known terminal themes:

| Preset (`name`) | Modes        | Source                                              |
| --------------- | ------------ | --------------------------------------------------- |
| `dracula`       | dark + light | Dracula spec ANSI; light = official Alucard Classic |
| `tokyo-night`   | dark + light | folke/tokyonight.nvim — Night + Day                 |
| `gruvbox`       | dark + light | morhetz/gruvbox — dark + light                      |
| `nord`          | dark only    | nordtheme.com terminal spec                         |
| `solarized`     | dark + light | Ethan Schoonover's official ANSI mapping            |
| `coffee`        | light only   | custom warm theme (derived, no upstream)            |

```ts
import { applyDesignConfig, paletteToCss, PRESET_THEMES, presetPalette } from 'dssoca'

applyDesignConfig({ palette: presetPalette('dracula') }) // runtime path
const css = paletteToCss(presetPalette('gruvbox')) // zero-JS / SSR path

PRESET_THEMES // readonly PresetTheme[] — { name, label, accent, dark?, light? }
```

A preset only carries the modes its upstream actually defines — there is no
invented Nord-light or Coffee-dark. `presetPalette()` fills the `Palette`
shape by **mirroring** the single mode into both, so flipping `data-theme`
keeps the same colors for single-mode presets.

**Fidelity + accessibility.** The hue slots are upstream-verbatim. Two kinds
of adjustment were made, each visible as a comment in `src/lib/presets.ts`:

- _Role-mapped neutrals_: terminal light themes map `ansiBlack` to the
  background and `brightWhite` to dark text; dssoca's semantic layer expects
  the opposite (`black` = darkest ink, `brightWhite` = lightest
  surface/shine, `brightBlack` = muted text). The neutral slots are therefore
  assigned by **role**, still using only the theme's own official colors.
- _AA fixes_: slots that failed the Theme Builder's WCAG 2.2 AA checks (7:1
  body text, 4.5:1 muted text and button labels, 3:1 UI hues) were nudged
  along OKLCH lightness only — hue and chroma untouched, so each theme keeps
  its identity. Every nudge carries an `// AA-fixed from #…` comment with the
  upstream value, and `test/unit/presets.test.ts` pins the contrast targets
  so an edit can't silently regress readability.

The docs **Theme Builder** offers every preset as an example button: picking
one loads the full palette into the builder (as slot overrides), where you
can inspect, hand-tune, and re-export it.

## Notes

- The two axes are independent — setting one never disturbs the other.
- Attributes can live on any ancestor; nearest one wins, so scoped overrides work.
- The showcase (`pnpm dev`) has live toggles for both axes.
- **Theme-tracked colors.** `data-theme` controls the _full_ color surface, not
  just bg/fg: the sentiment tokens (`--ss-success`/`-soft`,
  `--ss-danger`/`-hover`/`-soft`, `--ss-fg-on-danger`), the log-level accents
  (`--ss-log-info`/`-warn`/`-err`/`-ok`), and the per-tone badge
  fills/borders/foregrounds (`--ss-badge-<tone>-bg`/`-border`/`-fg` for
  `brand`/`neutral`/`positive`/`caution`/`critical`/`info`)
  all derive from the 19 root slots and hold AA contrast in both themes. Read
  these tokens (never raw hexes) so a theme flip — or an imported custom
  palette — recolors your component too. The full per-theme value table lives
  in `docs/tokens.md`.
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
