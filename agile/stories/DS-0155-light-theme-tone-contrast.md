---
id: DS-0155
type: story
title: "Light-theme tone contrast: Badge brand/info and LogStream chips fall short of AA"
status: backlog
priority: high
tags: [a11y, color, tokens, badge, log-stream]
depends_on: [DS-0125]
parent: null
epic: null
created: 2026-09-06
updated: 2026-09-06
---

## Description

As a user of the light theme, I want every tone-coloured label to meet WCAG 2.2 AA (4.5:1) so
status text is readable. A real-browser axe pass over the Inspirations pages
([[DS-0150-inspirations-example-sites]]) found component-level failures that the jsdom suite
cannot see (colour contrast needs layout): in **light** theme the Badge `brand` tone measures
4.0–4.5:1 and `info` 3.95:1, and LogStream's `info` / `warn` filter chips 3.8 / 4.35:1. Dark
theme passes (fg-muted 5.6:1 on `--ss-bg-elev`, 4.7:1 on the neutral badge wash). The fix belongs
in the hand-maintained semantic layer of `_tokens.scss` (the light `--ss-badge-*-fg` /
LogStream level colours), not in pages.

## Acceptance criteria

- [ ] Light theme: every Badge tone and every LogStream level chip ≥ 4.5:1 on its own wash over
  `--ss-bg-elev` (measure in a real browser; the docs Theme Builder contrast report is the
  reference tool).
- [ ] Dark theme unchanged or improved; no regression in `pnpm gen:palette` contrast report.
- [ ] A repeatable browser contrast check (script or test) so this cannot regress silently.
- [ ] Documentation updated (`docs/themes.md` / `docs/tokens.md` if token values change; CHANGELOG).

## Notes

- Measured with axe-core 4.13 in headless Chromium on `inspirations/dashboard` and
  `inspirations/settings` (light): `.ss-badge.info` 3.95, `.ss-badge.brand` 4.04–4.46,
  `.ss-logs .chip.info` 3.81, `.chip.warn` 4.35.
- Related fixes already shipped in 0.18.0: MetricTile `.small` / emphasis chip / period label.
