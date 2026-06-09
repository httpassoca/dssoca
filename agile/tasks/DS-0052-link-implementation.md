---
id: DS-0052
type: task
title: "Link implementation"
status: backlog
priority: low
tags: [ui, a11y]
depends_on: []
parent: DS-0046
epic: DS-0043
created: 2026-06-09
updated: 2026-06-09
---

## Description
Build a new `Link` component at `src/lib/components/Link.svelte`, porting the signature treatment from the
website's `AppLink.svelte`. Keep it token-driven (zero radius, `--ss-*` color/motion tokens, scoped SCSS,
Svelte 5 runes).

## Acceptance criteria
- [ ] **Animated underline** — pseudo-element underline that reveals on hover/focus with `--ss-ease` + a glow via box-shadow using `--ss-primary`
- [ ] **`href` + content** — renders an `<a>`; accepts children; forwards `rest` attributes
- [ ] **`external?`** — when true (or auto-detected for off-site URLs) sets `target="_blank"` + `rel="noopener noreferrer"` and appends the `external` icon (`Icon.svelte`)
- [ ] **`variant`** — `inline` (default, underline treatment) and `button` (solid primary, no underline) — note: do NOT duplicate `Button`; this is a link styled as a button
- [ ] **States** — hover, `:focus-visible` (visible ring, not just underline), visited; honours reduced-motion
- [ ] **`size?: Size`** prop resolved via `resolveComponentSize('Link', size)`
- [ ] Exported from `src/lib/index.ts`
- [ ] Tests added in `test/unit/Link.svelte.test.ts`; `pnpm test` green, `pnpm pack` clean
- [ ] Docs: `Link` page added to `documentation/src/lib/docs.config.ts`; `pnpm docs:test` green

## Notes
- Story: [[ds-0046-link-component]] · Epic: [[DS-0043-new-components-from-website]].
- Source: `passoca/src/lib/components/Base/AppLink.svelte`.
- Clarify the boundary with `Button` in docs: `Link` is for navigation, `Button` for actions; `variant="button"` is purely visual.
