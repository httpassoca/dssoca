---
id: DS-0073
type: story
title: "README & docs-site accuracy — 19 components, dead links, toast API reference"
status: todo
priority: high
tags: [docs, readme]
depends_on: []
parent: null
epic: DS-0066
created: 2026-06-11
updated: 2026-06-11
---

## Description
As a new user, the README and docs site tell me what actually ships. Both lag the
library: 6 components missing from the README list, the intro page says "14 components"
(actual: 19), and the components catalog renders dead demo links.

## Acceptance criteria
- [ ] `README.md` (~L72-73): component list includes all 19 exports (add Menu, Accordion,
  Link, SegmentedControl, BottomNav, Image).
- [ ] `README.md` (~L78-80): Config and Toasts sections list the exported types
  (`ColorTheme`, `Size`, `DesignConfig`, `ComponentsSize`, `DesignAxis`, `ComponentName`;
  `Toast`, `ToastKind`, `ToastAction`, `ToastOptions`, `ToastPatch`, `PromiseMessages`).
- [ ] `documentation/src/routes/introduction/+page.svx` (~L35): "14 components" → 19;
  Storybook link (~L42) annotated as local-dev default with `VITE_STORYBOOK_URL` note.
- [ ] `documentation/src/routes/components/+page.svelte` (~L115-116): Link preview hrefs
  `/about` and `/get-started` replaced with real routes or inert examples.
- [ ] Toast API gets a canonical reference: either a dedicated docs page or the Toaster
  component page expanded with examples for each `toast.*` method and the `toasts` store.
- [ ] A maintainer-facing deployment note (the `VITE_STORYBOOK_URL` Vercel env var) lives
  somewhere discoverable, not only in `documentation/CLAUDE.md`.
- [ ] `pnpm docs:test` green.

## Notes
- Spot-check of docs.config.ts usage snippets vs real props came back clean — no drift there.
