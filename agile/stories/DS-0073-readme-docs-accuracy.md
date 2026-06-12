---
id: DS-0073
type: story
title: "README & docs-site accuracy — 19 components, dead links, toast API reference"
status: done
priority: high
tags: [docs, readme]
depends_on: []
parent: null
epic: DS-0066
created: 2026-06-11
updated: 2026-06-12
---

## Description
As a new user, the README and docs site tell me what actually ships. Both lag the
library: 6 components missing from the README list, the intro page says "14 components"
(actual: 19), and the components catalog renders dead demo links.

## Acceptance criteria
- [x] `README.md` (~L72-73): component list includes all 19 exports (add Menu, Accordion,
  Link, SegmentedControl, BottomNav, Image). *(The library grew to **23** exports in this
  release — the README now lists all 23, incl. the DS-0079 additions Heading, Container,
  Textarea, Spinner.)*
- [x] `README.md` (~L78-80): Config and Toasts sections list the exported types
  (`ColorTheme`, `Size`, `DesignConfig`, `ComponentsSize`, `DesignAxis`, `ComponentName`;
  `Toast`, `ToastKind`, `ToastAction`, `ToastOptions`, `ToastPatch`, `PromiseMessages`).
  *(Plus `DssocaConfig` and a new "Component types" line: `IconName`, `TopbarTab`,
  `TopbarServices`, `SideItem`/`SideGroup`/`SideStatus`, `LogLevel`/`LogLine`, `MenuItem`,
  `AccordionItem`, `SegmentOption`, `BottomNavItem`, `ImageSource`,
  `SpinnerVariant`/`SpinnerFrames`.)*
- [x] `documentation/src/routes/introduction/+page.svx` (~L35): "14 components" → 19;
  Storybook link (~L42) annotated as local-dev default with `VITE_STORYBOOK_URL` note.
  *(Count set to **23** per the current barrel, not 19.)*
- [x] `documentation/src/routes/components/+page.svelte` (~L115-116): Link preview hrefs
  `/about` and `/get-started` replaced with real routes or inert examples. *(Now
  `/introduction` and `/installation` — real docs routes. The catalog page also gained
  previews for the four new components.)*
- [x] Toast API gets a canonical reference: either a dedicated docs page or the Toaster
  component page expanded with examples for each `toast.*` method and the `toasts` store.
  *(Toaster page (`component-docs/toaster.ts`): usage snippet now demos
  success/error/info/loading/promise + action + every `toasts` store control; notes spell
  out the per-kind timeout defaults (4s/4s/7s/sticky), sticky semantics, and exported types.)*
- [x] A maintainer-facing deployment note (the `VITE_STORYBOOK_URL` Vercel env var) lives
  somewhere discoverable, not only in `documentation/CLAUDE.md`. *(README → "Deployment
  (maintainers)" section + a short note on the docs Introduction page.)*
- [x] `pnpm docs:test` green. *(32/32 — also fixed the pre-existing HubTile opacity failure:
  the component's resting opacity (0.3) drifted from both the test and its own `tile-in`
  keyframe end value (0.2); the component was set back to 0.2 — test kept as truth. The
  stale pinned 19-name list in `docs.config.test.ts` was updated to 23, `hub-data.ts`
  ALL_SLUGS/variant pools and `HubTile` gained the four new components, and
  `categories.ts` gained their category slots.)*

## Notes
- Spot-check of docs.config.ts usage snippets vs real props came back clean — no drift there.
- 2026-06-12: counts everywhere now read 23 (source of truth `src/lib/index.ts`).
