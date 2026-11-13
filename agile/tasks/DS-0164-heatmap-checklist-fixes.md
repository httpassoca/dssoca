---
id: DS-0164
type: task
title: "Heatmap: Front-End Checklist fixes"
status: done
priority: high
tags: [a11y, components]
depends_on: []
parent: DS-0161
epic: null
created: 2026-11-13
updated: 2026-11-13
---

## Description

Fixes the Heatmap findings from GitHub issue #139 (Front-End Checklist audit), including the
cross-cutting chart findings.

### High · color-contrast: value text on strong cells — fixed

Confirmed: `.cell-text` was always `--ss-fg` over `--ss-primary` at `fill-opacity` 0.12–1.

Measured from the `_tokens.scss` slot values (sRGB alpha compositing of `--ss-primary` over
`--ss-bg`, WCAG 2 relative luminance; text is `--ss-ui-xs`, so the target is 4.5:1):

| cell opacity | dark: `--ss-fg` | dark: `--ss-fg-on-primary` (= `--ss-bg`) | light: `--ss-fg` | light: `--ss-fg-on-primary` (= `--ss-bright-white`) |
| ------------ | --------------- | ---------------------------------------- | ---------------- | --------------------------------------------------- |
| 0.12         | 11.26           | 1.27                                     | 12.01            | 1.29                                                |
| 0.48         | 3.86            | 3.70                                     | 7.25             | 2.14                                                |
| 0.56         | 3.08            | 4.63                                     | 6.41             | 2.43                                                |
| 0.88         | 1.41            | 10.09                                    | 3.77             | 4.12                                                |
| 1.00         | 1.11            | 12.90                                    | 3.06             | 5.08                                                |

The suggested threshold flip doesn't work. Even choosing the best of `--ss-fg`,
`--ss-fg-on-primary` and `--ss-bg` separately at every opacity, the worst case is
**3.80:1 (dark, at about 0.48)** and **3.97:1 (light, at about 0.86)**. The crossover points
also differ by theme (about 0.5 in dark and 0.86 in light), so one threshold can't serve both
themes.

Fix (existing tokens only, no new token): the value text keeps `fill: var(--ss-fg)` and gets an
`--ss-bg` halo (`stroke: var(--ss-bg); stroke-width: 0.3em; paint-order: stroke fill`). The
glyph's immediate background is therefore always `--ss-bg`, at any cell opacity:
**`--ss-fg` on `--ss-bg` = 14.26:1 (dark), 13.98:1 (light)**. The halo scales with the font size
because it is em-based.

### Medium · aria-roles / tabindex — fixed

Cells used to be `role="button" tabindex="0"`, so every value cell was a tab stop. The cells now
sit in `<g role="grid">` > `<g role="row">` (one per row) > `<rect role="gridcell">`. Null cells
are gridcells too, named `"<row> vs <col>: no value"`, which keeps the 2-D geometry intact for
navigation. The tab stop roves: only one cell has `tabindex="0"` (index 0 by default, then the
last focused cell) and every other cell has `-1`. A `keydown` handler calls
`chartNavStep(key, i, count, cols)`, then calls `preventDefault` and focuses the new cell. Arrow
keys stay physical in RTL because the SVG geometry doesn't mirror.

### Cross-cutting · tooltip `role="status"` / Escape — fixed

The tooltip is now `aria-hidden="true"` and no longer has a role. The cell `aria-label` already
holds row, column and value, so the tooltip carries no extra data. A window-level Escape listener
hides the tooltip while it is open, including one opened by hover with focus elsewhere
(WCAG 1.4.13).

### Low · sensory-instructions: no legend — fixed

When `showValues={false}`, a min→max legend renders under the grid: the formatted domain minimum
and maximum, plus a 5-step `--ss-primary` opacity ramp taken from the same scale. It is
`aria-hidden`, because each cell's accessible name already gives its value. No new prop was
added.

### Low · aria-text: `cell-text` duplicates the label — fixed

`.cell-text` now has `aria-hidden="true"`.

### Also

- Added keys to the header `{#each}` blocks, which clears 2 pre-existing eslint warnings.
- Docs updated: description, `notes` (keyboard and tooltip), `showValues`/`tooltip` props, and
  the `htmlExample` note (vanilla.js doesn't wire the arrow keys). The story's `showValues`
  description is updated too.

### Tests (`test/unit/Heatmap.svelte.test.ts`)

- The structure is grid > 4 rows > 4 gridcells, with no `role="button"` left, and the null cell
  is named "no value".
- There is a single tab stop (only cell 0 has `tabindex="0"`).
- Arrow, Home and End navigation moves focus, the tab stop roves, and movement clamps at the
  edge.
- `preventDefault` applies only to navigation keys.
- `.cell-text` has `aria-hidden`.
- The legend appears with `showValues={false}` and shows min and max; it is absent by default.
- The tooltip is `aria-hidden` and has no role; Escape hides it, and so does Escape on
  `document.body` after a hover.
- axe passes with the legend shown.

Contrast is not observable in jsdom, so it was verified numerically (table above) and still
needs a real-browser visual check.
