# Design tokens

All tokens are CSS custom properties prefixed `--ss-`. They split into three
groups by which axis (if any) controls them. The source of truth is
`src/styles/_tokens.scss` for the core inventory; **component-scoped tokens
live in per-component partials under `src/styles/components/*.scss`, joined by
`src/styles/components/_index.scss`** — that is the convention (one partial per
component, wired into `theme.scss`/`tokens.scss` once via the joiner; see the
rationale in `_index.scss` and agile `DS-0043`). Keep this file in sync with
both.

Both stylesheet entries carry the full token surface: `dssoca/theme.css`
(tokens + base styles + app-shell/layout) and `dssoca/tokens.css` (tokens
only — core + component partials, no element styles, no webfonts).

## 1. Color tokens — controlled by `data-theme`

The color surface is a **monochromatic 16-slot terminal palette** in two
layers (0.12.0 color rework):

- **Layer A — root slots (generated).** The 16 ANSI terminal colors plus
  `bg`, `fg` and the single vivid `--ss-accent`, per theme, authored in
  OKLCH. Neutrals carry the accent's hue at low chroma (bg strongest, whites
  faintest); the six hue slots keep classic ANSI anchor hues leaned ~35%
  toward the accent, with red↔green held ≥45° apart so git diffs stay
  legible. Values are produced by `scripts/generate-palette.mjs`
  (`pnpm gen:palette`) — tune the recipe there, never edit the region by
  hand; a drift-guard test pins the committed values to the recipe.
- **Layer B — semantic layer (hand-maintained).** Every other color token is
  a `var()` alias or `color-mix()` derivation of the root slots, declared
  inside the same `[data-theme]` blocks. Overriding the 19 slots — via
  `applyDesignConfig({ palette })` or a `paletteToCss` CSS block (see
  `docs/themes.md`) — therefore recolors the entire system, washes included.

### Root slots (Layer A)

Authored as `oklch()`; the hex equivalents below are the exact sRGB values
(also in the generated comments in `_tokens.scss`). Dark `--ss-accent` is the
brand green byte-for-byte. Every text-role slot (the 12 hue slots, `fg`,
`accent`, `bright-black`) holds WCAG 2.2 AA (≥4.5:1) on both `--ss-bg` and
`--ss-bg-elev` in both themes — asserted mathematically by
`test/unit/palette-generator.test.ts`.

| Token                 | Dark      | Light     | Terminal slot      |
| --------------------- | --------- | --------- | ------------------ |
| `--ss-bg`             | `#100f10` | `#ebf2eb` | background         |
| `--ss-fg`             | `#dae0da` | `#1f231f` | foreground         |
| `--ss-accent`         | `#66ef73` | `#2b7c34` | — (the 17th color) |
| `--ss-black`          | `#151d15` | `#101910` | color0             |
| `--ss-red`            | `#e18a77` | `#a65644` | color1             |
| `--ss-green`          | `#7ab677` | `#407a3e` | color2             |
| `--ss-yellow`         | `#b6a54e` | `#736300` | color3             |
| `--ss-blue`           | `#46b4d6` | `#007693` | color4             |
| `--ss-magenta`        | `#df879a` | `#a65467` | color5             |
| `--ss-cyan`           | `#46bba4` | `#007c6a` | color6             |
| `--ss-white`          | `#e5e9e5` | `#d4d9d4` | color7             |
| `--ss-bright-black`   | `#859085` | `#4f584f` | color8             |
| `--ss-bright-red`     | `#ffa28d` | `#983d2a` | color9             |
| `--ss-bright-green`   | `#8bd387` | `#286f28` | color10            |
| `--ss-bright-yellow`  | `#d3bf56` | `#5d5000` | color11            |
| `--ss-bright-blue`    | `#4acff8` | `#006882` | color12            |
| `--ss-bright-magenta` | `#ff9cb1` | `#963952` | color13            |
| `--ss-bright-cyan`    | `#4ad8bd` | `#006e5d` | color14            |
| `--ss-bright-white`   | `#fafdfa` | `#fafdfa` | color15            |

On light, the "bright" hue slots go _darker_ (more emphatic on a light page);
yellow is dropped further — it has the highest luminance per unit lightness.

### Semantic layer (Layer B)

Derivations shown for dark; light overrides only where the recipe differs
(deeper/inverted washes, `-hover` mixes toward black instead of white).

