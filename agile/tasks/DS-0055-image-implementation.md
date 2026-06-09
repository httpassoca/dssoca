---
id: DS-0055
type: task
title: "Image implementation"
status: backlog
priority: low
tags: [ui, a11y, media]
depends_on: []
parent: DS-0049
epic: DS-0043
created: 2026-06-09
updated: 2026-06-09
---

## Description
Build a new `Image` component at `src/lib/components/Image.svelte`, based on the website's `AppImage.svelte`
but decoupled from its bespoke image API. Keep it token-driven (zero radius, `--ss-*` tokens, scoped SCSS,
Svelte 5 runes).

## Acceptance criteria
- [ ] **Responsive sources** — accepts `src` + optional `srcset`/`sizes` (or a `sources[]` for `<picture>`); renders semantic markup with required `alt`
- [ ] **No layout shift** — aspect-ratio box from `width`/`height` or an explicit `ratio` prop reserves space before load
- [ ] **Lazy + decode** — `loading="lazy"` + `decoding="async"` by default (overridable for above-the-fold)
- [ ] **Loading skeleton** — token-driven placeholder shown until load/error; respects `prefers-reduced-motion`; error fallback state
- [ ] **Lightbox (optional)** — `lightbox?: boolean`; **dependency decision documented**: depend on PhotoSwipe (optional/peer dep) vs ship a lightweight built-in dialog overlay (recommend built-in to keep zero-dep). Lightbox uses `role="dialog"`, focus trap, `Esc` to close
- [ ] **`size?: Size`** prop resolved via `resolveComponentSize('Image', size)` where size affects skeleton/chrome (not intrinsic image dims)
- [ ] Exported from `src/lib/index.ts`
- [ ] Tests added in `test/unit/Image.svelte.test.ts`; `pnpm test` green, `pnpm pack` clean
- [ ] Docs: `Image` page added to `documentation/src/lib/docs.config.ts`; `pnpm docs:test` green

## Notes
- Story: [[ds-0049-image-component]] · Epic: [[DS-0043-new-components-from-website]].
- Source: `passoca/src/lib/components/Base/AppImage.svelte` (fetches variants from an API + PhotoSwipe — strip the API coupling; keep the responsive/lightbox UX).
- Heaviest of the six; the lightbox dependency decision should be resolved before starting (keep dssoca's zero-runtime-dep posture in mind).
