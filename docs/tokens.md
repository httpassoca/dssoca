# Design tokens

All tokens are CSS custom properties prefixed `--ss-`. They split into three
groups by which axis (if any) controls them. The source of truth is
`src/styles/_tokens.scss`; keep this file in sync with it.

## 1. Color tokens — controlled by `data-theme`

Defined under `:root, [data-theme="dark"]`; `[data-theme="light"]` overrides the
full color surface. Brand and status hues are darkened in light mode so they
hold WCAG AA contrast on the lighter surfaces; many tokens alias others (e.g.
`--ss-danger` → `--ss-red`, `--ss-success` → `--ss-primary`).

### Surfaces & lines

| Token | Dark | Light |
|---|---|---|
| `--ss-bg` | `#100f10` | `#f0f0f0` |
| `--ss-bg-elev` | `#1e1e1e` | `#ffffff` |
| `--ss-bg-elev-hover` | `#262626` | `#f4f4f4` |
| `--ss-bg-inset` | `rgba(7,6,7,0)` | `rgba(0,0,0,0)` |
| `--ss-line` | `rgba(255,255,255,.12)` | `rgba(0,0,0,.16)` |
| `--ss-line-strong` | `rgba(255,255,255,.22)` | `rgba(0,0,0,.30)` |
| `--ss-hover` | `rgba(255,255,255,.05)` | `rgba(0,0,0,.05)` |

### Foreground

| Token | Dark | Light |
|---|---|---|
| `--ss-fg` | `#e0e0e0` | `#1a1a1a` |
| `--ss-fg-shine` | `#ffffff` | `#000000` |
| `--ss-fg-muted` | `#aaaaaa` | `#525252` |
| `--ss-fg-faint` | `#8a8a8a` | `#5d5d5d` |
| `--ss-fg-on-primary` | `#100f10` | `#ffffff` |

`--ss-fg-faint` is tuned for WCAG AA (≥4.5:1) on both `--ss-bg` and
`--ss-bg-elev` in each theme (see agile `DS-0013`).

### Brand, lime & primary

| Token | Dark | Light |
|---|---|---|
| `--ss-primary` | `#66ef73` | `#157f3b` |
| `--ss-primary-soft` | `rgba(102,239,115,.18)` | `rgba(21,127,59,.12)` |
| `--ss-primary-rgb` | `102, 239, 115` | `21, 127, 59` |
| `--ss-primary-hover` | `#7df089` | `#0f6e31` |
| `--ss-lime` | `#a6e22e` | `#2f7a14` |

`--ss-lime` is the softer green for monospace/code accents (not the loud
primary). The light values are darkened so accents and the Button background
stay AA-legible.

### Status

| Token | Dark | Light |
|---|---|---|
| `--ss-red` | `#ff5c5c` | `#c62828` |
| `--ss-yellow` | `#e0c36a` | `#8a6d1a` |
| `--ss-blue` | `#9aa4ff` | `#2f3bd6` |
| `--ss-cyan` | `#66d9ef` | `#0b6e7d` |
| `--ss-purple` | `#b98cff` | `#6a35c9` |
| `--ss-red-rgb` | `255, 92, 92` | `198, 40, 40` |

`--ss-red-rgb` backs the soft invalid focus ring (`DS-0033`).

### Destructive & sentiment

Decouple good/bad meaning from up/down direction (`DS-0032`, `DS-0037`).
`--ss-danger` aliases `--ss-red`, `--ss-success` aliases `--ss-primary`; the
soft variants back the opt-in emphasis chip so colour is never the only signal.

| Token | Dark | Light |
|---|---|---|
| `--ss-danger` | `var(--ss-red)` | `var(--ss-red)` |
| `--ss-danger-hover` | `#ff7a7a` | `#a91f1f` |
| `--ss-danger-soft` | `rgba(255,92,92,.18)` | `rgba(198,40,40,.12)` |
| `--ss-fg-on-danger` | `#100f10` | `#ffffff` |
| `--ss-success` | `var(--ss-primary)` | `var(--ss-primary)` |
| `--ss-success-soft` | `var(--ss-primary-soft)` | `var(--ss-primary-soft)` |

### Skeleton

| Token | Dark | Light |
|---|---|---|
| `--ss-skeleton` | `rgba(255,255,255,.10)` | `rgba(0,0,0,.10)` |

Neutral wash for loading bars (`DS-0037`).

### Code