| Token                  | Derivation (dark)                                                | Light differs?           |
| ---------------------- | ---------------------------------------------------------------- | ------------------------ |
| `--ss-bg-elev`         | `color-mix(in oklab, var(--ss-bg) 88%, var(--ss-bright-white))`  | `var(--ss-bright-white)` |
| `--ss-bg-elev-hover`   | same mix at 83%                                                  | bright-white 96% + black |
| `--ss-line`            | `color-mix(in srgb, var(--ss-bright-white) 12%, transparent)`    | black 16%                |
| `--ss-line-strong`     | bright-white 22%                                                 | black 30%                |
| `--ss-fg-shine`        | `var(--ss-bright-white)`                                         | `var(--ss-black)`        |
| `--ss-fg-muted`        | `color-mix(in oklab, var(--ss-fg) 72%, var(--ss-bg))`            | same recipe              |
| `--ss-fg-faint`        | `var(--ss-bright-black)` (AA-solved by the generator)            | no                       |
| `--ss-fg-on-primary`   | `var(--ss-bg)`                                                   | `var(--ss-bright-white)` |
| `--ss-primary`         | `var(--ss-accent)`                                               | no                       |
| `--ss-primary-soft`    | accent 18% wash                                                  | accent 12% wash          |
| `--ss-primary-hover`   | `color-mix(in oklab, var(--ss-accent) 82%, white)`               | accent 85% + black       |
| `--ss-hover`           | bright-white 5% wash                                             | black 5% wash            |
| `--ss-code-overlay`    | bright-white 6% wash                                             | black 6% wash            |
| `--ss-skeleton`        | bright-white 10% wash                                            | black 10% wash           |
| `--ss-danger`          | `var(--ss-red)`                                                  | no                       |
| `--ss-danger-hover`    | red 80% + white                                                  | red 82% + black          |
| `--ss-danger-soft`     | red 18% wash                                                     | red 12% wash             |
| `--ss-fg-on-danger`    | `var(--ss-bg)`                                                   | `var(--ss-bright-white)` |
| `--ss-success(-soft)`  | `var(--ss-accent)` / `var(--ss-primary-soft)`                    | no                       |
| `--ss-code-bg`         | `color-mix(in oklab, var(--ss-bg) 65%, var(--ss-black))`         | bg 92% + black           |
| `--ss-code-fg`         | `var(--ss-fg)`                                                   | no                       |
| `--ss-code-string`     | `var(--ss-green)`                                                | no                       |
| `--ss-code-number`     | `var(--ss-yellow)`                                               | no                       |
| `--ss-code-keyword`    | `var(--ss-magenta)`                                              | no                       |
| `--ss-code-func`       | `var(--ss-blue)`                                                 | no                       |
| `--ss-code-comment`    | `var(--ss-bright-black)`                                         | no                       |
| `--ss-log-*`           | aliases of the code/status tokens (unchanged)                    | no                       |
| `--ss-selection-bg/fg` | `var(--ss-accent)` / `var(--ss-fg-on-primary)`                   | no                       |
| `--ss-badge-<tone>-*`  | slot washes — bg 12% / border 40% (see below)                    | bg 10% / border 35%      |
| `--ss-shadow-glow`     | `0 0 24px color-mix(in srgb, var(--ss-accent) 35%, transparent)` | no                       |

Badge tone → slot mapping (DS-0119 tones): `brand`→blue, `neutral`→extreme
neutral washes + `--ss-line`, `positive`→accent (matches `--ss-success`),
`caution`→yellow, `critical`→red, `info`→cyan. Each `-fg` is a text slot the
generator AA-solved; on light, `positive-fg`/`critical-fg` use the deeper
`-hover` mixes.

### Deprecated aliases (removed next minor)

| Deprecated    | Use instead    | Alias shipped in 0.12.0          |
| ------------- | -------------- | -------------------------------- |
| `--ss-purple` | `--ss-magenta` | `--ss-purple: var(--ss-magenta)` |
| `--ss-lime`   | `--ss-green`   | `--ss-lime: var(--ss-green)`     |

### Removed in 0.12.0 (breaking)

`--ss-primary-rgb` and `--ss-red-rgb` are gone: comma-triplet tokens cannot
chain through `var()`, so they would silently ignore an imported palette.
Migration:

