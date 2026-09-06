---
id: DS-0152
type: task
title: "Inspirations: gallery page + shared axes.js"
status: done
priority: high
tags: [vanilla, examples]
depends_on: []
parent: DS-0150
epic: null
created: 2026-09-06
updated: 2026-09-06
---

## Description

`inspirations/index.html` (+ `site.css`, `site.js`): header, Heading + lede + CDN snippet, theme/size SegmentedControls (vanilla.js `ss:change` → `setAxes`), a responsive grid of interactive Cards — thumbnail (`thumbs/<slug>.png`, striped token placeholder when missing), title, kind, blurb, component-chip Badges, overlay link `target=_blank rel=noopener` carrying `data-inspiration=<slug>` (the drift test's anchor). `inspirations/assets/axes.js`: applies `?theme=&size=` or the saved choice to `<html>` on import; exports `setAxes` / `getAxes`.
