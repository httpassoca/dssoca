import { untrack } from 'svelte'
import type { Attachment } from 'svelte/attachments'

/** Where a shortcut listens: everywhere, or only while focus is inside the attached element. */
export type ShortcutScope = 'global' | 'focus'
/** Modifier rendering family: Apple (⌘/⌥) vs everything else (Ctrl/Alt). */
export type ShortcutPlatform = 'apple' | 'other'
/** Presentation style for `formatShortcut`. */
export type ShortcutFormat = 'glyph' | 'label'

export interface ShortcutOptions {
  /**
   * Stable unique identifier — the handle for `setEnabled` / `remap` and the
   * key under which overrides persist. dssoca-owned shortcuts use the `ss:*`
   * namespace; apps should pick their own prefix.
   */
  id: string
  /** Human-readable action name (shown by ShortcutsHelp, read by AT). */
  label: string
  /**
   * Key combo(s): `+`-joined modifiers (`mod`|`ctrl`|`alt`|`shift`|`meta`)
   * plus exactly one key (lowercased `event.key`: `k`, `?`, `escape`,
   * `arrowup`, `f1`). `mod` resolves to `meta` on Apple platforms and `ctrl`
   * elsewhere. Comma separates alternatives (`'?, mod+/'`). Space is
   * reserved (sequences are a parse error). Malformed input throws at
   * registration time.
   */
  keys: string
  /** Invoked when the shortcut fires (after `preventDefault` unless opted out). */
  onPress: (event: KeyboardEvent) => void
  /** Optional grouping label for display (ShortcutsHelp sections). */
  group?: string
  /**
   * `'global'` (default) listens on `window`; `'focus'` only fires while the
   * event target is inside the attached element — use via the `shortcut()`
   * attachment (a focus-scoped shortcut without an element never fires).
   */
  scope?: ShortcutScope
  /**
   * Contextual availability gate owned by the registering code. A user-level
   * `setEnabled(id, false)` override additionally silences the shortcut; the
   * shortcut fires only when *both* agree.
   */
  enabled?: boolean | (() => boolean)
  /** Fire even when typing in inputs/textareas/selects/contenteditable. */
  allowInInputs?: boolean
  /** Fire on held-key auto-repeat events. */
  allowRepeat?: boolean
  /** Call `event.preventDefault()` before `onPress`. Default `true`. */
  preventDefault?: boolean
}

/** Read-only view of a registered shortcut (feeds ShortcutsHelp). */
export interface ShortcutInfo {
  id: string
  label: string
  group?: string
  scope: ShortcutScope
  /** Effective canonical combo — the remap override when one is set. */
  keys: string
  /** Canonical combo as registered (what `remap(id, null)` restores). */
  defaultKeys: string
  /** Effective state: user override AND the registration's own `enabled`. */
  enabled: boolean
}

/** Per-shortcut user override (both fields optional and independent). */
export interface ShortcutOverride {
  enabled?: boolean
  /** Canonical remapped combo string. */
  keys?: string
}

/**
 * Serializable snapshot of every user-facing shortcut setting — including the
 * global `enabled` / `characterKeys` toggles (WCAG 2.1.4 compliance that
 * resets every visit isn't compliance). Persist it wherever your app keeps
 * preferences and feed it back through `applyOverrides`.
 */
export interface ShortcutOverrides {
  enabled?: boolean
  characterKeys?: boolean
  shortcuts?: Record<string, ShortcutOverride>
}

export interface FormatShortcutOptions {
  /** `'glyph'` (default): `⌘K` / `Ctrl+K`. `'label'`: `Command+K` / `Ctrl+K`. */
  format?: ShortcutFormat
  /** Defaults to the detected platform. */
  platform?: ShortcutPlatform
}

// ---------------------------------------------------------------------------
// Dev-only warnings
// ---------------------------------------------------------------------------

/**
 * Dev gate: Vite consumers get `import.meta.env.DEV` (statically replaced in
 * prod builds); non-Vite environments fall back to `NODE_ENV`.
 */
