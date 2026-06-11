---
id: DS-0076
type: story
title: "Fix svelte-check — make `pnpm check` clean and CI-enforceable"
status: todo
priority: high
tags: [typescript, tooling, ci]
depends_on: []
parent: null
epic: DS-0066
created: 2026-06-11
updated: 2026-06-11
---

## Description
As a maintainer I can run `pnpm check` and trust the output. It currently reports a known
`$lib` alias error plus 50+ errors from `vitest-axe` type augmentation not being visible
under svelte-check's tsconfig context, so type regressions go unnoticed (CI skips it).

## Acceptance criteria
- [ ] vitest-axe matcher types visible to svelte-check: `/// <reference types="vitest-axe" />`
  in `test/setup.ts` or a tsconfig `types` entry — those errors gone.
- [ ] The `$lib` alias error resolved (tsconfig context fix) or conclusively documented as
  upstream with the issue linked.
- [ ] `moduleResolution` aligned: root `tsconfig.json` uses `NodeNext` while the generated
  `.svelte-kit/tsconfig.json` uses `bundler` — align on `bundler`.
- [ ] The known rune-types quirk on `Image.svelte` `$state<T>()` re-checked after the
  tsconfig fixes (it may clear).
- [ ] `pnpm check` exits 0 (or with only documented known issues) and is added to CI.
- [ ] CLAUDE.md "known `$lib` alias error" note updated/removed.

## Notes
- See [[DS-0075-ci-hardening]] for the CI wiring; this story makes the check worth wiring.
- Quirk first recorded in DS-0065 notes.
