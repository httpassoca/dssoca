---
id: DS-0084
type: story
title: "Textarea component"
status: todo
priority: high
tags: [ui, components, forms, a11y]
depends_on: []
parent: null
epic: DS-0079
created: 2026-06-11
updated: 2026-06-11
---

## Description
As a `dssoca` consumer building forms, I want a **Textarea** component. `Input` has no
multiline variant, so contact forms (passoca's contact page is the reference case) fall back
to a raw `<textarea>` that matches none of the DS chrome. Textarea should share Input's
anatomy — label / hint / error slots, the same `--ss-*` field tokens and focus/error styling —
plus an autosize option for grow-with-content behavior.

## Acceptance criteria
- [ ] `Textarea` component with `.ss-textarea` identity root, mirroring Input's API: `label`,
  `hint`, `error`, `disabled`, `value` binding.
- [ ] Shares Input's field tokens and focus/error treatment so the two sit side by side in a
  form without visual drift; zero border-radius.
- [ ] `autosize` option grows the field with content (with sensible min/max rows).
- [ ] Label/field association and error announcement match Input's a11y behavior (WCAG 2.2 AA).
- [ ] Additive: new file + barrel export; `Input` untouched.
- [ ] Tests mirror the Input suite (label/hint/error, disabled, autosize); `pnpm test` green,
  `pnpm pack` clean.
- [ ] Documentation updated (new docs.config.ts component page; `docs/tokens.md` for any new tokens).

## Notes
- Part of epic [[DS-0079-passoca-adoption-gaps]].
- Site workaround removed: passoca's contact form styling a bare `<textarea>` by hand next to
  DS `Input`s.
