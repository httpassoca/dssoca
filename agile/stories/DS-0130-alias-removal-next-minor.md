---
id: DS-0130
type: story
title: "Remove deprecated --ss-purple / --ss-lime aliases"
status: todo
priority: low
tags: [tokens, colors, breaking, cleanup]
depends_on: [DS-0126]
parent: null
epic: DS-0125
created: 2026-07-09
updated: 2026-07-09
---

## Description

As a maintainer, I want the one-minor deprecation window honoured: `--ss-purple` (→
`--ss-magenta`) and `--ss-lime` (→ `--ss-green`) shipped as aliases in 0.12.0 and must be deleted
in the following minor, with the removal called out in the CHANGELOG.

## Acceptance criteria

- [ ] Alias declarations removed from `src/styles/_tokens.scss` Layer B.
- [ ] `tokens-css` structural test flipped to assert the aliases are GONE.
- [ ] `docs/tokens.md` deprecation table updated to "removed in <version>".
- [ ] CHANGELOG breaking note.