| Token | Dark | Light |
|---|---|---|
| `--ss-code-bg` | `#011627` | `#f5f5f5` |
| `--ss-code-fg` | `#d6deeb` | `#24292e` |
| `--ss-code-string` | `#addb67` | `#1f7a33` |
| `--ss-code-number` | `#f78c6c` | `#b35309` |
| `--ss-code-keyword` | `#c792ea` | `#c5221f` |
| `--ss-code-func` | `#82aaff` | `#6639ba` |
| `--ss-code-comment` | `#637777` | `#6a737d` |

### Log-level accents

Theme-correct on the code surface (`DS-0040`).

| Token | Value (both themes) |
|---|---|
| `--ss-log-info` | `var(--ss-code-func)` |
| `--ss-log-warn` | `var(--ss-yellow)` |
| `--ss-log-err` | `var(--ss-red)` |
| `--ss-log-ok` | `var(--ss-code-string)` |

### Selection

`--ss-selection-bg` (`var(--ss-primary)`) and `--ss-selection-fg`
(`var(--ss-fg-on-primary)`) — defined on the dark root and inherited.

### Badge tones

Theme-tracked fills/borders per tone so the washes read in both themes
(`DS-0031`). The text colour tracks the matching status token. Tones:
`up`, `deg`, `down`, `maint`, `info`, `neutral`.

| Token | Dark | Light |
|---|---|---|
| `--ss-badge-up-bg` | `rgba(102,239,115,.12)` | `rgba(21,127,59,.10)` |
| `--ss-badge-up-border` | `rgba(102,239,115,.40)` | `rgba(21,127,59,.35)` |
| `--ss-badge-deg-bg` | `rgba(224,195,106,.12)` | `rgba(138,109,26,.10)` |
| `--ss-badge-deg-border` | `rgba(224,195,106,.40)` | `rgba(138,109,26,.35)` |
| `--ss-badge-down-bg` | `rgba(255,92,92,.12)` | `rgba(198,40,40,.10)` |
| `--ss-badge-down-border` | `rgba(255,92,92,.40)` | `rgba(198,40,40,.35)` |
| `--ss-badge-maint-bg` | `rgba(154,164,255,.12)` | `rgba(47,59,214,.10)` |
| `--ss-badge-maint-border` | `rgba(154,164,255,.40)` | `rgba(47,59,214,.35)` |
| `--ss-badge-info-bg` | `rgba(102,217,239,.12)` | `rgba(11,110,125,.10)` |
| `--ss-badge-info-border` | `rgba(102,217,239,.40)` | `rgba(11,110,125,.35)` |
| `--ss-badge-neutral-bg` | `rgba(255,255,255,.06)` | `rgba(0,0,0,.05)` |
| `--ss-badge-neutral-border` | `var(--ss-line)` | `var(--ss-line)` |

## 2. Size tokens — controlled by `data-size-variant`

Defined under `:root, [data-size-variant="md"]` (the default); `[data-size-variant="sm"]`
and `[data-size-variant="lg"]` override them. These rescale the entire chrome.
(Renamed from the density axis in 0.4.0: `sm` ← compact, `md` ← comfy, `lg` new.)

