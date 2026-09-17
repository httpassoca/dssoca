---
id: DS-0159
type: story
title: "TierList component (from the passoca roulette tierlist)"
status: todo
priority: high
tags: [ui, components, dnd, a11y, api]
depends_on: []
parent: null
epic: null
created: 2026-09-07
updated: 2026-09-07
---

## Description

As a dssoca consumer, I want a **`TierList`** component — labelled tier rows (S/A/B/C/D … plus an
unranked tray) holding draggable tiles — so ranking UIs stop being hand-rolled per app. The
reference implementation is the passoca website's roulette tierlist
(`/home/passoca/dev/passoca/src/lib/components/Roulette/`: `TierRow.svelte`, `TierTile.svelte`,
`PersonalTierlist.svelte`, `GeneralTierlist.svelte`, with `src/lib/roulette/tierlist.ts` for
`TIERS`/`TIER_COLORS`/`buildZones`/`placementsFromZones`), driven from
`/roulette/tierlist`. That version is app-shaped: it imports `svelte-dnd-action`, knows about TMDB
posters, autosave, publishing and JPG export, and hardcodes tier colours and a 44px letter column.

The dssoca version keeps the **pattern**, not the app: a presentational, token-driven component
that owns rows, tiles, drag-and-drop reordering between rows and keyboard equivalents, and hands
the consumer the resulting placements. Poster fetching, persistence, publishing and export stay out.

Shape to settle in refinement (open questions, not decisions):

- **Data in / out.** Rows as `{ id, label }[]` with a configurable unranked tray; items as
  `{ id, ... }` with a `tile` snippet so the consumer renders whatever a tile contains (image,
  text, a whole Card). Changes surface as an `onchange(placements)` callback and/or `bind:` on a
  zones object — pick one primary shape; controlled-with-callback matches the rest of the library.
- **Tier colours.** passoca hardcodes a colour per tier. dssoca has **no raw colour literals**
  ([[DS-0125-mono-terminal-color-rework]] / [[DS-0128-component-color-sweep]]): tiers must derive
  from the 16 palette slots (slot-based `color-mix()` washes) with an optional per-row override
  hook. Decide the default slot mapping and whether it survives the light theme
  ([[DS-0155-light-theme-tone-contrast]]).
- **Drag and drop.** `svelte-dnd-action` is a runtime dependency dssoca does not have and should
  not take on lightly (peer deps today: `svelte@^5` only). Options: native HTML5 drag events,
  Pointer Events, or the dependency. Whatever is chosen must have a **keyboard path** (move a tile
  between tiers and reorder within one, announced via a live region) — WCAG 2.2 AA is the bar, and
  2.2's *Dragging Movements* (2.5.7) requires a non-drag alternative.
- **Vanilla path.** Decide whether the plain-HTML build gets the drag behaviour
  (`src/lib/vanilla/`, no runes) or ships static rows only, and document the answer.
- **Sizing.** Tile size, row min-height and the letter column read `--ss-*` tokens (passoca's
  108px/44px/62px become tokens or size-variant values); zero radius everywhere.

## Acceptance criteria

- [ ] `src/lib/components/TierList.svelte` (+ any row/tile subcomponents) implemented with scoped
  `<style lang="scss">`, `--ss-*` tokens only, zero radius, no colour literals; `size?: Size` via
  `resolveComponentSize('TierList', size)`.
- [ ] Exported from `src/lib/index.ts`, added to `COMPONENT_NAMES` in `dssoca.config.ts`, root class
  registered in `ROOT_CLASSES` (`scripts/lib/vanilla-css.mjs`) so the drift test passes.
- [ ] Pointer drag: reorder within a row and move between rows, including the unranked tray;
  placements reported to the consumer in tier + position order.
- [ ] Keyboard: every tile is focusable, can be picked up, moved across tiers and dropped without a
  pointer; state changes are announced; visible focus ring; `vitest-axe` clean.
- [ ] Tests at `test/unit/TierList.svelte.test.ts` — rendering, both interaction paths, size
  variants, a11y.
- [ ] Storybook story at `src/stories/TierList.stories.svelte` (empty state, filled, custom tiles).
- [ ] Vanilla decision implemented and documented (behaviour in `src/lib/vanilla/` or an explicit
  "static only" note in the Plain HTML guide).
- [ ] Documentation updated (`documentation/src/lib/component-docs/tier-list.ts` with props/usage/
  notes **and an `htmlExample`**, registered in the docs index; `docs/tokens.md` for any new token).
- [ ] `pnpm test`, `check`, `lint`, `format:check`, `docs:test`, `pack`, `build-storybook` green.

## Tasks

- [ ] [[DS-0160-tierlist-implementation]] — component, tests, story, docs.

## Notes

- Prior art to review during refinement: tiermaker.com and TierMaker-likes (the visual grammar),
  `svelte-dnd-action` (the reference app's engine, and its a11y story), `@dnd-kit` and Atlassian's
  `pragmatic-drag-and-drop` (both ship keyboard-first sensors worth copying), the HTML drag-and-drop
  API's known a11y gaps, and WCAG 2.2 SC 2.5.7 *Dragging Movements*.
- Follows the spirit of the closed epic [[DS-0043-new-components-from-website]] (components promoted
  out of the passoca site), but stands on its own — that epic is done and its six components shipped.
- Once shipped, passoca can drop `TierRow`/`TierTile` and keep only its app logic (autosave,
  publish, export) — worth a follow-up in that repo.
