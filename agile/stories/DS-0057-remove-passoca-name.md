---
id: DS-0057
type: story
title: "Remove the personal name 'Passoca' from product-facing surfaces"
status: done
priority: medium
tags: [branding, cleanup, docs]
depends_on: []
parent: null
epic: null
created: 2026-06-09
updated: 2026-06-09
---

## Description
The design system is self-branded (**dssoca**) and should not carry the author's
personal name. Per "keep my things, but not my name", scrub the personal name
**Passoca** from every product-facing / branding / live-source surface, while
preserving infrastructure and legal ownership.

## Scrubbed (this PR)
- [x] **Brand logo renamed** `documentation/static/passoca-logo.svg` →
  `dssoca-logo.svg` (artwork kept — it's the dssoca mark now); refs updated in
  `app.html` (favicon), `+layout.svelte` (top bar), `+page.svelte` (hero).
- [x] **Live source/doc prose** that named the author's personal site reworded to
  neutral wording ("the source website", a generic pattern): `src/styles/theme.scss`,
  `src/styles/components/_index.scss`, `src/lib/index.ts`, `docs/tokens.md`,
  `documentation/CLAUDE.md`, `documentation/src/lib/component-docs/index.ts`,
  `documentation/src/lib/component-docs/bottom-nav.ts` (user-facing description),
  `DESIGN.md` (intro line + the 0.4.0 changelog line that named the removed
  `PassocaMark`).
- [x] **First name too** ("not my name"): the author's first name `rafael` shipped
  as sample/default data — scrubbed to a neutral `admin`: the published `Topbar`
  `user` default (`admin@hub.home`), the `LogStream` demo line (`user=admin`), the
  Storybook stories (Topbar/Input/LogStream), the `Input` docs placeholder, and the
  two unit tests that assert those literals. The homelab flavour (`hub.home`,
  service names) is impersonal and kept.
- [x] Regression guard: `documentation/test/branding.test.ts` (chrome never
  references `passoca-logo`; the `dssoca-logo.svg` asset exists).
- [x] `pnpm test` (496) + `pnpm docs:test` green; `pnpm docs:build` clean (logo resolves).

## Intentionally KEPT (with reasons — see follow-up for the decision)
- **GitHub URLs** containing `httpassoca` (repo / homepage / bugs / repository) —
  real infrastructure; renaming them 404s every link. = "my things".
- **Legal / ownership attribution** — `LICENSE` copyright holder, `package.json`
  `author`, the `README` license footer all still read **"Rafael Passoca"**.
  Changing a copyright holder is a deliberate legal act and *preserving* it is the
  literal embodiment of "keep my things". Left unchanged and flagged for the user
  (pre-written diffs in the follow-up task) — a 3-line change if full removal is
  wanted.
- **Historical agile records** (19 `agile/*.md` story/epic/task files) — an audit
  trail of what was done (the `DS-0043` epic, `PassocaMark` removal in `DS-0014`,
  etc.), like git history. `DS-0014` set the precedent to leave historical records
  intact. Not rewritten; flagged so the user can request a deeper scrub.

## Notes
- The `dssoca` package name and the `ss-`/`--ss-*` prefixes are the system's own
  identity (not the personal name) — untouched.
