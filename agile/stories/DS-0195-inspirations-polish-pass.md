---
id: DS-0195
type: story
title: "Inspirations: polish pass on all twelve example pages and the gallery"
status: done
priority: low
tags: [inspirations, design, polish]
depends_on: [DS-0161]
parent: null
epic: null
created: 2026-11-13
updated: 2026-11-13
---

## Description

As someone evaluating dssoca, I want the example pages to show the system at its best, so the
chrome stays quiet and each page has one piece of content that carries the colour. An "unslop"
audit of the gallery and all twelve pages found light slop on top of a sound design, so this is a
polish pass: only the audited items change. dssoca's identity stays as it is (monospace type, zero
radius, uppercase section labels, the green accent, square status dots, the Heading highlight bar).

What changed, by kind:

- **Oversized links.** The root font is 20px and a bare `.ss-link` inherits it at weight 600, so
  nav links, hashtags and names rendered larger than body text. Their containers now set a size
  token, and rest-state nav links are muted (landing, store, blog, social, settings).
- **Accent kept for what matters.** Social, music, landing and blog had green on everything; it now
  sits on the primary action, the active item and the page's one rich piece.
- **Badge piles and unverifiable flourishes.** Store, landing, settings, board, tracker, chat and
  mail: type/label badges are neutral, status badges keep their tone, scores and counts are quiet
  mono text. Landing drops the "v2.0" pill and the "save 20%" badge; the "trusted by" strip stays,
  smaller and muted.
- **Decoration.** Landing loses the green glow and hero wash, music the header wash, dating the
  striped backdrop and sparkle logo, store the gallery wash, the gallery its hover scale.
- **Text glyphs as icons.** ★ ♥ ✕ ⌕ ↩ ⇄ become icon markup (mail, store, dating, social).
- **Layout bugs found on the way.** Landing used an undefined `--ss-s-14` (hero padding was 0);
  dashboard cards overflowed at 390px; tracker and board headings had the highlight under one word;
  tracker printed each title twice; dating had a dead band above the bottom nav.
- **Component fix.** `Card`'s overlay `<button>` (DS-0183) sat in the flow as an inline-block and
  left an empty line under the footer; the overlay now takes no layout space.

## Acceptance criteria

- [x] Every audited item fixed or deliberately left with a reason (see the PR description)
- [x] Pages still follow the inspirations contract (`test/unit/inspirations.test.ts`, incl. axe)
- [x] Checked in dark, light and at phone width
- [x] Documentation updated — not applicable (no API or token change)

## Notes

- Method: the `unslop` skill by Damir Sokolovsky (@heydamir), CC BY 4.0, in polish mode.
- Known and left: a few px of horizontal overflow at 390px on social, mail, music and chat. It is
  the same on the deployed site and comes from component CSS (hidden Tooltip tips), not this pass.
