---
id: DS-0154
type: task
title: "Inspirations: vitest guard, Sidebar external flag, docs/README/CHANGELOG/CLAUDE.md"
status: done
priority: high
tags: [vanilla, examples]
depends_on: []
parent: DS-0150
epic: null
created: 2026-09-06
updated: 2026-09-06
---

## Description

`test/unit/inspirations.test.ts`: folder ↔ gallery drift both ways, the per-page contract (doctype, lang, axes, viewport, title, resource order, no Svelte artefacts, no remote assets), every `ss-*` class present in the generated CSS (rebuilt from source like `vanilla-css.test.ts`), landmarks + single h1, axe (jsdom, colour-contrast off), the `site.css` policy, plus unit tests for `vendorFiles` and the static server. Sidebar gains an `external?: boolean` item flag (`target=_blank rel=noopener noreferrer` + external glyph) so the docs nav can link out; docs: NAV entry "Inspirations" (external — `+layout.svelte` passes `href`/`external` through and `navigate` ignores absolute URLs; search maps it to `url`), a paragraph in the Plain HTML & CSS guide, README "Plain HTML" pointer, CHANGELOG `[Unreleased]`, CLAUDE.md layout/commands/rules.