```css
/* before */
background: rgba(var(--ss-primary-rgb), 0.06);
/* after  */
background: color-mix(in srgb, var(--ss-accent) 6%, transparent);

/* before */
box-shadow: 0 0 0 3px rgba(var(--ss-red-rgb), 0.22);
/* after  */
box-shadow: 0 0 0 3px color-mix(in srgb, var(--ss-danger) 22%, transparent);
```

Also note the six status hues (`--ss-red/yellow/blue/cyan` + new
`--ss-green/--ss-magenta`) carry **new values** — they are terminal slots
leaned toward the accent now, not the old neon set.

## 2. Size tokens — controlled by `data-size-variant`

Defined under `:root, [data-size-variant="md"]` (the default); `[data-size-variant="sm"]`
and `[data-size-variant="lg"]` override them. These rescale the entire chrome.
(Renamed from the density axis in 0.4.0: `sm` ← compact, `md` ← comfy, `lg` new.)

| Token                      | sm       | md (default) | lg       | Drives                                                                          |
| -------------------------- | -------- | ------------ | -------- | ------------------------------------------------------------------------------- |
| `--ss-leading`             | `1.3`    | `1.5`        | `1.6`    | html / body line-height                                                         |
| `--ss-ui-xs`               | `9.5px`  | `11px`       | `12.5px` | micro uppercase labels                                                          |
| `--ss-ui-sm`               | `10.5px` | `12px`       | `13.5px` | secondary chrome text                                                           |
| `--ss-ui-md`               | `11.5px` | `13px`       | `15px`   | primary chrome text                                                             |
| `--ss-ui-lg`               | `13px`   | `15px`       | `17px`   | names, logo                                                                     |
| `--ss-icon`                | `16px`   | `20px`       | `24px`   | Icon box (DS-0109 scale; `xs` 12px is Icon-prop-only)                           |
| `--ss-control-font`        | `12px`   | `14px`       | `16px`   | buttons                                                                         |
| `--ss-control-py`          | `5px`    | `9px`        | `12px`   | button padding-y                                                                |
| `--ss-control-px`          | `9px`    | `16px`       | `22px`   | button padding-x                                                                |
| `--ss-input-font`          | `14px`   | `15px`       | `17px`   | inputs                                                                          |
| `--ss-input-py`            | `10px`   | `13px`       | `17px`   | input padding-y                                                                 |
| `--ss-input-px`            | `12px`   | `16px`       | `20px`   | input padding-x                                                                 |
| `--ss-panel-head-py`       | `7px`    | `12px`       | `16px`   | panel header padding-y                                                          |
| `--ss-panel-head-px`       | `12px`   | `18px`       | `24px`   | panel header padding-x                                                          |
| `--ss-panel-body-py`       | `10px`   | `18px`       | `24px`   | panel body padding-y                                                            |
| `--ss-panel-body-px`       | `12px`   | `18px`       | `24px`   | panel body padding-x                                                            |
| `--ss-card-py`             | `10px`   | `16px`       | `22px`   | metric / service card padding-y                                                 |
| `--ss-card-px`             | `12px`   | `18px`       | `24px`   | metric / service card padding-x                                                 |
| `--ss-metric-val`          | `26px`   | `32px`       | `40px`   | metric tile value size                                                          |
| `--ss-row-py`              | `5px`    | `9px`        | `12px`   | nav rows, table cells padding-y                                                 |
| `--ss-row-px`              | `10px`   | `14px`       | `18px`   | nav rows, table cells padding-x                                                 |
| `--ss-badge-px`            | `8px`    | `12px`       | `16px`   | badge padding-x (no padding-y; height from line-height, DS-0121)                |
| `--ss-chip-py`             | `3px`    | `5px`        | `7px`    | chip-like padding-y (Topbar skip-link / LogStream chips / ServiceCard skeleton) |
| `--ss-badge-dot`           | `4px`    | `5px`        | `6px`    | badge status-dot size                                                           |
| `--ss-badge-gap`           | `5px`    | `6px`        | `7px`    | badge inner gap                                                                 |
| `--ss-gap`                 | `8px`    | `14px`       | `18px`   | default grid/flex gap                                                           |
| `--ss-gap-sm`              | `6px`    | `10px`       | `13px`   | tight gap                                                                       |
| `--ss-gap-xs`              | `4px`    | `6px`        | `8px`    | extra-small gap for dense intra-component lists (e.g. FileDrop files list)      |
| `--ss-block-gap`           | `16px`   | `28px`       | `36px`   | spacing between major blocks                                                    |
| `--ss-shell-side-w`        | `180px`  | `220px`      | `260px`  | app-shell sidebar width (layout)                                                |
| `--ss-shell-top-h`         | `36px`   | `48px`       | `56px`   | topbar height                                                                   |
| `--ss-main-py`             | `16px`   | `28px`       | `36px`   | main content padding-y                                                          |
| `--ss-main-px`             | `20px`   | `36px`       | `48px`   | main content padding-x                                                          |
| `--ss-side-w`              | `180px`  | `220px`      | `260px`  | Sidebar expanded width                                                          |
| `--ss-side-w-rail`         | `44px`   | `56px`       | `64px`   | Sidebar collapsed rail width                                                    |
| `--ss-side-badge-py`       | `1px`    | `2px`        | `3px`    | Sidebar item badge padding-y                                                    |
| `--ss-side-badge-px`       | `5px`    | `6px`        | `8px`    | Sidebar item badge padding-x                                                    |
| `--ss-toast-ic`            | `15px`   | `18px`       | `22px`   | Toast icon box                                                                  |
| `--ss-toast-swipe`         | `60px`   | `72px`       | `88px`   | Toast swipe-dismiss threshold                                                   |
| `--ss-empty-glyph`         | `32px`   | `40px`       | `52px`   | EmptyState visual glyph                                                         |
| `--ss-empty-glyph-compact` | `22px`   | `28px`       | `36px`   | EmptyState glyph (compact)                                                      |
| `--ss-empty-max-w`         | `360px`  | `420px`      | `480px`  | EmptyState content max-width                                                    |
| `--ss-spark-h`             | `14px`   | `18px`       | `26px`   | Sparkline height                                                                |
| `--ss-spark-bar-w`         | `2px`    | `3px`        | `4px`    | Sparkline bar width                                                             |
| `--ss-spark-gap`           | `1px`    | `1px`        | `2px`    | Sparkline bar gap                                                               |

