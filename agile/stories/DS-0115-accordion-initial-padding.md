---
id: DS-0115
type: story
title: "Accordion panel padding present from the first reveal frame"
status: backlog
priority: high
tags: [accordion, animation]
depends_on: []
parent: null
epic: DS-0107
created: 2026-06-21
updated: 2026-06-21
---

## Description
As a consumer of the Accordion, I want the panel content to animate open as a stable, already-padded block, because today the panel inner padding in `src/lib/components/Accordion.svelte` is applied only via the `.panel:not([hidden]) .panel-inner` selector — i.e. only once the panel is open. During the grid-rows reveal (`grid-template-rows: 0fr → 1fr`) the content renders with zero padding on the first frames and the padding "snaps/grows in" as the row expands, producing a visible jank where the text reflows mid-animation. I want the padding to be present from the very first render frame so the content height the animation measures is the final, padded height.

## Acceptance criteria
- [ ] The panel inner padding (`var(--ss-acc-body-py) var(--ss-acc-body-px)`) is applied unconditionally to the always-present inner wrapper that sits INSIDE the `0fr/1fr` grid clip, not toggled on the open state.
- [ ] The grid clip (`overflow: hidden` + `min-height: 0` on the clipped wrapper) continues to hide the padded content while collapsed, so the collapsed item shows no padding bleed and measures 0 height.
- [ ] Opening and closing animates the content as a single stable padded block — no reflow/snap of padding during the transition (verify visually at sm/md/lg).
- [ ] Collapsed-state height is still exactly 0 (no residual padding height) so adjacent items butt cleanly against the `1px solid var(--ss-line)` separators.
- [ ] `prefers-reduced-motion` behaviour is unchanged (instant collapse via `--ss-dur: 0ms`), padding still correct.
- [ ] No new tokens; zero border-radius preserved; styling stays scoped SCSS using `--ss-*` tokens.
- [ ] Tests added/updated; `pnpm test` green (vitest-axe where UI changes).
- [ ] Documentation updated (documentation/src/lib/docs.config.ts component page + docs/tokens.md / docs/themes.md as needed).

## Notes
- Refinement research: Radix Primitives' Accordion height-animation guidance and the broadly-adopted grid-template-rows reveal pattern both put padding on an inner content element while the OUTER wrapper animates `grid-template-rows` / height — the inner padded block is clipped by the `overflow: hidden` wrapper so the padding is laid out from frame zero rather than appearing on open. Radix exposes `--radix-accordion-content-height`/`-width` for the same reason: the measured content includes its final padding. The widely-cited CSS-grid accordion writeups stress using padding (not margins) on the inner content and `overflow: hidden; min-height: 0` on the clip so margins/padding don't throw off the height calc. Sources: https://www.radix-ui.com/primitives/docs/components/accordion , https://medium.com/likeacoffee-dev/creating-a-dynamic-height-accordion-with-css-grid-38bdb2e3a29b , https://qazuor.com/en/goodies/css-tricks/grid-animate-height/
- Implementation sketch: the existing markup already nests `.panel` (the `display: grid` clip) → `.panel-inner`. The clean fix is to keep `overflow: hidden; min-height: 0` on `.panel-inner` and move the padding onto an always-padded element it wraps (or apply padding to `.panel-inner` itself unconditionally and let the grid clip hide it), dropping the `.panel:not([hidden]) .panel-inner` padding toggle. Confirm the chosen nesting still measures 0 height when collapsed.
- Independent of the chevron/icon work (DS-0116) and the overflow prop (DS-0117); no `depends_on`.
