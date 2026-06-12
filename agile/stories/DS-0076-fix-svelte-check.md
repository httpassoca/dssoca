---
id: DS-0076
type: story
title: "Fix svelte-check — make `pnpm check` clean and CI-enforceable"
status: done
priority: high
tags: [typescript, tooling, ci]
depends_on: []
parent: null
epic: DS-0066
created: 2026-06-11
updated: 2026-06-12
---

## Description
As a maintainer I can run `pnpm check` and trust the output. It currently reports a known
`$lib` alias error plus 50+ errors from `vitest-axe` type augmentation not being visible
under svelte-check's tsconfig context, so type regressions go unnoticed (CI skips it).

## Acceptance criteria
- [x] vitest-axe matcher types visible to svelte-check: `/// <reference types="vitest-axe" />`
  in `test/setup.ts` or a tsconfig `types` entry — those errors gone.
  *Done via a new `test/types.d.ts` ambient file instead (vitest-axe exports `AxeMatchers`
  but never augments vitest's `Assertion` itself, so a reference alone wouldn't help; the
  d.ts adds the `declare module 'vitest'` augmentation). `test/setup.ts` untouched.*
- [x] The `$lib` alias error resolved (tsconfig context fix) or conclusively documented as
  upstream with the issue linked. *Resolved: root `tsconfig.json` no longer overrides
  `module`/`moduleResolution` to `NodeNext`, which broke extensionless `$lib/...` imports.*
- [x] `moduleResolution` aligned: root `tsconfig.json` uses `NodeNext` while the generated
  `.svelte-kit/tsconfig.json` uses `bundler` — align on `bundler`. *Aligned by inheriting
  `bundler`/`esnext` from the generated config (overrides removed). Also added `@types/node`
  to satisfy the generated config's `types: ["node"]` (was a warning).*
- [x] The known rune-types quirk on `Image.svelte` `$state<T>()` re-checked after the
  tsconfig fixes (it may clear). *Re-checked: it does NOT clear and is now root-caused —
  `Image.svelte` declares `let state = $state<State>(...)`; svelte2tsx treats `$state` as a
  store subscription of the local variable `state` (circular), shadowing the rune. Fix is to
  rename the variable (e.g. `loadState`) in `Image.svelte` — not edited here (file owned by
  a parallel story); flagged for the integrator.*
- [x] `pnpm check` exits 0 (or with only documented known issues) and is added to CI.
  *Config-level errors fixed: 73 → 18. All remaining errors are file-level and owned by
  in-flight stories: Image.svelte (7, rename above), src/stories/* typings (9),
  test/harness/InputHarness.svelte autocomplete/inputmode types (2). Added to CI as a
  `continue-on-error` step — integrator removes the flag once those land clean.*
- [x] CLAUDE.md "known `$lib` alias error" note updated/removed. *Updated: fix documented,
  Image.svelte quirk + non-blocking CI status noted.*

## Notes
- See [[DS-0075-ci-hardening]] for the CI wiring; this story makes the check worth wiring.
- Quirk first recorded in DS-0065 notes.
