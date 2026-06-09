---
id: DS-0051
type: task
title: "Accordion implementation"
status: done
priority: low
tags: [ui, a11y]
depends_on: []
parent: DS-0045
epic: DS-0043
created: 2026-06-09
updated: 2026-06-09
---

## Description
Build a new `Accordion` component at `src/lib/components/Accordion.svelte` (with item children), based on
the website's `AppExtension.svelte` but generalized to multiple panels. Keep it token-driven (zero radius,
`--ss-*` size + motion tokens, scoped SCSS, Svelte 5 runes).

## Acceptance criteria
- [ ] **Header + content** — each item has a clickable header (label + chevron) and an animated content region; chevron rotates 180° on open
- [ ] **Animated reveal** — expand/collapse uses a token-driven duration (`--ss-dur*`) and easing (`--ss-ease`); collapses to instant under `prefers-reduced-motion`
- [ ] **Single vs multi** — `multiple?: boolean` (default single-open, where opening one closes the others)
- [ ] **Controlled + uncontrolled** — `value` bindable (open item id, or array when `multiple`) with uncontrolled fallback; `onChange` callback
- [ ] **Keyboard + ARIA** — header is a `<button>` with `aria-expanded`/`aria-controls`; Enter/Space toggle; content region has `role="region"` + `aria-labelledby`
- [ ] **`size?: Size`** prop resolved via `resolveComponentSize('Accordion', size)`; padding/typography from size tokens
- [ ] Exported from `src/lib/index.ts` (+ item types)
- [ ] Tests added in `test/unit/Accordion.svelte.test.ts`; `pnpm test` green, `pnpm pack` clean
- [ ] Docs: `Accordion` page added to `documentation/src/lib/docs.config.ts`; `pnpm docs:test` green

## Notes
- Story: [[ds-0045-accordion-component]] · Epic: [[DS-0043-new-components-from-website]].
- Source: `passoca/src/lib/components/Base/AppExtension.svelte` (uses `max-height` + margin animation; consider a more robust grid-rows or height-auto technique).