function isDev(): boolean {
  try {
    const dev = import.meta.env?.DEV
    if (typeof dev === 'boolean') return dev
  } catch {
    // no bundler-provided env — fall through
  }
  try {
    return typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production'
  } catch {
    return false
  }
}

function devWarn(message: string): void {
  if (isDev() && typeof console !== 'undefined') console.warn(`[dssoca] shortcuts: ${message}`)
}

// ---------------------------------------------------------------------------
// Combo grammar — parsed at registration time, canonical forms stored
// ---------------------------------------------------------------------------

const MODIFIER_ORDER = ['mod', 'ctrl', 'alt', 'shift', 'meta'] as const
type Modifier = (typeof MODIFIER_ORDER)[number]
const MODIFIER_SET = new Set<string>(MODIFIER_ORDER)

interface ParsedCombo {
  mod: boolean
  ctrl: boolean
  alt: boolean
  shift: boolean
  meta: boolean
  /** Lowercased `event.key` value. */
  key: string
  /** Normalized string form: ordered modifiers + key, e.g. `mod+shift+k`. */
  canonical: string
}

/** Shifted printables (`?`, `!`, `/`…) already encode shift in `event.key`. */
function isShiftAgnostic(key: string): boolean {
  return key.length === 1 && !/[a-z0-9]/.test(key)
}

/** A combo with no ctrl/alt/meta/mod is a "character key" per WCAG 2.1.4. */
function isCharacterCombo(combo: ParsedCombo): boolean {
  return !combo.ctrl && !combo.alt && !combo.meta && !combo.mod
}

function parseError(raw: string, reason: string): Error {
  return new Error(`[dssoca] shortcuts: cannot parse "${raw}" — ${reason}`)
}

function parseCombo(raw: string): ParsedCombo {
  const combo = raw.trim()
  if (combo === '') throw parseError(raw, 'empty combo')
  if (/\s/.test(combo)) {
    throw parseError(raw, 'space is reserved for key sequences, which are not supported yet')
  }

  // Tokenize on '+'; a trailing '++' means the literal '+' key ('mod++').
  let key: string
  let modifierTokens: string[]
  if (combo === '+') {
    key = '+'
    modifierTokens = []
  } else if (combo.endsWith('+')) {
    const head = combo.slice(0, -1)
    if (!head.endsWith('+')) throw parseError(raw, 'missing key after the trailing "+"')
    const mods = head.slice(0, -1)
    key = '+'
    modifierTokens = mods === '' ? [] : mods.split('+')
  } else {
    const tokens = combo.split('+')
    key = tokens.pop() ?? ''
    modifierTokens = tokens
  }

  key = key.toLowerCase()
  if (key === '') throw parseError(raw, 'missing key')

  const flags: Record<Modifier, boolean> = {
    mod: false,
    ctrl: false,
    alt: false,
    shift: false,
    meta: false,
  }
  for (const token of modifierTokens) {
    const name = token.toLowerCase()
    if (!MODIFIER_SET.has(name)) {
      throw parseError(
        raw,
        `unknown modifier "${token}" (expected mod|ctrl|alt|shift|meta, and exactly one key)`,
      )
    }
    if (flags[name as Modifier]) throw parseError(raw, `duplicate modifier "${name}"`)
    flags[name as Modifier] = true
  }

  if (flags.shift && isShiftAgnostic(key)) {
    devWarn(
      `"${combo}" — bind the produced character instead of shift + base key ` +
        `(e.g. '?' rather than 'shift+/'); shifted printables match as typed.`,
    )
  }

  const parts: string[] = []
  for (const m of MODIFIER_ORDER) if (flags[m]) parts.push(m)
  parts.push(key)

  return { ...flags, key, canonical: parts.join('+') }
}

/** Parse a comma-separated combo list; throws on any malformed alternative. */
function parseKeys(keys: string): ParsedCombo[] {
  if (typeof keys !== 'string' || keys.trim() === '') {
    throw parseError(String(keys), 'expected a non-empty combo string')
  }
  return keys.split(',').map((part) => parseCombo(part))
}

function toCanonical(combos: ParsedCombo[]): string {
  return combos.map((c) => c.canonical).join(', ')
}

