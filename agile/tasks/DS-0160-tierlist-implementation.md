---
id: DS-0160
type: task
title: "TierList implementation"
status: done
priority: high
tags: [ui, components, dnd, a11y]
depends_on: []
parent: DS-0159
epic: null
created: 2026-09-07
updated: 2026-09-18
---

## Description

Build `TierList` per [[DS-0159-tierlist-component]]. Start by reading the reference implementation
in `/home/passoca/dev/passoca/src/lib/components/Roulette/` (`TierRow.svelte`, `TierTile.svelte`,
`PersonalTierlist.svelte`, `GeneralTierlist.svelte`) and `src/lib/roulette/tierlist.ts`, then strip
it to the presentational pattern: rows + tray, a `tile` snippet, pointer **and** keyboard reordering,
placements out via callback. No poster/TMDB code, no autosave, no publish, no JPG export, no
hardcoded tier colours (derive from palette slots), no hardcoded px (size tokens).

Deliverables: component (+ subcomponents), `index.ts` export, `COMPONENT_NAMES`, `ROOT_CLASSES`
entry, `test/unit/TierList.svelte.test.ts`, `src/stories/TierList.stories.svelte`, docs page in
`documentation/src/lib/component-docs/` with an `htmlExample`, and the vanilla-path decision
implemented or documented.

Delivered 2026-09-18: `src/lib/tierlist-core.ts` (model + maths + wording), `TierList.svelte`,
`src/lib/vanilla/tierlist.ts`, `_tierlist.scss` tokens, barrel / `COMPONENT_NAMES` /
`ROOT_CLASSES` wiring, tests (`tierlist-core.test.ts`, `TierList.svelte.test.ts`, vanilla
behaviours section), `TierList.stories.svelte`, docs page `tier-list.ts` (+ category, tokens
docs, vanilla guide row, README), CHANGELOG. Decisions on [[DS-0159-tierlist-component]].
