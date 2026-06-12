---
id: DS-0079
type: epic
title: "passoca adoption gaps — components & variations missing from the DS"
status: todo
priority: high
tags: [ui, epic, components, adoption]
depends_on: []
parent: null
epic: null
created: 2026-06-11
updated: 2026-06-11
---

## Description
The `passoca` website (`/home/passoca/dev/passoca`) just completed a real-world migration to dssoca
(passoca PR httpassoca/passoca#3), adopting **Button / Input / Link / Accordion / Menu / BottomNav /
Topbar**. The migration succeeded but forced a series of **site-side workarounds** — global CSS
overrides against `.ss-*` internals, hand-copied token values, re-registered icons, recreated
recipes — each of which marks a gap in the design system. This epic groups the ten resulting
stories: Topbar flexibility (link tabs, optional chrome, responsive strip), four missing
components/recipes (Heading, Textarea, Container, Spinner), richer Icon/Menu content, and a
tokens-only stylesheet entry for consumers who can't adopt `theme.css` wholesale.

Every fix honours the house rules: **zero border-radius**, `--ss-*` tokens, `.ss-*` identity
prefix, scoped SCSS, Svelte 5 runes, WCAG 2.2 AA, and the tests/docs/agile RULEs.

## Acceptance criteria
- [ ] All child stories (DS-0080 … DS-0089) are done or explicitly descoped.
- [ ] The corresponding passoca workarounds can be deleted (each story names the one it removes).
- [ ] Board rebuilt (`node build.mjs`) as items move.

## Notes
- Sibling epic [[DS-0043-new-components-from-website]] *added* the components the site needed;
  this epic fixes what the *adoption* of those components revealed.
- Findings sourced from the passoca migration branch (passoca PR httpassoca/passoca#3).