`md` reproduces the original comfy values; `sm` the original compact dashboard;
`lg` is a new larger step. Global default is `md`; set it via `sizeVariant`, or per
component via the `size` prop / `componentsSize`.

### Component size tokens (`DS-0043`)

The components ported from the source website (`DS-0043`) keep their size-sensitive
metrics in per-component partials under `src/styles/components/` (joined by
`_index.scss`, the source of truth for the values below). Each rescales with the size
axis; reuse a shared token from the table above before adding a component-specific one.

**Micro-token naming convention (DS-0111).** A component that needs its own
size-stepped spacing names those tokens **`--ss-<name>-*`** and defines them per
`[data-size-variant]` on its root (Accordion's `--ss-acc-*` is the reference
shape). Inner padding/gap must read these tokens — never hardcoded px — so spacing
tightens/loosens in lockstep with the size axis. Pair this with passing the
resolved size explicitly into nested `Icon`/`Spinner` (see DESIGN.md → _Coordinated
inner sizes_).

**Menu** (`--ss-menu-*`)

| Token                | `sm`    | `md`    | `lg`    | Role                         |
| -------------------- | ------- | ------- | ------- | ---------------------------- |
| `--ss-menu-pad`      | `3px`   | `4px`   | `6px`   | Floating-panel inner padding |
| `--ss-menu-item-py`  | `5px`   | `8px`   | `11px`  | Row vertical padding         |
| `--ss-menu-item-px`  | `9px`   | `12px`  | `16px`  | Row horizontal padding       |
| `--ss-menu-item-gap` | `8px`   | `10px`  | `12px`  | Icon / label / marker gap    |
| `--ss-menu-min-w`    | `150px` | `180px` | `220px` | Panel min width              |
| `--ss-menu-offset`   | `5px`   | `6px`   | `8px`   | Trigger→panel offset         |

**SegmentedControl** (`--ss-seg-*`)

