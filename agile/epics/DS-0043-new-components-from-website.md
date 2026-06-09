---
id: DS-0043
type: epic
title: "New components from the passoca website"
status: done
priority: high
tags: [ui, epic, components]
depends_on: []
parent: null
epic: null
created: 2026-06-09
updated: 2026-06-09
---

## Description
Promote the remaining `passoca`-website UI patterns that have **no current dssoca equivalent** into
first-class, token-driven components. An audit of the website (`/home/passoca/dev/passoca`, SvelteKit +
Svelte 5, ~26 components) against this design system (13 shipped) showed most pieces are already covered
(Header→`Topbar`, AppButton→`Button`, AppInput→`Input`, Hero/AppSVG→`Icon`, Post/ProjectCard composable
from `Card`/`Badge`). This epic groups the six genuinely-missing components, one **story per component**
(the user-facing need) and a single **task per component** whose acceptance criteria enumerate the concrete
props/states/behaviours to build.

Scope, in order: **Dropdown / Menu** (generalizes `ThemeMenu`/`LanguageMenu`/`FloatNavButton`),
**Accordion** (`AppExtension`), **Link** (`AppLink`), **SegmentedControl** (`LanguageSwitcher`),
**BottomNav** (`MobileBottomNav`), and **Image** (`AppImage`). Every component honours the house rules:
**zero border-radius**, `--ss-*` tokens (new chrome must rescale across sm/md/lg), `.ss-*` identity
prefix, scoped SCSS, Svelte 5 runes, and WCAG 2.2 AA.

## Acceptance criteria
- [x] All 6 component stories (DS-0044 → DS-0049) and their tasks (DS-0050 → DS-0055) created and triaged
- [x] Each new component is additive (does not alter existing components/exports)
- [x] Per the testing RULE: every implemented task adds tests under `test/unit/` (+ harness) and keeps `pnpm test` green / `pnpm pack` clean
- [x] Per the docs RULE: each component gets a docs page (`documentation/src/lib/component-docs/<name>.ts`) + `docs/tokens.md` updated for the new tokens; `pnpm docs:test` green
- [x] Each is exported from `src/lib/index.ts` (with public types where applicable)
- [x] Board rebuilt (`node build.mjs`) as items move

## Notes
- **Scaffold landed** (`feature/new-components-scaffold`): per-component token partials under
  `src/styles/components/` + a joiner, stub components wired into the barrel / `COMPONENT_NAMES` /
  docs assembler. This pre-slots every shared file so the six implementation PRs (DS-0050…0055) run
  in parallel without merge conflicts — each touches only files unique to its component.
- Sibling epic [[DS-0016-components-improvements]] covered *improving existing* components; this one *adds new* ones.
- Source components live in `/home/passoca/dev/passoca/src/lib/components/`.
- **Shipped in 0.7.0** — all six implemented via parallel PRs (#49–#54) merged to `develop`: Menu
  [[ds-0050-dropdown-menu-implementation]], Accordion [[ds-0051-accordion-implementation]], Link
  [[ds-0052-link-implementation]], SegmentedControl [[ds-0053-segmented-control-implementation]],
  BottomNav [[ds-0054-bottom-nav-implementation]], Image [[ds-0055-image-implementation]].
