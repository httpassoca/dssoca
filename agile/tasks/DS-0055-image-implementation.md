---
id: DS-0055
type: task
title: "Image implementation"
status: done
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
- [x] **Responsive sources** — accepts `src` + optional `srcset`/`sizes` (or a `sources[]` for `<picture>`); renders semantic markup with required `alt`
- [x] **No layout shift** — aspect-ratio box from `width`/`height` or an explicit `ratio` prop reserves space before load
- [x] **Lazy + decode** — `loading="lazy"` + `decoding="async"` by default (overridable via `eager` for above-the-fold)
- [x] **Loading skeleton** — token-driven placeholder shown until load/error; respects `prefers-reduced-motion`; error fallback state
- [x] **Lightbox (optional)** — `lightbox?: boolean`; **dependency decision documented**: shipped a lightweight **built-in** dialog overlay (no PhotoSwipe dep → zero-runtime-dep). Lightbox uses `role="dialog"` + `aria-modal`, focus trap, `Esc`/backdrop close, restores focus to the trigger
- [x] **`size?: Size`** prop resolved via `resolveComponentSize('Image', size)` where size affects skeleton/chrome (not intrinsic image dims)
- [x] Exported from `src/lib/index.ts` (was already wired in the scaffold)
- [x] Tests added in `test/unit/Image.svelte.test.ts`; `pnpm test` green, `pnpm pack` clean
- [x] Docs: `Image` page fleshed out in `documentation/src/lib/component-docs/image.ts`; `pnpm docs:test` green

## Notes
- Story: [[ds-0049-image-component]] · Epic: [[DS-0043-new-components-from-website]].
- Source: `passoca/src/lib/components/Base/AppImage.svelte` (fetches variants from an API + PhotoSwipe — stripped the API coupling; kept the responsive/lightbox UX).
- Heaviest of the six; the lightbox dependency decision should be resolved before starting (keep dssoca's zero-runtime-dep posture in mind).
- **Decision (PhotoSwipe vs built-in):** chose a **built-in** dialog overlay. PhotoSwipe would add a
  runtime dependency + its own CSS, conflicting with dssoca's zero-runtime-dep, token-driven posture.
  The built-in overlay is ~40 lines, reads `--ss-*` tokens, and meets the WCAG dialog requirements.
- **New `--ss-*` tokens** (in `src/styles/components/_image.scss`): `--ss-image-frame-bg`,
  `--ss-image-shimmer`, `--ss-image-shimmer-dur`, `--ss-image-focus-w`, `--ss-image-caption-gap`,
  `--ss-image-backdrop`, `--ss-image-lightbox-z`, `--ss-image-lightbox-pad`, and the size-axis
  chrome metrics `--ss-image-glyph` / `--ss-image-fallback-min` / `--ss-image-close`.