| Token           | `sm`         | `md`          | `lg`         | Role                       |
| --------------- | ------------ | ------------- | ------------ | -------------------------- |
| `--ss-seg-font` | `--ss-ui-sm` | `--ss-ui-md`  | `--ss-ui-lg` | Segment label size         |
| `--ss-seg-py`   | `4px`        | `7px`         | `10px`       | Segment vertical padding   |
| `--ss-seg-px`   | `9px`        | `14px`        | `20px`       | Segment horizontal padding |
| `--ss-seg-gap`  | `6px`        | `--ss-gap-sm` | `12px`       | Gap between segments       |

**Accordion** (`--ss-acc-*`)

| Token              | `sm`       | `md`          | `lg`       | Role                      |
| ------------------ | ---------- | ------------- | ---------- | ------------------------- |
| `--ss-acc-head-py` | `--ss-s-1` | `--ss-row-py` | `--ss-s-3` | Header vertical padding   |
| `--ss-acc-head-px` | `--ss-s-2` | `--ss-row-px` | `--ss-s-4` | Header horizontal padding |
| `--ss-acc-body-py` | `--ss-s-2` | `--ss-s-3`    | `--ss-s-4` | Panel vertical padding    |
| `--ss-acc-body-px` | `--ss-s-2` | `--ss-row-px` | `--ss-s-4` | Panel horizontal padding  |
| `--ss-acc-gap`     | `--ss-s-2` | `--ss-s-3`    | `--ss-s-4` | Header label/hint gap     |

The disclosure chevron is now the shared `Icon` `chevron` glyph (DS-0110), sized
to the resolved icon scale the Accordion passes it (DS-0111) — so it has no
dedicated size token; it follows `--ss-icon`.

**BottomNav** (`--ss-bottom-nav-*`) — derived from the shell/spacing scale (single tier):
`--ss-bottom-nav-h` (= `--ss-shell-top-h`, bar height), `--ss-bottom-nav-px` (= `--ss-s-2`,
tab horizontal padding), `--ss-bottom-nav-tab-py` (= `--ss-s-1`), `--ss-bottom-nav-gap`
(`4px`, glyph→label), `--ss-bottom-nav-label-fs` (= `--ss-ui-xs`).

**Image** (`--ss-image-*`) — size-sensitive chrome (the image itself is not scaled):

| Token                     | `sm`   | `md`    | `lg`    | Role                       |
| ------------------------- | ------ | ------- | ------- | -------------------------- |
| `--ss-image-glyph`        | `22px` | `28px`  | `36px`  | Error-fallback glyph       |
| `--ss-image-fallback-min` | `96px` | `120px` | `160px` | Min height without a ratio |
| `--ss-image-close`        | `30px` | `36px`  | `44px`  | Lightbox close hit area    |

Image also defines size-invariant tokens under `:root` (theme-aware where noted):
`--ss-image-frame-bg` (= `--ss-bg-elev`), `--ss-image-shimmer` (skeleton sweep, per-theme),
`--ss-image-shimmer-dur` (= `--ss-dur-xslow`), `--ss-image-focus-w` (`2px`),
`--ss-image-caption-gap` (= `--ss-s-2`), `--ss-image-backdrop` (lightbox scrim, per-theme),
`--ss-image-lightbox-z` (`1000`), `--ss-image-lightbox-pad` (= `--ss-s-8`).

(**Link** added no new tokens — it reuses the brand, motion, and chrome tokens above.)

### Component size tokens (`DS-0079`)

Adoption-gap components from the passoca migration. Same per-component-partial
pattern as `DS-0043` (`src/styles/components/`, joined by `_index.scss`).

**Heading** (`--ss-heading-*`)

| Token                 | `sm`                       | `md`                | `lg`                     | Role                                  |
| --------------------- | -------------------------- | ------------------- | ------------------------ | ------------------------------------- |
| `--ss-heading-size`   | `clamp(30px, 6.5vw, 44px)` | `--ss-size-display` | `clamp(44px, 9vw, 64px)` | Display heading font size             |
| `--ss-heading-mb`     | `--ss-s-3`                 | `--ss-s-4`          | `--ss-s-6`               | Bottom margin                         |
| `--ss-heading-shadow` | `2px`                      | `3px`               | `4px`                    | Background-colored text-shadow offset |

**Container** (`--ss-container-*`)

