---
id: DS-0067
type: story
title: "SSR safety pass — guard window/document access, stable IDs"
status: done
priority: high
tags: [ssr, components, bug]
depends_on: []
parent: null
epic: DS-0066
created: 2026-06-11
updated: 2026-06-12
---

## Description
As a SvelteKit user I can server-render any dssoca component without crashes.
Some components touch `window`/`document` in effects without environment guards,
and Accordion generates IDs with `Math.random()` (unstable across server/client).

## Acceptance criteria
- [x] `Topbar.svelte` (~L67-70): `window.addEventListener`/`removeEventListener` wrapped
  in a `typeof window !== 'undefined'` guard (match the pattern in `toast.svelte.ts:48`).
- [x] `Menu.svelte` (~L181-182): `document` listeners guarded the same way; `onDocPointerDown`
  null-checks `panelEl` before `.contains()`.
- [x] `Accordion.svelte` (~L62): `idBase` derived from `$props.id()` instead of `Math.random()`
  so server- and client-rendered IDs match.
- [x] Unit tests cover the SSR-sensitive paths (render in a no-window-ish harness or assert
  guards), `pnpm test` green.
- [x] Documentation updated (docs.config.ts component notes if behavior is user-visible).

## Notes
- Found in the June 2026 quality scan; effects normally don't run on the server, but the
  guard pattern is the house convention and protects against eager evaluation.
- Implementation (2026-06-12): Topbar/Menu use the `hasWindow`/`hasDocument` const guard
  (toast.svelte.ts pattern); Accordion's default `idBase` is now `ss-acc-${$props.id()}`
  (per-instance stable, unique across instances — covered by a Math.random spy test).
  Tests assert listener lifecycle via spies plus the guard pattern itself (jsdom always
  has window/document, so the no-window branch is asserted at source level, as the AC
  allows). Docs: `accordion.ts` idBase prop description updated.
