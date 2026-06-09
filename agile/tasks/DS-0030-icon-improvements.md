---
id: DS-0030
type: task
title: "Icon improvements"
status: done
priority: low
tags: [ui, icon]
depends_on: []
parent: DS-0017
epic: DS-0016
created: 2026-06-08
updated: 2026-06-09
---

## Description
Implement the researched improvements for `Icon` (`src/lib/components/Icon.svelte`).
Each acceptance-criteria line is one concrete prop / state / behaviour drawn from a best-in-class
comparison. Keep changes additive and token-driven (zero radius, `--ss-*` size tokens, scoped
SCSS, Svelte 5 runes); extend the Vitest suite for every state added before marking done.

## Acceptance criteria
- [ ] **Custom / runtime icon registration** — add a `paths?: string` escape hatch and/or a module-level `registerIcon(name, paths)` so the curated `IconName` union stays the default but the runtime set is open
- [ ] **`spin` loading state (reduced-motion aware)** — add `spin?: boolean` + a `loader` glyph with a scoped 360° keyframe, disabled under `prefers-reduced-motion`
- [ ] **`rotate` / `flip` orientation props** — add `rotate?: 0|90|180|270` and `flip?: horizontal|vertical` so one `arrow` covers all directions without new glyphs
- [ ] **Size-invariant stroke weight** — add `strokeWidth?: number` + `absoluteStroke?: boolean` that recomputes weight from the resolved px so it stays optically constant across sm/md/lg
- [ ] **Robust accessible name via `<title>`/`<desc>`** — render a real SVG `<title>` (+ optional `<desc>`) wired with `aria-labelledby`; add an explicit `decorative?: boolean` rather than inferring from `title`
- [ ] **Fill / solid variant** — add `variant?: outline|solid` (toggles `fill`/`stroke`) to remove the per-glyph fill hacks (e.g. `target`)
- [ ] **Dev-warn on unknown name + extend tests** — `console.warn` on an unresolved name (optionally a fallback glyph); cover spin/rotate/flip/title/registration in `Icon.svelte.test.ts`
- [ ] Tests extended in `test/unit/Icon.svelte.test.ts` (+ harness if needed); `pnpm test` green, `pnpm pack` clean

## Notes
- Story: [[ds-0017-icon-best-in-class]] · Epic: [[DS-0016-components-improvements]].
- Researched against Radix/shadcn, Carbon, Polaris, Primer, Material (+ data-viz/dashboard refs).
