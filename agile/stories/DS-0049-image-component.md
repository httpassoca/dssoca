---
id: DS-0049
type: story
title: "Image component"
status: done
priority: low
tags: [ui, a11y, media]
depends_on: []
parent: null
epic: DS-0043
created: 2026-06-09
updated: 2026-06-09
---

## Description
As a `dssoca` consumer, I want an **Image** component — a responsive `<picture>` with `srcset`, lazy
loading, an aspect-ratio box to prevent layout shift, a loading skeleton, and an optional lightbox — so
content images render performantly and consistently. The website's `AppImage.svelte` is the reference
(responsive sources, lazy load, aspect-ratio calc, skeleton loader, and a PhotoSwipe lightbox). The
design-system version must decide whether to depend on PhotoSwipe or ship a lighter built-in overlay
(see the task's acceptance criteria).

## Acceptance criteria
- [x] `Image` gains the behaviour tracked in [[ds-0055-image-implementation]] (the per-component task)
- [x] Changes are additive — new file + barrel export; no existing component touched
- [x] Lightbox dependency decision (PhotoSwipe vs built-in overlay) made and documented
- [x] New chrome reads `--ss-*` tokens; skeleton respects reduced-motion; respects zero border-radius
- [x] WCAG 2.2 AA upheld (alt text, dialog semantics for the lightbox); `pnpm test` green and `pnpm pack` clean

## Notes
- Part of epic [[DS-0043-new-components-from-website]].
- Concrete work is the single task [[ds-0055-image-implementation]]; the detailed checklist lives there.
- Source: `passoca/src/lib/components/Base/AppImage.svelte`.
- **Decision:** shipped a lightweight **built-in** lightbox (a `role="dialog"` overlay with focus
  trap + Esc/backdrop close) rather than depending on PhotoSwipe — keeps dssoca zero-runtime-dep.