| Token                    | `sm`       | `md`           | `lg`        | Role                            |
| ------------------------ | ---------- | -------------- | ----------- | ------------------------------- |
| `--ss-container-max-w`   | `760px`    | `875px`        | `1000px`    | Content max width               |
| `--ss-container-px`      | `--ss-s-5` | `--ss-main-px` | `--ss-s-12` | Side gutters below max width    |
| `--ss-container-page-py` | `--ss-s-8` | `--ss-s-10`    | `--ss-s-12` | Vertical padding in `page` mode |

**Spinner** (`--ss-spinner-*`)

| Token               | `sm`   | `md`   | `lg`   | Role                  |
| ------------------- | ------ | ------ | ------ | --------------------- |
| `--ss-spinner-font` | `13px` | `16px` | `22px` | Frame glyph font size |

`--ss-spinner-color` is static (`:root` only): `var(--ss-primary)` — glyph + visible label color.

(**Textarea** added no new tokens — it reuses the `--ss-input-*` field tokens.)

### Component size tokens (`DS-0068`)

Chrome that previously hardcoded px, now size-aware (md = the former fixed values).

**BottomNav badge** (`--ss-bottom-nav-badge-*`)

| Token                         | `sm`   | `md`   | `lg`   | Role                                              |
| ----------------------------- | ------ | ------ | ------ | ------------------------------------------------- |
| `--ss-bottom-nav-badge-top`   | `-5px` | `-6px` | `-7px` | Badge lift above the tab glyph                    |
| `--ss-bottom-nav-badge-dx`    | `5px`  | `6px`  | `7px`  | Offset from glyph centre (`left: calc(50% + dx)`) |
| `--ss-bottom-nav-badge-min-w` | `12px` | `14px` | `16px` | Badge box min-width                               |
| `--ss-bottom-nav-badge-h`     | `12px` | `14px` | `16px` | Badge box height                                  |
| `--ss-bottom-nav-badge-fs`    | `8px`  | `9px`  | `10px` | Badge type size                                   |
| `--ss-bottom-nav-badge-px`    | `2px`  | `3px`  | `4px`  | Badge horizontal padding                          |

**LogStream** (`--ss-log-*` metrics)

| Token            | `sm`    | `md`    | `lg`    | Role                              |
| ---------------- | ------- | ------- | ------- | --------------------------------- |
| `--ss-log-min-h` | `120px` | `160px` | `200px` | Viewport floor                    |
| `--ss-log-max-h` | `200px` | `240px` | `320px` | Viewport ceiling (scrolls beyond) |
| `--ss-log-t-w`   | `52px`  | `58px`  | `64px`  | Timestamp column min-width        |
| `--ss-log-lvl-w` | `34px`  | `38px`  | `42px`  | Level column min-width            |

### Component override tokens (`DS-0133`)

**SearchPalette** (`--ss-search-palette-*`) — consumer-overridable knobs read as inline
`var(--ss-search-palette-*, fallback)` on the component (the Modal DS-0094 pattern; they are not
defined in the global stylesheet). The size axis only steps the panel width.

| Token                            | Default                     | Role                              |
| -------------------------------- | --------------------------- | --------------------------------- |
| `--ss-search-palette-w`          | `40rem` (sm `32` / lg `48`) | Panel width                       |
| `--ss-search-palette-max`        | `calc(100vw - --ss-s-8)`    | Panel max-width                   |
| `--ss-search-palette-top`        | `15vh`                      | Launcher offset from the top      |
| `--ss-search-palette-list-h`     | `60vh`                      | Results max-height (then scrolls) |
| `--ss-search-palette-input-pad`  | `--ss-s-4`                  | Input vertical padding            |
| `--ss-search-palette-input-size` | `--ss-ui-lg`                | Input type size                   |
| `--ss-search-palette-backdrop`   | `rgba(0, 0, 0, 0.62)`       | `::backdrop` wash                 |

## 3. Static tokens — not axis-controlled

Defined once under `:root`. Same in every theme/size.

### Fonts

| Token               | Value                                                                                | Purpose             |
| ------------------- | ------------------------------------------------------------------------------------ | ------------------- |
| `--ss-font-display` | `"Electrolize", "Space Grotesk", "Inter", system-ui, sans-serif`                     | Display headings    |
| `--ss-font-subhead` | `"Electrolize", "Space Grotesk", "Inter", system-ui, sans-serif`                     | h1–h3 subheads      |
| `--ss-font-body`    | `"JetBrains Mono", "Caskaydia Cove", ui-monospace, "SF Mono", Menlo, monospace`      | Body / default text |
| `--ss-font-alt`     | `"Electrolize", "Inter", system-ui, sans-serif`                                      | Alternate sans      |
| `--ss-font-mono`    | `"JetBrains Mono", "Caskaydia Cove Mono", ui-monospace, "SF Mono", Menlo, monospace` | Code / captions     |

