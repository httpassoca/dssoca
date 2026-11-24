---
id: DS-0197
type: epic
title: "Behaviour core — one framework-free place for what components do"
status: in-progress
priority: high
tags: [ui, epic, architecture, a11y, vanilla]
depends_on: []
parent: null
epic: null
created: 2026-11-24
updated: 2026-11-24
---

## Description

Give dssoca the architecture of Vercel's UI SDK (`vercel-labs/ui`) **without depending on it**:
behaviour (keys, focus, dismissal, selection) lives once in a framework-free core, and the Svelte
components and `vanilla.js` are thin wiring over it. Today each behaviour is written twice
(`vanilla/menu.ts` opens with "port of Menu.svelte"), so every fix has to land in two places.

Decisions locked with the owner:

- **No dependency** on `@ui-sdk/*`; the public API and the rendered DOM do not change.
- **Shape**: `src/lib/core/behaviors/` (reusable pieces) + one `src/lib/core/<component>.ts` per
  component — pure functions over a small state object returning actions and per-part
  attributes. No generic renderer; each `.svelte` file keeps its own markup.
- **State**: Svelte holds it in `$state`; vanilla derives it from the DOM on each event and
  writes the result back (stateful components such as toast/tierlist may keep instances).
- **Internal**: `core/` is not in `exports`; only types are re-exported.
- **Callbacks** gain an additive `details.reason`; `cancel()` / `source` wait until needed.
- **Guards**: `core-purity.test.ts` + a key-handling guard with a shrinking legacy list.
- **Delivery**: one PR (`feature/behavior-core`), one commit per component, a checkpoint after
  the pilot ([[DS-0198-behavior-core-pilot]]), then [[DS-0199-behavior-core-all-components]], release `0.21.0`.

Order: pilot (Menu, Switch) → the duplicated components (Accordion, Modal, SegmentedControl,
Tooltip, Input/Textarea/NumberField) → Svelte-only interactive components (Select, Pagination,
SearchPalette, DateField, FileDrop, Sidebar, Topbar, BottomNav, Table; core only, no vanilla
twin) → charts → new components built core-first with a vanilla twin (Tabs, Checkbox, Radio,
Popover).

**Out of scope** (deferred): vanilla twins for Svelte-only components; an agent bridge
(snapshot / actions / WebMCP) — the cores' named state and actions are what it will build on;
Combobox, Slider, Drawer, Calendar.

## Acceptance criteria

- [x] Pilot merged into the branch and reviewed by the owner (DS-0198).
- [x] Every interactive component decides its behaviour in `core/`; the key-handling guard's
      legacy list is empty (DS-0199).
- [ ] Rendered DOM, classes and existing `ss:*` events unchanged for existing components.
- [x] Tabs, Checkbox, Radio and Popover ship with a core, a vanilla twin, docs, a story and tests (DS-0200).
- [ ] `pnpm test`, `pnpm docs:test`, `pnpm check`, `pnpm pack`, `pnpm build-storybook` green.
- [ ] Browser pass in both themes and under `dir="rtl"`.
- [ ] Documentation updated (component pages for every new `details.reason`, CLAUDE.md, CHANGELOG).
