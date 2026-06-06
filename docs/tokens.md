# Design tokens

All tokens are CSS custom properties prefixed `--ss-`. They split into three
groups by which axis (if any) controls them.

## 1. Color tokens — controlled by `data-theme`

Defined under `:root, [data-theme="dark"]`; `[data-theme="light"]` overrides the
surface/foreground subset. Brand, status, and code colors are shared across
themes.

| Token | Dark | Light |
|---|---|---|
| `--ss-bg` | `#100f10` | `#fefefe` |
| `--ss-bg-elev` | `#1e1e1e` | `#ffffff` |
| `--ss-line` | `rgba(255,255,255,.12)` | `rgba(0,0,0,.12)` |
| `--ss-line-strong` | `rgba(255,255,255,.22)` | `rgba(0,0,0,.22)` |
| `--ss-fg` | `#e0e0e0` | `#000000` |
| `--ss-fg-shine` | `#ffffff` | `#000000` |
| `--ss-fg-muted` | `#aaaaaa` | `#626262` |
| `--ss-fg-faint` | `#6f6f6f` | `#888888` |
| `--ss-fg-on-primary` | `#100f10` | `#100f10` |

Shared (both themes): `--ss-primary #66ef73`, `--ss-primary-soft`,
`--ss-primary-rgb`, status `--ss-red/yellow/blue/cyan/purple`, and the
`--ss-code-*` palette.

## 2. Density tokens — controlled by `data-density`

Defined under `:root, [data-density="comfy"]`; `[data-density="compact"]`
overrides them. These rescale the entire chrome.

| Token | Comfy (default) | Compact (hub) | Drives |
|---|---|---|---|
| `--ss-leading` | `1.5` | `1.3` | html / body line-height |
| `--ss-ui-xs` | `11px` | `9.5px` | micro uppercase labels |
| `--ss-ui-sm` | `12px` | `10.5px` | secondary chrome text |
| `--ss-ui-md` | `13px` | `11.5px` | primary chrome text |
| `--ss-ui-lg` | `15px` | `13px` | names, logo |
| `--ss-control-font` | `14px` | `12px` | buttons |
| `--ss-control-py` | `9px` | `5px` | button padding-y |
| `--ss-control-px` | `16px` | `9px` | button padding-x |
| `--ss-input-font` | `15px` | `14px` | inputs |
| `--ss-input-py` | `13px` | `10px` | input padding-y |
| `--ss-input-px` | `16px` | `12px` | input padding-x |
| `--ss-panel-head-py` | `12px` | `7px` | panel header padding-y |
| `--ss-panel-head-px` | `18px` | `12px` | panel header padding-x |
| `--ss-panel-body-py` | `18px` | `10px` | panel body padding-y |
| `--ss-panel-body-px` | `18px` | `12px` | panel body padding-x |
| `--ss-card-py` | `16px` | `10px` | metric / service card padding-y |
| `--ss-card-px` | `18px` | `12px` | metric / service card padding-x |
| `--ss-metric-val` | `32px` | `26px` | metric tile value size |
| `--ss-row-py` | `9px` | `5px` | nav rows, table cells padding-y |
| `--ss-row-px` | `14px` | `10px` | nav rows, table cells padding-x |
| `--ss-badge-py` | `5px` | `3px` | badge padding-y |
| `--ss-badge-px` | `12px` | `8px` | badge padding-x |
| `--ss-gap` | `14px` | `8px` | default grid/flex gap |
| `--ss-gap-sm` | `10px` | `6px` | tight gap |
| `--ss-block-gap` | `28px` | `16px` | spacing between major blocks |
| `--ss-shell-side-w` | `220px` | `180px` | sidebar width |
| `--ss-shell-top-h` | `48px` | `36px` | topbar height |
| `--ss-main-py` | `28px` | `16px` | main content padding-y |
| `--ss-main-px` | `36px` | `20px` | main content padding-x |

Compact values reproduce the original hand-tuned dashboard (±1px on a few rules
where neighboring values were unified into one token).

## 3. Static tokens — not axis-controlled

Defined once under `:root`. Same in every theme/density.

- **Fonts:** `--ss-font-display | -subhead | -body | -alt | -mono`
- **Content type scale:** `--ss-size-display | -h1 | -h2 | -h3 | -body | -sm | -xs`
- **Spacing scale:** `--ss-s-1 … --ss-s-16` (4 → 64px)
- **Radii:** `--ss-radius-0 | -1 | -2 | -pill` — **all `0`** (house rule)
- **Elevation:** `--ss-shadow-0 | -1 | -2 | -pop | -glow`
- **Motion:** `--ss-ease`, `--ss-dur-fast | -dur | -dur-slow | -dur-xslow`

## Adding new chrome

Read density tokens, never hardcode px, or your component won't rescale when the
density flips. Pick the closest existing token before inventing a new one; if
you add one, give it both a comfy and a compact value and document it here.