### Content type scale

| Token               | Value                    | Purpose               |
| ------------------- | ------------------------ | --------------------- |
| `--ss-size-display` | `clamp(36px, 8vw, 54px)` | Display / hero titles |
| `--ss-size-h1`      | `32px`                   | h1                    |
| `--ss-size-h2`      | `24px`                   | h2                    |
| `--ss-size-h3`      | `20px`                   | h3                    |
| `--ss-size-body`    | `16px`                   | Body copy             |
| `--ss-size-sm`      | `14px`                   | Small text            |
| `--ss-size-xs`      | `12px`                   | Captions / micro copy |

### Spacing scale

`--ss-s-1` `4px` · `--ss-s-2` `8px` · `--ss-s-3` `12px` · `--ss-s-4` `16px` ·
`--ss-s-5` `20px` · `--ss-s-6` `24px` · `--ss-s-8` `32px` · `--ss-s-10` `40px` ·
`--ss-s-12` `48px` · `--ss-s-16` `64px`

### Radii

`--ss-radius-0 | -1 | -2 | -pill` — **all `0`** (house rule: zero border-radius,
never override).

### Elevation

| Token              | Value                                                            |
| ------------------ | ---------------------------------------------------------------- |
| `--ss-shadow-0`    | `none`                                                           |
| `--ss-shadow-1`    | `0 0 0 1px var(--ss-line)`                                       |
| `--ss-shadow-2`    | `0 1px 0 0 rgba(0,0,0,.4), 0 0 0 1px var(--ss-line)`             |
| `--ss-shadow-pop`  | `0 12px 40px rgba(0,0,0,.35)`                                    |
| `--ss-shadow-glow` | `0 0 24px color-mix(in srgb, var(--ss-accent) 35%, transparent)` |

### Motion

| Token                | Value                                 | Purpose                                 |
| -------------------- | ------------------------------------- | --------------------------------------- |
| `--ss-ease`          | `cubic-bezier(0.215, 0.61, 0.355, 1)` | Standard easing                         |
| `--ss-dur-fast`      | `150ms`                               | Micro transitions                       |
| `--ss-dur`           | `250ms`                               | Default transitions                     |
| `--ss-dur-slow`      | `350ms`                               | Larger moves                            |
| `--ss-dur-xslow`     | `650ms`                               | Sweeps / shimmers                       |
| `--ss-icon-spin-dur` | `900ms`                               | One full turn of the Icon `spin` loader |

Under `@media (prefers-reduced-motion: reduce)` the four `--ss-dur-*` tokens
collapse to `0ms` so CSS transitions that read them become instant (`DS-0013`).
(`--ss-icon-spin-dur` is not zeroed there — the Icon spin animation itself is
disabled in-component under reduced motion.)

## Legacy `.hs-*` typography classes — DEPRECATED

`src/styles/_base.scss` still ships the pre-rename typography helper classes
from the `hubssoca` era: `.hs-display`, `.hs-h1`, `.hs-h2`, `.hs-h3`, `.hs-p`,
`.hs-sm`, `.hs-caption`, `.hs-link`, `.hs-no-underline`, `.hs-mono`. They are
**deprecated** — kept only so existing markup doesn't break (removing or
renaming them to `.ss-*` is a breaking change; the `hs-` prefix violates the
house rule that reserves `ss-` for identity, see agile `DS-0005`/`DS-0072`).

- **Don't use them in new code.** Most have element-selector twins that need no
  class at all (`h1`–`h3`, `p`, `small`, `a`, `code`/`kbd`, `pre` are styled
  globally by `theme.css`); for display titles prefer the `Heading` component.
- They will be removed (or renamed `.ss-*`) in a future **major/breaking**
  release, coordinated via semver.

## Adding new chrome

Read size tokens, never hardcode px, or your component won't rescale when the
size flips. Pick the closest existing token before inventing a new one; if you
add one, give it an `sm`, `md`, and `lg` value and document it here.
