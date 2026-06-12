---
id: DS-0084
type: story
title: "Textarea component"
status: done
priority: high
tags: [ui, components, forms, a11y]
depends_on: []
parent: null
epic: DS-0079
created: 2026-06-11
updated: 2026-06-12
---

## Description
As a `dssoca` consumer building forms, I want a **Textarea** component. `Input` has no
multiline variant, so contact forms (passoca's contact page is the reference case) fall back
to a raw `<textarea>` that matches none of the DS chrome. Textarea should share Input's
anatomy — label / hint / error slots, the same `--ss-*` field tokens and focus/error styling —
plus an autosize option for grow-with-content behavior.

## Acceptance criteria
- [x] `Textarea` component with `.ss-textarea` identity root, mirroring Input's API: `label`,
  `hint`, `error`, `disabled`, `value` binding.
- [x] Shares Input's field tokens and focus/error treatment so the two sit side by side in a
  form without visual drift; zero border-radius.
- [x] `autosize` option grows the field with content (with sensible min/max rows).
- [x] Label/field association and error announcement match Input's a11y behavior (WCAG 2.2 AA).
- [x] Additive: new file + barrel export; `Input` untouched. (Barrel export lands in the
  integration step — `index.ts` is owned there.)
- [x] Tests mirror the Input suite (label/hint/error, disabled, autosize); `pnpm test` green,
  `pnpm pack` clean.
- [x] Documentation updated (new docs.config.ts component page; `docs/tokens.md` for any new tokens).
  (New `component-docs/textarea.ts` page; registration in `docs.config.ts`'s COMPONENTS list lands
  in the integration step. No new tokens — Textarea reuses the `--ss-input-*` field tokens.)

## Notes
- Part of epic [[DS-0079-passoca-adoption-gaps]].
- Site workaround removed: passoca's contact form styling a bare `<textarea>` by hand next to
  DS `Input`s.
- Implementation: autosize prefers native `field-sizing: content` (`@supports`-gated) with a
  scrollHeight JS fallback; `rows` (default 3) is the minimum, `maxRows` (default 10) caps
  growth via a `1lh`-based max-height. `'Textarea'` still needs adding to the `COMPONENT_NAMES`
  union in `dssoca.config.ts` (cast in the component until then).
