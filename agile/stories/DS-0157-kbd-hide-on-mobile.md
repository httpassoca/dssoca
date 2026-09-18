---
id: DS-0157
type: story
title: "Kbd — `hideOnMobile` prop, default true"
status: done
priority: high
tags: [ui, components, kbd, responsive, a11y, api]
depends_on: [DS-0137]
parent: null
epic: DS-0135
created: 2026-09-07
updated: 2026-09-18
---

## Description

As a consumer of dssoca, I want `Kbd` to **hide itself on devices that have no keyboard**, so
key-cap chips stop taking up room (and stop advertising an unusable affordance) on phones and
tablets. A `⌘K` chip inside a search field, a Topbar action or a menu row is noise when the only
input is a finger.

New prop `hideOnMobile?: boolean`, **default `true`** — the chip is hidden on small/coarse-pointer
viewports and shown everywhere else; `hideOnMobile={false}` restores today's always-visible
behaviour (needed by the Keyboard guide page and the ShortcutsHelp overlay, where the chip *is*
the content being documented).

**This flips the default, so it is a behaviour change** for anyone rendering `<Kbd>` on a phone —
call it out in the CHANGELOG as a minor-version behaviour change, and audit every in-repo call site
(`Topbar`, `ShortcutsHelp`, `SearchPalette` rows, the docs `/keyboard` page, Tooltip stories) for
which ones must opt out.

Open questions for refinement (decide before implementing):

- **What "mobile" means.** A width media query (Topbar's precedent: local `$bp-*` Sass vars,
  `@media (max-width: 520px)`) versus a capability query (`@media (hover: none) and
  (pointer: coarse)`), or both. Capability matches the intent (no physical keyboard) but misses a
  narrow desktop window and mis-fires on touch laptops; width is crude but predictable and is what
  the rest of the library already does. Recommendation to validate: capability-first with a width
  fallback, expressed once in the component's SCSS.
- **Hide how.** `display: none` (removed from the a11y tree — right, since the chip is decorative
  when unusable) versus visually-hidden. `display: none` is the default answer; make sure
  `aria-label`-carrying glyph roots vanishing doesn't strand a labelled-by reference in
  `ShortcutsHelp`/`SearchPalette`.
- **Vanilla parity.** The plain-HTML contract needs the same switch: a `data-hide-on-mobile`
  attribute (or the inverse opt-out) on `.ss-kbd` so `vanilla.css` behaves identically — and
  because the generator derives the CSS from this component's `<style>` block, the rule must be
  authored so it survives extraction. No JS should be needed.

## Acceptance criteria

- [x] `hideOnMobile?: boolean` on `Kbd` (default `true`), documented in the props JSDoc; reflected
  onto the root as a data attribute (Modal's `data-fullscreen` / Sidebar's `data-collapsed`
  convention), never as a prefixed class.
- [x] CSS-only: no `window.matchMedia`, no runes, nothing to break under SSR.
- [x] Every in-repo consumer audited and, where the chip is the subject rather than a hint,
  explicitly `hideOnMobile={false}` — Kbd's own docs page, `/keyboard`, `ShortcutsHelp`, Storybook.
- [x] `vanilla.css` gets the same behaviour via the generated rule; a plain-HTML `.ss-kbd` hides on
  mobile by default and opts out with the documented attribute.
- [x] Tests (`test/unit/Kbd.svelte.test.ts`): default attribute present, opt-out removes it,
  existing keycap/format/platform tests unchanged, `vitest-axe` clean. Add the vanilla drift test's
  expectation if `ROOT_CLASSES` output changes.
- [x] Storybook: a story showing the mobile-hidden default (viewport addon or a note) plus the
  opt-out.
- [x] Documentation updated (`documentation/src/lib/component-docs/kbd.ts` prop row + note,
  the Keyboard guide's mention, CHANGELOG behaviour-change entry).
- [x] `pnpm test`, `check`, `lint`, `format:check`, `docs:test`, `pack`, `build-storybook` green.

## Notes

- Prior art: shadcn/ui and Linear hide the `⌘K` hint below `sm`; GitHub's command-palette hint is
  desktop-only; MUI documents the same pattern via `useMediaQuery` (consumer-driven) — we do it in
  CSS so it also works on the vanilla path.
- Files: `src/lib/components/Kbd.svelte`, `scripts/lib/vanilla-css.mjs` (if the root class metadata
  moves), `documentation/src/lib/component-docs/kbd.ts`, `test/unit/Kbd.svelte.test.ts`.
- Related: [[DS-0137-kbd-component]] (the component), [[DS-0138-shortcuts-help-overlay]] and
  [[DS-0133-search-palette]] (consumers that must opt out), [[DS-0148-vanilla-html-consumption]]
  (vanilla parity).

## Decisions (2026-09-18)

- **"Mobile" = capability, not width.** `@media (hover: none) and (pointer: coarse)` only. A
  narrow desktop window still has a keyboard, so a width fallback would hide a usable hint; the
  capability query is exactly "no physical pointer/keyboard" (phones, tablets; touch laptops
  report `hover: hover` + `pointer: fine` and keep their chips). Authored once, top-level in
  `Kbd.svelte`'s style block so the vanilla generator ships it verbatim.
- **Hide = `display: none`.** An unusable affordance leaves the a11y tree too. No
  `aria-labelledby` references point at a Kbd in-repo (ShortcutsHelp/SearchPalette use `<dd>` /
  text), so nothing is stranded.
- **Attribute only when opted out.** `data-hide-on-mobile="false"` is rendered only for
  `hideOnMobile={false}`; the default DOM is byte-identical to 0.18, so every existing plain-HTML
  `.ss-kbd` (the Inspirations sites, consumers' pages) gets the behaviour with no markup change —
  the story's vanilla goal. (The AC's "default attribute present" was read as "the contract is a
  data attribute"; presence-on-default would have forced every vanilla author to add it.)
- **Consumer audit.** Opted out (chip is the subject): `ShortcutsHelp` rows, the `/keyboard`
  guide's table and inline chips, the docs component gallery + landing hub tiles, the blog
  inspiration's "Press ⌘K" sentence. Kept the default (chip is a hint): Tooltip/ShortcutsHelp
  story buttons, docs `usage` snippets, the mail inspiration's search button. **Topbar**: the ⌘K
  chip is the command button's only content, so a new decorative `search` icon (added to
  `BUILTIN_PATHS`) shows under the same query — otherwise the button rendered empty on phones.
  Inspirations sentences built around a chip (chat "Enter to send", dating arrow hints, mail
  hint bar + "⌘↵ to send", landing "? for shortcuts") hide as a whole via each `site.css`.
- **Storybook**: `HiddenOnMobile` story shows default vs opt-out side by side with a note — the
  viewport toolbar only resizes the iframe and cannot emulate a coarse pointer; DevTools device
  emulation can.
- Verified in headless Chromium with iPhone emulation (`hasTouch` + `isMobile`): Topbar chip
  hidden + search glyph shown, `/keyboard` chips visible, chat inspiration hint line gone.
