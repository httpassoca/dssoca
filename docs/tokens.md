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
| `--ss-icon` | `14px` | `16px` | `20px` | Icon / PassocaMark default size |
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
| `--ss-gap` | `8px` | `14px` | `18px` | default grid/flex gap |
| `--ss-gap-sm` | `6px` | `10px` | `13px` | tight gap |
| `--ss-block-gap` | `16px` | `28px` | `36px` | spacing between major blocks |
| `--ss-shell-side-w` | `180px` | `220px` | `260px` | sidebar width |
| `--ss-shell-top-h` | `36px` | `48px` | `56px` | topbar height |
| `--ss-main-py` | `16px` | `28px` | `36px` | main content padding-y |
| `--ss-main-px` | `20px` | `36px` | `48px` | main content padding-x |

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
- **Motion:** `--ss-ease`, `--ss-dur-fast | -dur | -dur-slow | -dur-xslow`

## Adding new chrome

Read size tokens, never hardcode px, or your component won't rescale when the
size flips. Pick the closest existing token before inventing a new one; if you
add one, give it an `sm`, `md`, and `lg` value and document it here.
