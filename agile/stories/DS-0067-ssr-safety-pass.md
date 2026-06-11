---
id: DS-0067
type: story
title: "SSR safety pass — guard window/document access, stable IDs"
status: todo
priority: high
tags: [ssr, components, bug]
depends_on: []
parent: null
epic: DS-0066
created: 2026-06-11
updated: 2026-06-11
---

## Description
As a SvelteKit user I can server-render any dssoca component without crashes.
Some components touch `window`/`document` in effects without environment guards,
and Accordion generates IDs with `Math.random()` (unstable across server/client).

## Acceptance criteria
- [ ] `Topbar.svelte` (~L67-70): `window.addEventListener`/`removeEventListener` wrapped
  in a `typeof window !== 'undefined'` guard (match the pattern in `toast.svelte.ts:48`).
- [ ] `Menu.svelte` (~L181-182): `document` listeners guarded the same way; `onDocPointerDown`
  null-checks `panelEl` before `.contains()`.
- [ ] `Accordion.svelte` (~L62): `idBase` derived from `$props.id()` instead of `Math.random()`
  so server- and client-rendered IDs match.
- [ ] Unit tests cover the SSR-sensitive paths (render in a no-window-ish harness or assert
  guards), `pnpm test` green.
- [ ] Documentation updated (docs.config.ts component notes if behavior is user-visible).

## Notes
- Found in the June 2026 quality scan; effects normally don't run on the server, but the
  guard pattern is the house convention and protects against eager evaluation.
