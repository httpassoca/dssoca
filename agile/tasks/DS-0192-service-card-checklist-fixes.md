---
id: DS-0192
type: task
title: "ServiceCard: Front-End Checklist fixes"
status: done
priority: low
tags: [a11y, components]
depends_on: []
parent: DS-0161
epic: null
created: 2026-11-13
updated: 2026-11-13
---

## Description

Fixes the ServiceCard findings from GitHub issue #139 (Front-End Checklist audit).

- **Medium · `aria-roles` / `keyboard-navigation`**: fixed. A card without `onclick` or `href`
  was still `role="button" tabindex="0"` with an "▸ open" cue that did nothing. The card is now
  interactive only when `href` or `onclick` is set (and not `loading`/`disabled`); otherwise it
  is a static `role="group"` with no tab stop and no cue. The `role="button"` div and its
  hand-rolled Enter/Space handler are gone: `onclick` now renders a native `<button>`.
- **Medium · `aria-labels`**: fixed. The root no longer carries an `aria-label` that replaced the
  content. Mirroring Card (DS-0183), an interactive card renders ONE stretched overlay control
  (`<a class="overlay">` or `<button class="overlay">`, absolutely positioned over the card) as a
  sibling of the content. It is named by `aria-labelledby` (name + status) and described by
  `aria-describedby` (host, latency, `meta`, sparkline, "last checked" time). Static and disabled
  cards use the same labelledby/describedby on their `role="group"`; loading keeps the
  `aria-label` fallback because its content is skeletons. `meta` sits above the overlay
  (`z-index: 1`), so controls in it are never nested inside a link or button. The "▸ open" cue is
  now `aria-hidden`.
- **Low · `aria-text`**: fixed. `spark` defaults to `[]` (Sparkline's "No data" state) rather
  than a made-up series. This is a behaviour change and goes in the changelog.

Tests (`test/unit/ServiceCard.svelte.test.ts`, harness `test/harness/ServiceCardHarness.svelte`):
static card has no button/link/tabindex/cue; static group name + description; button mode is a
native `<button>` named by name + status, described by host/latency; "open" cue is aria-hidden;
meta link not nested in the button and included in its description; link overlay name and
description; default spark renders "No data"; disabled card shows no cue.
- **Lead follow-up:** the docs demos (`HubTile.svelte`, `/components` page) pass explicit `spark` data now that the default is `[]`.
