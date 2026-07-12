# Keyboard shortcuts — registry API reference

`dssoca` ships an app-level keyboard-shortcut registry (`DS-0136`): one module-singleton with a
single lazy `window` keydown listener, WCAG 2.1.4 disable/remap mechanics built in, and pure
formatters for display. The full "making your site keyboard-friendly" guide lives in the
documentation app (`DS-0140`); this file is the API reference it embeds.

```ts
import { shortcuts, shortcut, formatShortcut, ariaKeyshortcuts } from 'dssoca'
```

Requires `svelte@^5.29` (the `shortcut()` attachment is typed against `svelte/attachments`).

## Combo grammar

`+`-joined modifiers plus **exactly one key**, comma for alternatives:

| Rule         | Detail                                                                                       |
| ------------ | -------------------------------------------------------------------------------------------- |
| Modifiers    | `mod` \| `ctrl` \| `alt` \| `shift` \| `meta`                                                |
| `mod`        | Resolves to `meta` (⌘) on Apple platforms, `ctrl` elsewhere — resolved at match time         |
| Key          | Lowercased `event.key`: `k`, `?`, `escape`, `arrowup`, `f1`, `+` (spelled `mod++`)           |
| Alternatives | Comma-separated: `'?, mod+/'` — any alternative fires the handler                            |
| Shift rule   | Shifted printables match as typed: bind `'?'`, not `'shift+/'` (the latter dev-warns)        |
| Sequences    | **Space is reserved** — `'g i'` is a parse error in v1 (sequences can land additively later) |
| Errors       | Malformed input throws at registration time (`add`, `remap`, and both formatters)            |

Canonical normalization (modifier order `mod, ctrl, alt, shift, meta`, lowercased) is applied to
everything the registry stores and reports.

## `shortcuts` singleton

| Member                    | Type / signature                            | Notes                                                                                                                                 |
| ------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `items`                   | `readonly ShortcutInfo[]` (reactive)        | Registration order; feeds ShortcutsHelp                                                                                               |
| `enabled`                 | `boolean` (`$state`, default `true`)        | Global kill switch (WCAG 2.1.4 "turn off")                                                                                            |
| `characterKeys`           | `boolean` (`$state`, default `true`)        | When `false`, modifier-less bindings never fire; `mod+`/`ctrl+`/`alt+` combos are unaffected                                          |
| `add(options, element?)`  | `(ShortcutOptions, Element?) => () => void` | Returns an idempotent disposer. Full no-op on the server (noop disposer). `element` is supplied by the attachment                     |
| `setEnabled(id, enabled)` | `(string, boolean) => void`                 | Per-shortcut user override; persists in overrides                                                                                     |
| `remap(id, keys)`         | `(string, string \| null) => void`          | `null` restores the registered default; throws on malformed keys                                                                      |
| `getOverrides()`          | `() => ShortcutOverrides`                   | Serializable snapshot **including** the global `enabled`/`characterKeys` toggles                                                      |
| `applyOverrides(o)`       | `(ShortcutOverrides) => void`               | Merges a persisted snapshot back in; unknown ids are kept for later mounts; malformed persisted combos are skipped with a dev warning |
| `resetOverrides()`        | `() => void`                                | Clears every per-id override and restores the global toggles                                                                          |

Storage is app policy: persist `getOverrides()` wherever you keep preferences (e.g. localStorage)
and feed it back through `applyOverrides()` at startup.

## `ShortcutOptions`

| Option           | Type                             | Default    | Notes                                                                                           |
| ---------------- | -------------------------------- | ---------- | ----------------------------------------------------------------------------------------------- |
| `id`             | `string`                         | (required) | Stable unique handle for overrides. dssoca-owned ids use `ss:*`                                 |
| `label`          | `string`                         | (required) | Human-readable action name (ShortcutsHelp, AT)                                                  |
| `keys`           | `string`                         | (required) | Combo grammar above                                                                             |
| `onPress`        | `(event: KeyboardEvent) => void` | (required) | Handler                                                                                         |
| `group`          | `string`                         | —          | Display grouping                                                                                |
| `scope`          | `'global' \| 'focus'`            | `'global'` | `'focus'` fires only while the event target is inside the attached element (use the attachment) |
| `enabled`        | `boolean \| () => boolean`       | `true`     | Contextual gate; a user `setEnabled(id, false)` additionally silences — both must agree         |
| `allowInInputs`  | `boolean`                        | `false`    | Fire from `input`/`textarea`/`select`/contenteditable (ancestors checked)                       |
| `allowRepeat`    | `boolean`                        | `false`    | Fire on held-key auto-repeat                                                                    |
| `preventDefault` | `boolean`                        | `true`     | `event.preventDefault()` before `onPress`                                                       |

## Matcher rules

Single lazy `window` keydown listener (bubble phase) — attached on the first browser-side `add()`,
detached when the registry empties. Skip chain, in order:

1. `!shortcuts.enabled`
2. `event.defaultPrevented` — a component that handled the key wins over globals
3. `event.isComposing` (IME)
4. `event.repeat` unless `allowRepeat`
5. modifier-less combo while `!shortcuts.characterKeys`
6. target is `input`/`textarea`/`select`/contenteditable unless `allowInInputs`
7. a modal `<dialog>` is open and the shortcut isn't focus-scoped inside it (SC 2.1.2)

**Exactly one shortcut fires per event**: focus-scoped beats global; last-registered wins within a
tier (a disabled later registration yields to an earlier eligible one).

Dev-only warnings: duplicate `id`, `'shift+/'`-style spellings, reserved combos (`ctrl+t/w/n`) and
bare SR browse-mode quick keys (`h`, `k`, `t`, `1`–`6`).

## `shortcut()` attachment

```svelte
<script>
  import { shortcut } from 'dssoca'
</script>

<section {@attach shortcut(() => ({ id: 'app:save', label: 'Save', keys: 'mod+s', onPress: save }))}>
```

`shortcut(options | () => options): Attachment` — registers on mount, cleans up on unmount, and
(with the thunk form) re-registers reactively when any state it reads changes. The attached element
anchors `scope: 'focus'` registrations.

## Pure formatters

No registry coupling; both throw on malformed input and default `platform` to the detected one.

| Function                                       | Example                                                                                                                                                                                       |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `formatShortcut(keys, { format?, platform? })` | `('mod+k', { format: 'glyph', platform: 'apple' })` → `⌘K`; `('mod+k', { format: 'glyph', platform: 'other' })` → `Ctrl+K`; `('mod+k', { format: 'label', platform: 'apple' })` → `Command+K` |
| `ariaKeyshortcuts(keys, platform?)`            | `('mod+k', 'apple')` → `Meta+K`; `('?, mod+/', 'other')` → `? Control+/` (spec syntax, space-separated alternatives)                                                                          |

`format: 'glyph'` (default) concatenates Apple glyphs (`⌘K`) and joins with `+` elsewhere
(`Ctrl+K`); `'label'` uses speakable words (`Command+K`). Alternatives join with `/`.
