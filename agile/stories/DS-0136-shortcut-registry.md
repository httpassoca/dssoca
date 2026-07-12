---
id: DS-0136
type: story
title: "Shortcut registry core — shortcuts.svelte.ts + attachment"
status: done
priority: high
tags: [api, a11y, keyboard, feature]
depends_on: []
parent: null
epic: DS-0135
created: 2026-07-12
updated: 2026-07-12
---

## Description

As a dssoca consumer, I want to register app-level keyboard shortcuts with one call — with input
guarding, platform `mod` resolution, and WCAG 2.1.4 disable/remap built in — instead of
hand-rolling `window` keydown listeners in every app.

New module `src/lib/shortcuts.svelte.ts` (house pattern: `toast.svelte.ts` — internal class with
`$state` fields, module singleton, **class not exported**). Public surface (barrel-exported):

- `shortcuts` singleton: reactive `items: readonly ShortcutInfo[]`; `$state` toggles `enabled`
  (global kill switch) and `characterKeys` (when `false`, modifier-less bindings never fire —
  the GitHub-style 2.1.4 switch); `add(options): () => void`; `setEnabled(id, bool)`;
  `remap(id, keys | null)` (**null = restore default**); `getOverrides()` / `applyOverrides(o)` /
  `resetOverrides()`. `ShortcutOverrides` is serializable and **includes the global
  `enabled`/`characterKeys` toggles** (compliance that resets every visit isn't compliance;
  storage itself stays app policy).
- `shortcut(options | () => options): Attachment` — `{@attach}` sugar: registers on mount, cleans
  up on unmount, re-registers reactively; enables `scope: 'focus'` (fires only while focus is
  within the attached element — the SC 2.1.4 active-on-focus escape hatch).
- Pure formatters `formatShortcut(keys, { format: 'glyph' | 'label', platform })` and
  `ariaKeyshortcuts(keys, platform?)` (spec syntax, e.g. `Meta+K`) — no registry coupling.
- `ShortcutOptions`: **required `id` + `label` + `keys` + `onPress(event)`**; optional `group`,
  `scope` (default `'global'`), `enabled: boolean | () => boolean`, `allowInInputs`,
  `allowRepeat`, `preventDefault` (default `true`). dssoca-owned ids use the `ss:*` namespace.

**Grammar**: `+`-joined modifiers (`mod|ctrl|alt|shift|meta`) + exactly one key (lowercased
`event.key`: `k`, `?`, `escape`, `arrowup`, `f1`); `mod` = `meta` on Apple, `ctrl` elsewhere
(single mockable `isMacLike()`); comma = alternatives (`'?, mod+/'`); **space reserved** —
sequences are a parse error in v1 so they can land additively; canonical normalization; parser
throws on malformed input at registration time.

**Matcher** (single lazy window `keydown` listener, bubble phase; attached on first browser
`add()`, detached when the registry empties) — skip chain, in order:

1. `!shortcuts.enabled`
2. `event.defaultPrevented` (a component that handled the key wins over globals)
3. `event.isComposing` (IME)
4. `event.repeat` unless `allowRepeat`
5. modifier-less binding while `!shortcuts.characterKeys`
6. target is `input`/`textarea`/`select`/`[contenteditable]` unless `allowInInputs`
7. a modal `<dialog>` is open and the shortcut isn't focus-scoped inside it (SC 2.1.2 — inertness
   stops focus, not global key handlers)

**Shift rule**: ignore `shiftKey` when the bound key is a shifted printable (`?` matches as
typed); `'shift+/'`-style spellings dev-warn. **Conflicts**: focus-scoped beats global;
last-registered wins within a tier; exactly one shortcut fires per event; dev `console.warn` on
duplicate `id` and on known reserved combos (`ctrl+t/w/n`, bare `h/k/t/1–6` that collide with SR
browse-mode quick keys). **SSR**: `add()` is a full no-op without `window` (noop disposer — no
cross-request singleton-state leak); no `window`/`document` at module scope.

**Peer bump**: `svelte@^5.0.0` → `^5.29` in `package.json` (attachments), CHANGELOG-flagged.

## Acceptance criteria

- [x] `src/lib/shortcuts.svelte.ts` implements the surface above; barrel exports `shortcuts`,
      `shortcut`, `formatShortcut`, `ariaKeyshortcuts` + types (`ShortcutOptions`,
      `ShortcutInfo`, `ShortcutOverrides`); the registry class is **not** exported.
- [x] Parser: table-driven tests — canonical normalization, comma alternatives, `mod` resolution
      both platforms (mocked), throws on sequences/multi-key/unknown modifiers, `shift+/`
      dev-warn.
- [x] Matcher: synthetic `KeyboardEvent` dispatch on `window` covers the full skip chain,
      shift-on-printable rule, `preventDefault` default vs opt-out, alternatives, conflict
      tiers (exactly one fires), modal-dialog suppression.
- [x] 2.1.4 mechanics: `setEnabled(id,false)` silences; `remap` fires on the new combo only,
      `remap(id,null)` restores; `getOverrides` → `applyOverrides` round-trips including the
      global toggles; `characterKeys=false` kills `/`-style but not `mod+k`.
- [x] Lifecycle: `addEventListener` spies prove lazy attach / detach-at-zero / one listener for N
      shortcuts; disposers are idempotent; attachment harness (`test/harness/`) proves
      mount-register / unmount-clean / reactive re-register / `scope:'focus'`.
- [x] SSR posture: `add()` without `window` registers nothing and returns a working noop
      disposer.
- [x] Peer bump to `^5.29` lands with a CHANGELOG entry; `pnpm test`, `pnpm check`, `pnpm pack`
      green (coverage thresholds hold over the new module).
- [x] Registry API reference documented (`docs/shortcuts.md` — the API tables the guide page
      [[DS-0140-keyboard-guide-page]] will embed). Agile board rebuilt.
