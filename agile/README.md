# agile/ — this project's tracker

Structured, machine-readable work tracking for this project. **Stories** = user
necessities (what the owner can *do*). **Tasks** = the technical work to deliver a
story. One markdown file per item; the board is the generated `index.html`.

> Full method (shareable, project-agnostic): see **`/AGILE.md`** at the repo root.

## Layout

```
agile/
  README.md      ← you are here
  build.mjs      ← generator (zero deps): `node build.mjs` → rebuilds index.html
  index.html     ← the board. Open it directly — no server, no build needed to view.
  stories/       ← user-facing needs        (<SLUG>-0001-title.md)
  tasks/         ← technical work items      (parent = a story id)
  epics/         ← optional grouping above stories (empty until needed)
```

## Item format

```markdown
---
id: SLUG-0001          # uppercase project slug + 4-digit number, one counter per project
type: story            # story | task | epic
title: Short user-facing title
status: todo            # backlog | todo | in-progress | blocked | done
priority: high          # high | low
tags: [api]
depends_on: []          # ids this item waits on
parent: null            # task → its story id
epic: null              # story → its epic id (usually null)
created: 2026-01-01
updated: 2026-01-01
---

## Description
What + why (user POV for stories).

## Acceptance criteria
- [ ] testable outcome
- [ ] Documentation updated (docs.config.ts component page + docs/tokens.md / docs/themes.md as needed)

## Notes
- verification cmd, file refs
```

Tasks need only `## Description`. A task's done-ness is its `status`, not a checkbox.

The **Documentation updated** acceptance criterion is a standing default: every story (and any
task that changes a user-facing API or token) carries it, mirroring the repo-root CLAUDE.md
"Docs are a RULE". Drop it only when the work genuinely has no docs surface (e.g. pure CI tweaks).

## Keep it agile — the RULE

Whenever you change this project:
1. Add or update the relevant **story** (user need) and/or **task** (tech work).
2. Move its `status` along `backlog → todo → in-progress → blocked → done`; bump `updated`.
3. Run `node build.mjs` here to refresh this board, then refresh the root board (`agile/` at the repo root).
4. Recommend to the owner what to log so the tracker stays current.
