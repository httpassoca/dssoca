---
id: DS-0066
type: epic
title: "Quality & consistency pass — full codebase scan (June 2026)"
status: done
priority: high
tags: [quality, a11y, tokens, tests, ci, docs]
depends_on: []
parent: null
epic: null
created: 2026-06-11
updated: 2026-06-12
---

## Description
A full parallel scan of the repo (library, styles/tokens, tests, docs site, Storybook,
build/CI) surfaced ~70 findings. This epic groups the resulting improvement backlog:
SSR safety, token/theming correctness, size-variant rescaling, test coverage, docs
accuracy, Storybook controls, CI hardening, svelte-check fix, release automation, and
component API consistency.

## Acceptance criteria
- [x] All child stories (DS-0067 … DS-0078) are done or explicitly descoped.

## Notes
- Scan ran 2026-06-11 with six parallel read-only agents over the whole repo.
