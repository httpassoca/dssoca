---
id: DS-0153
type: task
title: "Inspirations: the twelve example sites"
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

One folder per site under `inspirations/` — dashboard, social, dating, chat, landing, blog, tracker, store, mail, board, music, settings — each `index.html` + layout-only `site.css` (+ optional page-local `site.js` for demo interactivity: toasts, view toggles, composers). Authored against the generated markup contract (the docs' server-rendered `htmlExample` per component) and the house rules: component markup only, tokens only, zero radius, self-contained inline-SVG placeholders, WCAG 2.2 AA (landmarks, single `h1`, labels, names), responsive to ~375px. Verified page by page in headless Chromium (both themes, 1280 + 390 px) and with a browser axe pass.