// Combos the browser/OS or screen-reader browse mode already owns.
const RESERVED_COMBOS = new Set(['ctrl+t', 'ctrl+w', 'ctrl+n', 'mod+t', 'mod+w', 'mod+n'])
// NVDA/JAWS browse-mode quick keys — bare bindings never reach the page for SR users.
const SR_QUICK_KEYS = new Set(['h', 'k', 't', '1', '2', '3', '4', '5', '6'])

function warnReservedCombos(id: string, combos: ParsedCombo[]): void {
  for (const combo of combos) {
    if (RESERVED_COMBOS.has(combo.canonical)) {
      devWarn(`"${id}" binds "${combo.canonical}" — the browser reserves it (tab/window control).`)
    } else if (isCharacterCombo(combo) && !combo.shift && SR_QUICK_KEYS.has(combo.key)) {
      devWarn(
        `"${id}" binds bare "${combo.key}" — screen-reader browse mode swallows it ` +
          `(NVDA/JAWS quick key); prefer a mod+ combo for anything important.`,
      )
    }
  }
}

// Pure modifier keydowns are a chord in progress, never a complete combo.
const CHORD_KEYS = new Set(['control', 'shift', 'alt', 'meta'])

/**
 * Canonical combo string for a captured keydown — feeds the editable
 * ShortcutsHelp recorder. Modifier-only presses return `null` (the user is
 * mid-chord; keep waiting). Shifted printables keep the produced character
 * (`?`, never `shift+/`), matching the matcher's shift rule. The result may
 * still fail `parseKeys` (e.g. the space key) — recorders validate via
 * `remap`. File-level export — not part of the public barrel surface.
 */
export function comboFromEvent(event: KeyboardEvent): string | null {
  const key = (event.key ?? '').toLowerCase()
  if (key === '' || CHORD_KEYS.has(key)) return null
  const parts: string[] = []
  if (event.ctrlKey) parts.push('ctrl')
  if (event.altKey) parts.push('alt')
  if (event.shiftKey && !isShiftAgnostic(key)) parts.push('shift')
  if (event.metaKey) parts.push('meta')
  parts.push(key)
  return parts.join('+')
}

/**
 * Whether any alternative in `keys` is a combo the browser/OS reserves for
 * tab/window control. Registration merely dev-warns (`warnReservedCombos`);
 * the ShortcutsHelp recorder rejects these outright. Accepts the literal
 * `ctrl+`/`meta+` forms a recorded event produces as well as `mod+`
 * spellings. Throws on malformed input (same grammar as registration).
 * File-level export — not part of the public barrel surface.
 */
export function isReservedCombo(keys: string): boolean {
  return parseKeys(keys).some(
    (c) =>
      RESERVED_COMBOS.has(c.canonical) ||
      RESERVED_COMBOS.has(c.canonical.replace(/^(?:ctrl|meta)\+/, 'mod+')),
  )
}

// ---------------------------------------------------------------------------
// Environment probes (never at module scope — SSR-safe)
// ---------------------------------------------------------------------------

function hasWindow(): boolean {
  return typeof window !== 'undefined'
}

/** Platform sniff for `mod` resolution and default formatting. */
function isMacLike(): boolean {
  if (typeof navigator === 'undefined') return false
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } }
  const platform = nav.userAgentData?.platform ?? nav.platform ?? ''
  if (/mac|iphone|ipad|ipod/i.test(platform)) return true
  return /mac os x|macintosh|iphone|ipad/i.test(nav.userAgent ?? '')
}

/**
 * Detected modifier-rendering platform. File-level export for `<Kbd>`'s
 * client-side correction effect — not part of the public barrel surface.
 */
export function detectPlatform(): ShortcutPlatform {
  return isMacLike() ? 'apple' : 'other'
}

/**
 * Open modal `<dialog>`s. Where `:modal` is verifiably supported we trust it;
 * otherwise (jsdom's partial dialog support) any open dialog counts as modal.
 */