| Token | sm | md (default) | lg | Drives |
|---|---|---|---|---|
| `--ss-leading` | `1.3` | `1.5` | `1.6` | html / body line-height |
| `--ss-ui-xs` | `9.5px` | `11px` | `12.5px` | micro uppercase labels |
| `--ss-ui-sm` | `10.5px` | `12px` | `13.5px` | secondary chrome text |
| `--ss-ui-md` | `11.5px` | `13px` | `15px` | primary chrome text |
| `--ss-ui-lg` | `13px` | `15px` | `17px` | names, logo |
| `--ss-icon` | `14px` | `16px` | `20px` | Icon default size |
| `--ss-control-font` | `12px` | `14px` | `16px` | buttons |
| `--ss-control-py` | `5px` | `9px` | `12px` | button padding-y |
| `--ss-control-px` | `9px` | `16px` | `22px` | button padding-x |
| `--ss-input-font` | `14px` | `15px` | `17px` | inputs |
| `--ss-input-py` | `10px` | `13px` | `17px` | input padding-y |
| `--ss-input-px` | `12px` | `16px` | `20px` | input padding-x |
| `--ss-panel-head-py` | `7px` | `12px` | `16px` | panel header padding-y |
| `--ss-panel-head-px` | `12px` | `18px` | `24px` | panel header padding-x |
| `--ss-panel-body-py` | `10px` | `18px` | `24px` | panel body padding-y |
| `--ss-panel-body-px` | `12px` | `18px` | `24px` | panel body padding-x |
| `--ss-card-py` | `10px` | `16px` | `22px` | metric / service card padding-y |
| `--ss-card-px` | `12px` | `18px` | `24px` | metric / service card padding-x |
| `--ss-metric-val` | `26px` | `32px` | `40px` | metric tile value size |
| `--ss-row-py` | `5px` | `9px` | `12px` | nav rows, table cells padding-y |
| `--ss-row-px` | `10px` | `14px` | `18px` | nav rows, table cells padding-x |
| `--ss-badge-py` | `3px` | `5px` | `7px` | badge padding-y |
| `--ss-badge-px` | `8px` | `12px` | `16px` | badge padding-x |
| `--ss-badge-dot` | `4px` | `5px` | `6px` | badge status-dot size |
| `--ss-badge-gap` | `5px` | `6px` | `7px` | badge inner gap |
| `--ss-gap` | `8px` | `14px` | `18px` | default grid/flex gap |
| `--ss-gap-sm` | `6px` | `10px` | `13px` | tight gap |
| `--ss-block-gap` | `16px` | `28px` | `36px` | spacing between major blocks |
| `--ss-shell-side-w` | `180px` | `220px` | `260px` | app-shell sidebar width (layout) |
| `--ss-shell-top-h` | `36px` | `48px` | `56px` | topbar height |
| `--ss-main-py` | `16px` | `28px` | `36px` | main content padding-y |
| `--ss-main-px` | `20px` | `36px` | `48px` | main content padding-x |
| `--ss-side-w` | `180px` | `220px` | `260px` | Sidebar expanded width |
| `--ss-side-w-rail` | `44px` | `56px` | `64px` | Sidebar collapsed rail width |
| `--ss-side-badge-py` | `1px` | `2px` | `3px` | Sidebar item badge padding-y |
| `--ss-side-badge-px` | `5px` | `6px` | `8px` | Sidebar item badge padding-x |
| `--ss-toast-ic` | `15px` | `18px` | `22px` | Toast icon box |
| `--ss-toast-swipe` | `60px` | `72px` | `88px` | Toast swipe-dismiss threshold |
| `--ss-empty-glyph` | `32px` | `40px` | `52px` | EmptyState visual glyph |
| `--ss-empty-glyph-compact` | `22px` | `28px` | `36px` | EmptyState glyph (compact) |
| `--ss-empty-max-w` | `360px` | `420px` | `480px` | EmptyState content max-width |
| `--ss-spark-h` | `14px` | `18px` | `26px` | Sparkline height |
| `--ss-spark-bar-w` | `2px` | `3px` | `4px` | Sparkline bar width |
| `--ss-spark-gap` | `1px` | `1px` | `2px` | Sparkline bar gap |

`md` reproduces the original comfy values; `sm` the original compact dashboard;
`lg` is a new larger step. Global default is `md`; set it via `sizeVariant`, or per
component via the `size` prop / `componentsSize`.

## 3. Static tokens — not axis-controlled

Defined once under `:root`. Same in every theme/size.

- **Fonts:** `--ss-font-display | -subhead | -body | -alt | -mono`
- **Content type scale:** `--ss-size-display | -h1 | -h2 | -h3 | -body | -sm | -xs`
- **Spacing scale:** `--ss-s-1 … --ss-s-16` (4 → 64px)
- **Radii:** `--ss-radius-0 | -1 | -2 | -pill` — **all `0`** (house rule)
- **Elevation:** `--ss-shadow-0 | -1 | -2 | -pop | -glow`
- **Motion:** `--ss-ease`, `--ss-dur-fast | -dur | -dur-slow | -dur-xslow`,
  and `--ss-icon-spin-dur` (`900ms` — one full turn for the Icon `spin` loader;
  disabled under reduced motion).

Under `@media (prefers-reduced-motion: reduce)` the four `--ss-dur-*` tokens
collapse to `0ms` so CSS transitions that read them become instant (`DS-0013`).

## Adding new chrome

Read size tokens, never hardcode px, or your component won't rescale when the
size flips. Pick the closest existing token before inventing a new one; if you
add one, give it an `sm`, `md`, and `lg` value and document it here.
