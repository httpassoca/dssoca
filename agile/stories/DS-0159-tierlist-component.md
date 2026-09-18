---
id: DS-0159
type: story
title: "TierList component (from the passoca roulette tierlist)"
status: done
priority: high
tags: [ui, components, dnd, a11y, api]
depends_on: []
parent: null
epic: null
created: 2026-09-07
updated: 2026-09-18
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

- [x] `src/lib/components/TierList.svelte` (+ any row/tile subcomponents) implemented with scoped
  `<style lang="scss">`, `--ss-*` tokens only, zero radius, no colour literals; `size?: Size` via
  `resolveComponentSize('TierList', size)`.
- [x] Exported from `src/lib/index.ts`, added to `COMPONENT_NAMES` in `dssoca.config.ts`, root class
  registered in `ROOT_CLASSES` (`scripts/lib/vanilla-css.mjs`) so the drift test passes.
- [x] Pointer drag: reorder within a row and move between rows, including the unranked tray;
  placements reported to the consumer in tier + position order.
- [x] Keyboard: every tile is focusable, can be picked up, moved across tiers and dropped without a
  pointer; state changes are announced; visible focus ring; `vitest-axe` clean.
- [x] Tests at `test/unit/TierList.svelte.test.ts` — rendering, both interaction paths, size
  variants, a11y.
- [x] Storybook story at `src/stories/TierList.stories.svelte` (empty state, filled, custom tiles).
- [x] Vanilla decision implemented and documented (behaviour in `src/lib/vanilla/` or an explicit
  "static only" note in the Plain HTML guide).
- [x] Documentation updated (`documentation/src/lib/component-docs/tier-list.ts` with props/usage/
  notes **and an `htmlExample`**, registered in the docs index; `docs/tokens.md` for any new token).
- [x] `pnpm test`, `check`, `lint`, `format:check`, `docs:test`, `pack`, `build-storybook` green.

## Tasks

- [x] [[DS-0160-tierlist-implementation]] — component, tests, story, docs.

## Notes

- Prior art to review during refinement: tiermaker.com and TierMaker-likes (the visual grammar),
  `svelte-dnd-action` (the reference app's engine, and its a11y story), `@dnd-kit` and Atlassian's
  `pragmatic-drag-and-drop` (both ship keyboard-first sensors worth copying), the HTML drag-and-drop
  API's known a11y gaps, and WCAG 2.2 SC 2.5.7 *Dragging Movements*.
- Follows the spirit of the closed epic [[DS-0043-new-components-from-website]] (components promoted
  out of the passoca site), but stands on its own — that epic is done and its six components shipped.
- Once shipped, passoca can drop `TierRow`/`TierTile` and keep only its app logic (autosave,
  publish, export) — worth a follow-up in that repo.

## Decisions (2026-09-18)

- **Data in / out.** `tiers: { id, label, color? }[]` (default S/A/B/C/D), `items: { id, label }[]`
  (`label` = accessible name + default tile text), a `tile` snippet for custom content, and
  `placements: Record<tierId, itemId[]>` — bindable + `onchange`, the library's
  controlled-with-callback shape; the tray is implicit (items in no tier), its order kept
  internally. Unmanaged when neither is passed. `onselect(item)` for activation (Enter / plain
  click), `readonly` for display, `tray` label or `false`.
- **Tier colours.** By index from palette slots — accent, cyan, yellow, fg-muted, red, blue,
  magenta, green, cycling (the first five = passoca's mapping) — rendered as the Badge wash
  recipe (`color-mix()` 12 % bg / 40 % border, slot fg) on the letter box; per-row `color`
  override. Light theme uses the same slots (darker there by construction, DS-0125); the letter
  is display-size text so the 3:1 large-text bar holds even for the DS-0155 tones.
- **Drag and drop: Pointer Events, no dependency.** `svelte-dnd-action` would have been the
  first runtime dep; the HTML5 DnD API has no touch story and poor a11y. Pointer capture on the
  tile, a 4 px threshold, `elementsFromPoint` for the zone, `insertionIndex()` (rows-then-x) for
  the slot, live reorder with a fixed-position ghost, commit on release, restore on
  `pointercancel`; `touch-action: none` on tiles. **Keyboard**: Space grabs (`aria-pressed`),
  arrows move within/across rows (no wrap at the edges), Home/End, Space drops, Escape cancels,
  blur cancels; a `role="status"` live region reads every step (dnd-kit's wording). Enter =
  `onselect` when provided, else Space.
- **Vanilla path: full behaviour, not static rows.** `src/lib/vanilla/tierlist.ts` drives the
  exact rendered DOM with the same core module (move maths, keyboard targets, announcements),
  emits `ss:change { placements }`, honours `data-ss-readonly`. The pure half lives in
  `src/lib/tierlist-core.ts` (no DOM, no Svelte) so the two paths cannot drift.
- **Sizing.** New `--ss-tier-tile-w/h`, `--ss-tier-label-w`, `--ss-tier-label-font`,
  `--ss-tier-gap` per size (passoca's 108/44/62 px became the md values; tiles square by
  default, posters override `--ss-tier-tile-h`); row min-height derived. Zero radius.
- **Found only in a real browser** (jsdom has no layout, no focus fixup): (1) a tile that
  changes row is re-created by the other row's keyed block, so pointer capture on it died
  mid-drag — the drag now listens on `window` (Svelte) / `document` (vanilla) for the rest of
  the gesture; (2) Chrome blurs a focused node that is re-inserted, which the blur-cancel read
  as "the user left" — every keyboard move now re-focuses the tile after the DOM settles and
  the cancel is decided a macrotask later, only when focus has really gone elsewhere; Escape
  returns focus to the tile, a Tab-away does not (no trap).
- Verified: unit (core maths, component, vanilla behaviour, axe), docs html-example SSR,
  Storybook build, and a headless-Chromium pass — the Storybook story (real mouse drag into a
  row, keyboard grab / arrows across rows / End / drop / Escape, axe in dark + light, every
  story screenshotted) and a plain-HTML page on the built `dist/` (same drag + keyboard paths,
  `ss:change` payloads, Escape and Tab-away cancels, axe).