function openModalDialogs(): HTMLDialogElement[] {
  if (typeof document === 'undefined') return []
  const open = Array.from(document.querySelectorAll<HTMLDialogElement>('dialog[open]'))
  if (open.length === 0) return []
  let modalSelectorSupported: boolean
  try {
    modalSelectorSupported =
      typeof CSS !== 'undefined' &&
      typeof CSS.supports === 'function' &&
      CSS.supports('selector(:modal)')
  } catch {
    modalSelectorSupported = false
  }
  if (!modalSelectorSupported) return open
  return open.filter((dialog) => dialog.matches(':modal'))
}

/** Typing surface? `<input>`/`<textarea>`/`<select>` or contenteditable (incl. ancestors). */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  const editable = target.closest('[contenteditable]')
  return editable !== null && editable.getAttribute('contenteditable') !== 'false'
}

function comboMatchesEvent(combo: ParsedCombo, event: KeyboardEvent, mac: boolean): boolean {
  if ((event.key ?? '').toLowerCase() !== combo.key) return false
  const wantCtrl = combo.ctrl || (combo.mod && !mac)
  const wantMeta = combo.meta || (combo.mod && mac)
  if (event.ctrlKey !== wantCtrl) return false
  if (event.metaKey !== wantMeta) return false
  if (event.altKey !== combo.alt) return false
  // Shifted printables ('?') encode shift in the key itself — ignore shiftKey.
  if (!isShiftAgnostic(combo.key) && event.shiftKey !== combo.shift) return false
  return true
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

interface Registration {
  seq: number
  id: string
  label: string
  group?: string
  scope: ShortcutScope
  defaultKeys: string
  combos: ParsedCombo[]
  enabledOpt: boolean | (() => boolean)
  allowInInputs: boolean
  allowRepeat: boolean
  preventDefault: boolean
  onPress: (event: KeyboardEvent) => void
  element?: Element
}

const noop = (): void => {}

/**
 * Module-singleton keyboard-shortcut registry (Svelte 5 runes; house pattern
 * of `toast.svelte.ts`). One lazy `window` keydown listener (bubble phase)
 * serves every registration: attached on the first browser-side `add()`,
 * detached when the registry empties. Exactly one shortcut fires per event —
 * focus-scoped beats global, last-registered wins within a tier.
 *
 * The class is intentionally NOT exported: a second instance would break the
 * "exactly one fires" guarantee. Use the `shortcuts` singleton.
 */
class ShortcutRegistry {
  /** Global kill switch (WCAG 2.1.4 "turn off"). */
  enabled = $state(true)
  /**
   * When `false`, modifier-less ("character key") bindings never fire — the
   * GitHub-style WCAG 2.1.4 switch. `mod+`/`ctrl+`/`alt+` combos are unaffected.
   */
  characterKeys = $state(true)

  #registrations = $state<Registration[]>([])
  #overrides = $state<Record<string, ShortcutOverride>>({})
  /** Parsed forms of remapped combos, keyed by shortcut id (kept off $state). */
  #overrideCombos = new Map<string, ParsedCombo[]>()
  #seq = 0
  #listening = false

  /** Reactive read-only list of registered shortcuts, registration order. */
  readonly items: readonly ShortcutInfo[] = $derived.by(() =>
    this.#registrations.map((r) => ({
      id: r.id,
      label: r.label,
      group: r.group,
      scope: r.scope,
      keys: this.#overrides[r.id]?.keys ?? r.defaultKeys,
      defaultKeys: r.defaultKeys,
      enabled: this.#effectiveEnabled(r),
    })),
  )

  /**
   * Register a shortcut; returns an idempotent disposer. Throws on a
   * malformed `keys` string. On the server (no `window`) this is a full
   * no-op that returns a working noop disposer.
   *
   * The optional `element` is supplied by the `shortcut()` attachment and
   * anchors `scope: 'focus'` registrations.
   */
  add(options: ShortcutOptions, element?: Element): () => void {
    const combos = parseKeys(options.keys) // validate even on the server — fail loudly everywhere
    if (!hasWindow()) return noop
    // untrack: add() runs inside the shortcut() attachment's effect — reading
    // the registration list here must not make that effect re-run on every
    // registry change (it would tear itself down mid-flush).
    return untrack(() => this.#register(options, combos, element))
  }

  #register(options: ShortcutOptions, combos: ParsedCombo[], element?: Element): () => void {
    if (this.#registrations.some((r) => r.id === options.id)) {
      devWarn(`duplicate id "${options.id}" — the last registration wins when combos collide.`)
    }
    warnReservedCombos(options.id, combos)

    const scope = options.scope ?? 'global'
    if (scope === 'focus' && !element) {
      devWarn(
        `"${options.id}" has scope 'focus' but no element — register it through the ` +
          `shortcut() attachment; it will never fire.`,
      )
    }

    const reg: Registration = {
      seq: ++this.#seq,
      id: options.id,
      label: options.label,
      group: options.group,
      scope,
      defaultKeys: toCanonical(combos),
      combos,
      enabledOpt: options.enabled ?? true,
      allowInInputs: options.allowInInputs ?? false,
      allowRepeat: options.allowRepeat ?? false,
      preventDefault: options.preventDefault ?? true,
      onPress: options.onPress,
      element,
    }
    this.#registrations.push(reg)
    this.#attachListener()

    let disposed = false
    return () => {
      if (disposed) return
      disposed = true
      untrack(() => {
        const i = this.#registrations.findIndex((r) => r.seq === reg.seq)
        if (i !== -1) this.#registrations.splice(i, 1)
        this.#detachListenerIfEmpty()
      })
    }
  }

  /** User-level enable/disable override for one shortcut (persists in overrides). */
  setEnabled(id: string, enabled: boolean): void {
    this.#overrides[id] = { ...this.#overrides[id], enabled }
  }

  /**
   * Rebind a shortcut to new keys (parsed/validated immediately — throws on
   * malformed input). `remap(id, null)` removes the override, restoring the
   * registered default.
   */
  remap(id: string, keys: string | null): void {
    if (keys === null) {
      const existing = this.#overrides[id]
      if (existing) {
        delete existing.keys
        if (existing.enabled === undefined) delete this.#overrides[id]
      }
      this.#overrideCombos.delete(id)
      return
    }
    const combos = parseKeys(keys)
    warnReservedCombos(id, combos)
    this.#overrides[id] = { ...this.#overrides[id], keys: toCanonical(combos) }
    this.#overrideCombos.set(id, combos)
  }

  /** Serializable snapshot of the global toggles + every per-id override. */
  getOverrides(): ShortcutOverrides {
    return {
      enabled: this.enabled,
      characterKeys: this.characterKeys,
      shortcuts: $state.snapshot(this.#overrides),
    }
  }

  /**
   * Merge a persisted overrides snapshot back in. Overrides for ids that are
   * not (yet) registered are kept and take effect when the shortcut mounts.
   * Malformed persisted combos are skipped with a dev warning (stale storage
   * must not crash the app).
   */
  applyOverrides(overrides: ShortcutOverrides): void {
    if (typeof overrides.enabled === 'boolean') this.enabled = overrides.enabled
    if (typeof overrides.characterKeys === 'boolean') this.characterKeys = overrides.characterKeys
    if (!overrides.shortcuts) return
    for (const [id, override] of Object.entries(overrides.shortcuts)) {
      if (typeof override.enabled === 'boolean') this.setEnabled(id, override.enabled)
      if (typeof override.keys === 'string') {
        try {
          this.remap(id, override.keys)
        } catch {
          devWarn(`ignoring invalid persisted combo "${override.keys}" for "${id}".`)
        }
      }
    }
  }

  /** Clear every per-id override and restore the global toggles to defaults. */
  resetOverrides(): void {
    this.enabled = true
    this.characterKeys = true
    this.#overrides = {}
    this.#overrideCombos.clear()
  }

  #effectiveEnabled(r: Registration): boolean {
    const userEnabled = this.#overrides[r.id]?.enabled ?? true
    if (!userEnabled) return false
    return typeof r.enabledOpt === 'function' ? r.enabledOpt() : r.enabledOpt
  }

  #attachListener(): void {
    if (this.#listening || !hasWindow()) return
    window.addEventListener('keydown', this.#onKeydown)
    this.#listening = true
  }

  #detachListenerIfEmpty(): void {
    if (!this.#listening || this.#registrations.length > 0 || !hasWindow()) return
    window.removeEventListener('keydown', this.#onKeydown)
    this.#listening = false
  }

  #onKeydown = (event: KeyboardEvent): void => {
    if (!this.enabled) return
    if (event.defaultPrevented) return // a component that handled the key wins over globals
    if (event.isComposing) return // IME composition
    const mac = isMacLike()
    const modals = openModalDialogs()
    // Focus-scoped tier beats global; within a tier, last-registered wins.
    const match =
      this.#findMatch(event, mac, modals, 'focus') ?? this.#findMatch(event, mac, modals, 'global')
    if (!match) return
    if (match.preventDefault) event.preventDefault()
    match.onPress(event)
  }

  #findMatch(
    event: KeyboardEvent,
    mac: boolean,
    modals: HTMLDialogElement[],
    scope: ShortcutScope,
  ): Registration | null {
    const regs = this.#registrations
    for (let i = regs.length - 1; i >= 0; i--) {
      const r = regs[i]
      if (r.scope !== scope) continue
      const combos = this.#overrideCombos.get(r.id) ?? r.combos
      const combo = combos.find((c) => comboMatchesEvent(c, event, mac))
      if (!combo) continue
      if (event.repeat && !r.allowRepeat) continue
      if (!this.characterKeys && isCharacterCombo(combo)) continue
      if (!r.allowInInputs && isEditableTarget(event.target)) continue
      if (!this.#effectiveEnabled(r)) continue
      if (scope === 'focus') {
        if (!r.element) continue
        if (!(event.target instanceof Node) || !r.element.contains(event.target)) continue
      }
      // SC 2.1.2: an open modal dialog makes the rest of the page inert for
      // focus but NOT for window key handlers — suppress everything except
      // focus-scoped shortcuts anchored inside the dialog.
      if (modals.length > 0) {
        const insideModal =
          scope === 'focus' && r.element != null && modals.some((m) => m.contains(r.element!))
        if (!insideModal) continue
      }
      return r
    }
    return null
  }
}

