---
id: DS-0112
type: story
title: "Button — leading/trailing icons must not increase button height"
status: backlog
priority: high
tags: [button, layout]
depends_on: [DS-0109]
parent: null
epic: DS-0107
created: 2026-06-21
updated: 2026-06-21
---

## Description
As a dssoca consumer, I want a `Button` that keeps the same height whether or not it has a
`leading`/`trailing` icon, so that mixed rows of buttons (text-only next to icon+text) stay on a
single visual baseline and don't jitter.

Current behaviour: in `src/lib/components/Button.svelte` the control height is meant to be governed
by `padding: var(--ss-control-py) var(--ss-control-px)` plus the text `line-height: 1`. When an
icon snippet is rendered, it goes inside `<span class="affix">` (inline-flex, `line-height: 0`).
The affix zeroes its own line-box, but the icon's intrinsic box (an SVG/glyph sized to roughly
`var(--ss-icon)` — see [[DS-0109-icon-size-scale]]) can exceed the button's text line-box. Because
`.ss-btn` is `display: inline-flex; align-items: center`, the tallest child wins and the control
grows: an icon button ends up a few px taller than its text-only sibling. The `line-height: 0` on
`.affix` does not clamp the child's own height, so it does not fix this.

Desired behaviour: button height is a function of control padding + the text line-box only, and is
invariant to the presence of icons, at every size tier (`sm`/`md`/`lg`). The icon should be
vertically centred within that fixed line-box (clamped so a slightly-too-tall icon never pushes the
control taller), matching the icon-only square button's height as well.

## Acceptance criteria
- [ ] At each size tier (sm/md/lg), a button with a `leading` and/or `trailing` icon has the **same
      offsetHeight** as an otherwise-identical text-only button (measurable invariant).
- [ ] The icon-only square button (`iconOnly`) keeps the same height as the equivalent text button
      at the same size tier.
- [ ] The icon is vertically centred within the control; clamping the icon box does not crop or
      distort the glyph at any size.
- [ ] Fix is scoped SCSS in `Button.svelte` using `--ss-*` tokens only (no hardcoded px, no
      border-radius override); `.affix`/internal names stay plain and unprefixed.
- [ ] Regression test added: render text-only vs leading vs trailing vs both at sm/md/lg and assert
      equal heights (a height-invariance harness).
- [ ] Tests added/updated; `pnpm test` green (vitest-axe where UI changes).
- [ ] Documentation updated (documentation/src/lib/docs.config.ts component page + docs/tokens.md /
      docs/themes.md as needed).

## Notes
- Refinement research:
  - **IBM Carbon** gives buttons a fixed height per size tier (e.g. 32/40/48px) and pairs them with
    icons from a fixed icon scale (16/20/24px tuned to the 14/16px type) so the icon never changes
    the control height — the height is owned by the button, the icon merely sits inside it.
    (carbondesignsystem.com — Button style/usage, Icons usage.)
  - **MUI**: the standard `Button` startIcon/endIcon wrappers use `display: inherit` with the icon
    font-size pinned to the size tier, and `IconButton` keeps a deterministic box; height is driven
    by padding + line-height, not by the icon. (mui.com — Button / IconButton API.)
  - **Polaris** sizes button content from a fixed control height and centres icon + label inside it,
    so swapping text for icon+text doesn't reflow the control.
  - Takeaway adopted here: own the line-box. Pin the icon's box to the text cap/line height (e.g.
    constrain the `.affix` child to the control's line-box and center it) so the icon can never make
    `align-items: center` grow the flex container.
- File refs: `src/lib/components/Button.svelte` (`.ss-btn` padding/line-height, `.affix`
  `line-height: 0`, `&.icon-only` square padding). Depends on [[DS-0109-icon-size-scale]] because the
  icon px is set there; the clamp must reference that resolved scale, not a magic number.
- Cross-links: [[DS-0109-icon-size-scale]], [[DS-0111-coordinated-inner-sizes]].
