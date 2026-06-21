---
id: DS-0122
type: story
title: "BottomNav top separator: border-top → outer box-shadow hairline"
status: backlog
priority: low
tags: [bottomnav, layout]
depends_on: []
parent: null
epic: DS-0107
created: 2026-06-21
updated: 2026-06-21
---

## Description
As a consumer of the BottomNav, I want the bar's top separator drawn as an outer `box-shadow` instead of a `border-top`, so the hairline does not consume layout space inside the nav's box or add to its computed height. Today `src/lib/components/BottomNav.svelte` draws the top edge with `border-top: 1px solid var(--ss-line)` on `.ss-bottom-nav` — because the nav is `box-sizing: border-box`, that 1px is part of the box and eats into the bar's vertical space (and any height/`--_bar-h` math). Switching to `box-shadow: 0 -1px 0 var(--ss-line)` paints the same 1px hairline *outside* the box, leaving the inner layout untouched while looking visually identical in both themes.

## Acceptance criteria
- [ ] `.ss-bottom-nav`'s own top separator is rendered via `box-shadow: 0 -1px 0 var(--ss-line)` (drawn outside the box), replacing the `border-top: 1px solid var(--ss-line)` rule.
- [ ] No layout shift / height change: the hairline no longer occupies layout space inside the `box-sizing: border-box` nav; the bar's interior height (`--_bar-h` / `min-height` math) is unaffected by the separator.
- [ ] The hairline remains a visually-identical 1px line, visible in **both** `data-theme` values (uses `var(--ss-line)`).
- [ ] The active-tab accent — `.tab.active { border-top-color: var(--ss-primary) }` over the per-tab `border-top: 2px solid transparent` rail — **stays as-is** (an inset 2px border indicator on the tab, not the nav). Decision recorded: only the nav's own *outer* separator moves to box-shadow; the active accent stays a per-tab border so the two never share/clobber the same property. The nav-level `box-shadow` and the tab-level `border-top` are independent and do not conflict.
- [ ] `backdrop-filter: blur(14px)` and the safe-area `padding-bottom: env(safe-area-inset-bottom)` behaviour are preserved.
- [ ] Verified at sm/md/lg and in both themes; zero border-radius preserved; scoped SCSS with `--ss-*` tokens only.
- [ ] Tests added/updated; `pnpm test` green (vitest-axe where UI changes).
- [ ] Documentation updated (documentation/src/lib/docs.config.ts component page + docs/tokens.md / docs/themes.md as needed).

## Notes
- Refinement research: mature systems treat the bottom bar's top edge as an **elevation/separation** concern, not a layout border. Material Components historically rendered a top shadow to separate the bottom navigation/app bar from content (the iOS `MDCBottomNavigationBar` exposes configurable shadow elevation/color, default black), and Material's guidance is a "top-light-casting-shadow" effect for perceptible separation. Modern Material 3 navigation bars even drop the elevation shadow entirely, relying on color/surface tones — confirming the separator should not be a layout-consuming border. A `box-shadow: 0 -1px 0` is the CSS idiom for an outside hairline that matches a 1px border visually without affecting box metrics; the same technique already appears in this codebase's `--ss-shadow-1`/`--ss-shadow-2` tokens (`0 0 0 1px var(--ss-line)` style outer rings). Sources: https://github.com/material-components/material-components-android/blob/master/docs/components/BottomNavigation.md , https://github.com/material-components/material-components-ios/blob/develop/components/BottomNavigation/src/MDCBottomNavigationBar.h , https://m1.material.io/components/bottom-navigation.html , https://m2.material.io/develop/flutter/components/bottom-navigation/
- Scope note: the per-tab 2px primary accent is a *distinct* concern (active-state indicator) and is intentionally left as a border so it sits inside the bar and aligns with the icon column — it is not migrated to a shadow.
- Low priority / cosmetic-internal: no public API change. Purely a CSS technique swap on the nav root.