/** The one app-wide shortcut registry. */
export const shortcuts = new ShortcutRegistry()

/**
 * `{@attach}` sugar over `shortcuts.add()`: registers on mount, cleans up on
 * unmount, and re-registers reactively when a thunk's dependencies change.
 * The attached element anchors `scope: 'focus'` shortcuts (they only fire
 * while the event target is inside it).
 *
 * ```svelte
 * <section {@attach shortcut(() => ({ id: 'app:save', label: 'Save', keys: 'mod+s', onPress: save }))}>
 * ```
 */
export function shortcut(options: ShortcutOptions | (() => ShortcutOptions)): Attachment {
  return (element) => {
    // Resolving the thunk here (inside the attachment's effect) makes the
    // registration re-run when any reactive state it reads changes.
    const resolved = typeof options === 'function' ? options() : options
    return shortcuts.add(resolved, element)
  }
}

// ---------------------------------------------------------------------------
// Pure formatters (no registry coupling)
// ---------------------------------------------------------------------------

const APPLE_GLYPHS: Record<Modifier, string> = {
  mod: '⌘',
  meta: '⌘',
  ctrl: '⌃',
  alt: '⌥',
  shift: '⇧',
}
const OTHER_GLYPHS: Record<Modifier, string> = {
  mod: 'Ctrl',
  ctrl: 'Ctrl',
  meta: 'Meta',
  alt: 'Alt',
  shift: 'Shift',
}
const APPLE_LABELS: Record<Modifier, string> = {
  mod: 'Command',
  meta: 'Command',
  ctrl: 'Control',
  alt: 'Option',
  shift: 'Shift',
}
const OTHER_LABELS: Record<Modifier, string> = OTHER_GLYPHS

