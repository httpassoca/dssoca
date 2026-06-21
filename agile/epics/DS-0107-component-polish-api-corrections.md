---
id: DS-0107
type: epic
title: "Component polish & API corrections"
status: in-progress
priority: high
tags: [ui, epic, components, polish, api]
depends_on: []
parent: null
epic: null
created: 2026-06-21
updated: 2026-06-21
---

## Description
A coordinated round of fixes and small API corrections across shipped components, gathered from a
hands-on review of Button, Accordion, Icon, Badge, BottomNav, Card/Modal footers, and FileDrop, plus
three cross-cutting concerns. The theme is **harmony and correctness**: layout that doesn't shift or
inflate (Button icon height, Accordion initial-render padding, chevron alignment), an honest size
system (a constrained Icon scale and components that dictate coordinated inner sizes), reuse over
bespoke chrome (Button loading driven by the `Spinner` component/variant, all component icons routed
through the `Icon` component), and a tightened Badge API (six semantic tones, no dismiss, no vertical
padding).

Several items are **foundational** and others build on them: the Icon size scale
([[DS-0109-icon-size-scale]]) and the icon-component routing ([[DS-0110-icons-via-icon-component]])
underpin the coordinated-sizing rule ([[DS-0111-coordinated-inner-sizes]]) and the Accordion chevron
fix; the configurable default Spinner ([[DS-0108-config-default-spinner-variant]]) underpins the
Button loading change. Dependencies are encoded per-story via `depends_on` so implementation can be
sequenced.

Each change honours the house rules: **zero border-radius**, `--ss-*` tokens, `.ss-*` identity
prefix for roots / plain scoped names for internals, scoped SCSS, Svelte 5 runes, WCAG 2.2 AA, and
the tests/docs/agile RULEs. Two items are **breaking** and are flagged in their stories: the Badge
tone rename ([[DS-0119-badge-six-tones]]) and the Button `loading` boolean → Spinner-variant change
([[DS-0113-button-loading-spinner-variant]]).

## Acceptance criteria
- [ ] All child stories (DS-0108 … DS-0124) are done.
- [ ] Each user-facing change ships source + Storybook story + Vitest/axe test + docs update
      (`documentation/src/lib/docs.config.ts` + `docs/tokens.md` / `docs/themes.md` as needed).
- [ ] `pnpm test`, `pnpm check`, `pnpm pack`, and `pnpm docs:test` stay green.
- [ ] Breaking changes (Badge tones, Button `loading` shape) are captured in the CHANGELOG for the
      next release with a migration note.
- [ ] Board rebuilt (`node build.mjs`) as items move.

## Notes
- Confirmed decisions (2026-06-21): the "footer" item is **Storybook examples for the existing
  Card/Modal footer snippet regions**, not a new `Footer` component; the Icon scale **rewrites the
  global `--ss-icon` size-variant tokens** to xs12/sm16/md20/lg24; all items grouped under this epic.
- Foundation stories: [[DS-0108-config-default-spinner-variant]], [[DS-0109-icon-size-scale]],
  [[DS-0110-icons-via-icon-component]], [[DS-0111-coordinated-inner-sizes]].
- Button: [[DS-0112-button-icon-height]], [[DS-0113-button-loading-spinner-variant]],
  [[DS-0114-button-empty-label-span]].
- Accordion: [[DS-0115-accordion-initial-padding]], [[DS-0116-accordion-chevron-alignment]],
  [[DS-0117-accordion-label-overflow]].
- Icon: [[DS-0118-icon-storybook-controls]] (scale is DS-0109).
- Badge: [[DS-0119-badge-six-tones]], [[DS-0120-badge-remove-dismissable]],
  [[DS-0121-badge-remove-vertical-padding]].
- Misc: [[DS-0122-bottomnav-border-box-shadow]], [[DS-0123-card-modal-footer-stories]],
  [[DS-0124-filedrop-gap-xs]].
- Sibling epics: [[DS-0090-geossoca-component-gaps]], [[DS-0079-passoca-adoption-gaps]].
