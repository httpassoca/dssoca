---
id: DS-0190
type: task
title: "LogStream: Front-End Checklist fixes"
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

Front-End Checklist findings for `LogStream` (issue #139).

- **Medium · color-contrast** — switched-off level chips used `opacity: 0.45` (~3.7:1 dark, ~2.6:1 light). Fixed: `[aria-pressed='false']` now uses `color: var(--ss-fg-muted)` plus `border-style: dashed`, so "off" is also signalled by shape, not only by colour. `--ss-fg-faint` was tried first but measured only 3.82:1 on the light `--ss-code-bg` in a real browser (it is AA-tuned against `--ss-bg`); `--ss-fg-muted` measures ≥4.5:1 in both themes. Test: source check that the off rule has no `opacity` and uses the muted token + dashed border.
- **Low · keyboard-navigation** — the scrollable `role="log"` had no `tabindex`. Fixed: `tabindex="0"` (with a `svelte-ignore a11y_no_noninteractive_tabindex`); the base `:focus-visible` ring applies. Test: region has `tabindex="0"` and can receive focus.
- **Low · aria-live-regions** — the default empty state was `<EmptyState>` (`role="status"`) nested in the `role="log"` live region. Fixed: replaced with plain text (`.empty` > `.empty-title` + `.empty-msg`) styled in LogStream's scoped block; EmptyState is no longer imported. Tests: no `role=status|alert`/`aria-live` descendant inside the log; filtered-empty message still shown.

Docs (`log-stream.ts`) updated: notes + `empty` snippet guidance.