const KEY_GLYPHS: Record<string, string> = {
  arrowup: '↑',
  arrowdown: '↓',
  arrowleft: '←',
  arrowright: '→',
  enter: '↵',
  escape: 'Esc',
  backspace: '⌫',
  delete: 'Del',
  tab: '⇥',
  ' ': 'Space',
  pageup: 'PgUp',
  pagedown: 'PgDn',
}
const KEY_LABELS: Record<string, string> = {
  arrowup: 'Up Arrow',
  arrowdown: 'Down Arrow',
  arrowleft: 'Left Arrow',
  arrowright: 'Right Arrow',
  enter: 'Enter',
  escape: 'Escape',
  backspace: 'Backspace',
  delete: 'Delete',
  tab: 'Tab',
  ' ': 'Space',
  pageup: 'Page Up',
  pagedown: 'Page Down',
}

function displayKey(key: string, format: ShortcutFormat): string {
  const table = format === 'glyph' ? KEY_GLYPHS : KEY_LABELS
  const mapped = table[key]
  if (mapped) return mapped
  if (key.length === 1) return key.toUpperCase()
  return key.charAt(0).toUpperCase() + key.slice(1) // 'f1' → 'F1', 'home' → 'Home'
}

/**
 * Structured form behind `formatShortcut`: one keycap-string array per
 * comma-alternative (`'?, mod+/'` on other → `[['?'], ['Ctrl', '/']]`).
 * File-level export so `<Kbd>` can render one `<kbd>` per key without
 * re-deriving the glyph/label tables — not part of the public barrel surface.
 * Throws on malformed input (same grammar as registration).
 */
