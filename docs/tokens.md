# Design tokens

All tokens are CSS custom properties prefixed `--hs-`. They split into three
groups by which axis (if any) controls them.

## 1. Color tokens — controlled by `data-theme`

Defined under `:root, [data-theme="dark"]`; `[data-theme="light"]` overrides the
surface/foreground subset. Brand, status, and code colors are shared across
themes.

| Token | Dark | Light |
|---|---|---|
| `--hs-bg` | `#100f10` | `#fefefe` |
| `--hs-bg-elev` | `#1e1e1e` | `#ffffff` |
| `--hs-line` | `rgba(255,255,255,.12)` | `rgba(0,0,0,.12)` |
| `--hs-line-strong` | `rgba(255,255,255,.22)` | `rgba(0,0,0,.22)` |
| `--hs-fg` | `#e0e0e0` | `#000000` |
| `--hs-fg-shine` | `#ffffff` | `#000000` |
| `--hs-fg-muted` | `#aaaaaa` | `#626262` |
| `--hs-fg-faint` | `#6f6f6f` | `#888888` |
| `--hs-fg-on-primary` | `#100f10` | `#100f10` |

Shared (both themes): `--hs-primary #66ef73`, `--hs-primary-soft`,
`--hs-primary-rgb`, status `--hs-red/yellow/blue/cyan/purple`, and the
`--hs-code-*` palette.

## 2. Density tokens — controlled by `data-density`

Defined under `:root, [data-density="comfy"]`; `[data-density="compact"]`
overrides them. These rescale the entire chrome.

| Token | Comfy (default) | Compact (hub) | Drives |
|---|---|---|---|
| `--hs-leading` | `1.5` | `1.3` | html / body line-height |
| `--hs-ui-xs` | `11px` | `9.5px` | micro uppercase labels |
| `--hs-ui-sm` | `12px` | `10.5px` | secondary chrome text |
| `--hs-ui-md` | `13px` | `11.5px` | primary chrome text |
| `--hs-ui-lg` | `15px` | `13px` | names, logo |
| `--hs-control-font` | `14px` | `12px` | buttons |
| `--hs-control-py` | `9px` | `5px` | button padding-y |
| `--hs-control-px` | `16px` | `9px` | button padding-x |
| `--hs-input-font` | `15px` | `14px` | inputs |
| `--hs-input-py` | `13px` | `10px` | input padding-y |
| `--hs-input-px` | `16px` | `12px` | input padding-x |
| `--hs-panel-head-py` | `12px` | `7px` | panel header padding-y |
| `--hs-panel-head-px` | `18px` | `12px` | panel header padding-x |
| `--hs-panel-body-py` | `18px` | `10px` | panel body padding-y |
| `--hs-panel-body-px` | `18px` | `12px` | panel body padding-x |
| `--hs-card-py` | `16px` | `10px` | metric / service card padding-y |
| `--hs-card-px` | `18px` | `12px` | metric / service card padding-x |
| `--hs-metric-val` | `32px` | `26px` | metric tile value size |
| `--hs-row-py` | `9px` | `5px` | nav rows, table cells padding-y |
| `--hs-row-px` | `14px` | `10px` | nav rows, table cells padding-x |
| `--hs-badge-py` | `5px` | `3px` | badge padding-y |
| `--hs-badge-px` | `12px` | `8px` | badge padding-x |
| `--hs-gap` | `14px` | `8px` | default grid/flex gap |
| `--hs-gap-sm` | `10px` | `6px` | tight gap |
| `--hs-block-gap` | `28px` | `16px` | spacing between major blocks |
| `--hs-shell-side-w` | `220px` | `180px` | sidebar width |
| `--hs-shell-top-h` | `48px` | `36px` | topbar height |
| `--hs-main-py` | `28px` | `16px` | main content padding-y |
| `--hs-main-px` | `36px` | `20px` | main content padding-x |

Compact values reproduce the original hand-tuned dashboard (±1px on a few rules
where neighboring values were unified into one token).

## 3. Static tokens — not axis-controlled

Defined once under `:root`. Same in every theme/density.

- **Fonts:** `--hs-font-display | -subhead | -body | -alt | -mono`
- **Content type scale:** `--hs-size-display | -h1 | -h2 | -h3 | -body | -sm | -xs`
- **Spacing scale:** `--hs-s-1 … --hs-s-16` (4 → 64px)
- **Radii:** `--hs-radius-0 | -1 | -2 | -pill` — **all `0`** (house rule)
- **Elevation:** `--hs-shadow-0 | -1 | -2 | -pop | -glow`
- **Motion:** `--hs-ease`, `--hs-dur-fast | -dur | -dur-slow | -dur-xslow`

## Adding new chrome

Read density tokens, never hardcode px, or your component won't rescale when the
density flips. Pick the closest existing token before inventing a new one; if
you add one, give it both a comfy and a compact value and document it here.