export function formatShortcutParts(keys: string, options: FormatShortcutOptions = {}): string[][] {
  const format = options.format ?? 'glyph'
  const platform = options.platform ?? detectPlatform()
  const mods =
    format === 'glyph'
      ? platform === 'apple'
        ? APPLE_GLYPHS
        : OTHER_GLYPHS
      : platform === 'apple'
        ? APPLE_LABELS
        : OTHER_LABELS
  return parseKeys(keys).map((combo) => {
    const parts: string[] = []
    for (const m of MODIFIER_ORDER) if (combo[m]) parts.push(mods[m])
    parts.push(displayKey(combo.key, format))
    return parts
  })
}

/**
 * Human-readable rendering of a combo string, for `<Kbd>`-style display.
 * Alternatives are joined with ` / `. Apple glyphs concatenate (`⌘K`, the
 * macOS convention); everything else joins with `+` (`Ctrl+K`). Throws on
 * malformed input (same grammar as registration).
 */
export function formatShortcut(keys: string, options: FormatShortcutOptions = {}): string {
  const format = options.format ?? 'glyph'
  const platform = options.platform ?? detectPlatform()
  return formatShortcutParts(keys, options)
    .map((parts) => (format === 'glyph' && platform === 'apple' ? parts.join('') : parts.join('+')))
    .join(' / ')
}

// UI Events canonical casing for `aria-keyshortcuts` values.
const ARIA_KEYS: Record<string, string> = {
  escape: 'Escape',
  enter: 'Enter',
  tab: 'Tab',
  backspace: 'Backspace',
  delete: 'Delete',
  arrowup: 'ArrowUp',
  arrowdown: 'ArrowDown',
  arrowleft: 'ArrowLeft',
  arrowright: 'ArrowRight',
  home: 'Home',
  end: 'End',
  pageup: 'PageUp',
  pagedown: 'PageDown',
  ' ': 'Space',
  '+': 'Plus',
}

/**
 * The combo in `aria-keyshortcuts` spec syntax (`Meta+K`), with `mod`
 * resolved for the given (default: detected) platform. Alternatives are
 * space-separated per the spec. Throws on malformed input.
 */
export function ariaKeyshortcuts(keys: string, platform?: ShortcutPlatform): string {
  const plat = platform ?? detectPlatform()
  return parseKeys(keys)
    .map((combo) => {
      const parts: string[] = []
      if (combo.ctrl || (combo.mod && plat === 'other')) parts.push('Control')
      if (combo.alt) parts.push('Alt')
      if (combo.shift) parts.push('Shift')
      if (combo.meta || (combo.mod && plat === 'apple')) parts.push('Meta')
      const mapped = ARIA_KEYS[combo.key]
      parts.push(
        mapped ??
          (combo.key.length === 1
            ? combo.key.toUpperCase()
            : combo.key.charAt(0).toUpperCase() + combo.key.slice(1)),
      )
      return parts.join('+')
    })
    .join(' ')
}
