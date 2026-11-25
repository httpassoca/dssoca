/**
 * Framework-free core of the toast system (DS-0148): types, per-kind defaults, the
 * pause/resume timer and the decisions (dismiss key, hold, swipe, focus handover; DS-0197). Shared by the Svelte-runes store (`toast.svelte.ts`) and the vanilla
 * DOM store (`vanilla/toast.ts`) so the two can never disagree on semantics.
 */

export type ToastKind = 'success' | 'error' | 'info' | 'loading'

/** An optional inline action rendered as a button inside the toast. */
export interface ToastAction {
  label: string
  /**
   * Invoked on click. Return `false` to keep the toast open (e.g. an async
   * action that wants to swap itself for a result toast); any other return
   * value dismisses the toast.
   */
  onClick: () => void | false
}

export interface Toast {
  id: number
  kind: ToastKind
  message: string
  /** Effective auto-dismiss duration in ms; <= 0 / Infinity means sticky. */
  timeout: number
  action?: ToastAction
}

/** Fields a caller may set when pushing; the store fills in the rest. */
export interface ToastOptions {
  timeout?: number
  action?: ToastAction
}

/** A subset of a toast a caller may patch in-place via `update`. */
export type ToastPatch = Partial<Pick<Toast, 'kind' | 'message' | 'timeout' | 'action'>>

/** Options for `toast.promise`. */
export interface PromiseMessages<T> {
  loading: string
  success: string | ((value: T) => string)
  error: string | ((err: unknown) => string)
}

/** Default auto-dismiss per kind. Errors linger; loading is sticky. */
export const DEFAULT_TIMEOUT: Record<ToastKind, number> = {
  success: 4000,
  info: 4000,
  error: 7000,
  loading: 0, // sticky until updated/dismissed
}

/** Toasts carrying an action default to sticky so the action stays reachable. */
export const ACTION_TIMEOUT = 0

/** Treat <= 0 or non-finite as sticky (never auto-dismiss). */
export function isSticky(timeout: number): boolean {
  return !(timeout > 0) || !Number.isFinite(timeout)
}

/** Effective timeout for a push: explicit > action-sticky > per-kind default. */
export function resolveTimeout(kind: ToastKind, opts?: ToastOptions): number {
  if (opts?.timeout !== undefined) return opts.timeout
  if (opts?.action) return ACTION_TIMEOUT
  return DEFAULT_TIMEOUT[kind]
}

/** Back-compat: the old push signature accepted a bare `timeout` number. */
export function normalizeOptions(opts?: ToastOptions | number): ToastOptions | undefined {
  return typeof opts === 'number' ? { timeout: opts } : opts
}

// --- decisions ------------------------------------------------------------------------------
// What a key, a press or a pointer does to one toast. Toaster.svelte and `vanilla/toast.ts`
// read the state (hover, focus, drag) from their side and apply the answer.

/** What a key on a toast does. */
export type ToastKeyAction = { type: 'dismiss' }

/** A key the toast handles, and whether it must stop there instead of reaching the page. */
export interface ToastKeyResult {
  action: ToastKeyAction
  stopPropagation: boolean
}

/**
 * A key on a toast (or on a control inside it). Escape dismisses it and is kept from the
 * surfaces behind (an open dialog must not close on the same press). `null` = let it through.
 */
export function toastKey(key: string): ToastKeyResult | null {
  return key === 'Escape' ? { action: { type: 'dismiss' }, stopPropagation: true } : null
}

/** What currently holds a toast open. */
export interface ToastHoldState {
  /** The pointer is over the toast. */
  hovered: boolean
  /** Focus is on the toast or inside it. */
  focused: boolean
  /** The toast is being swiped. */
  dragging?: boolean
}

/**
 * Whether the auto-dismiss timer may run again. Hover, keyboard focus and a swipe each hold
 * it: a pointer leaving must not restart the clock under a keyboard user, and vice versa.
 */
export function toastShouldResume(state: ToastHoldState): boolean {
  return !state.hovered && !state.focused && !state.dragging
}

/** Whether the toast goes away after its action ran: yes, unless the handler returned `false`. */
export function toastActionDismisses(result: void | false): boolean {
  return result !== false
}

/**
 * Where focus goes when the toast holding it is dismissed, so it never falls to `<body>`: the
 * next toast in the stack, else the nearest one before it. `order` is the stack as it was with
 * the dismissed toast still in it; `canTake` filters out toasts that cannot receive focus
 * (already gone, not rendered). `null` = no toast left, hand focus back to where it came from.
 */
export function toastFocusAfterDismiss(
  order: readonly number[],
  id: number,
  canTake: (id: number) => boolean = () => true,
): number | null {
  const i = order.indexOf(id)
  if (i === -1) return null
  for (let n = i + 1; n < order.length; n++) if (canTake(order[n])) return order[n]
  for (let n = i - 1; n >= 0; n--) if (canTake(order[n])) return order[n]
  return null
}

/** Horizontal travel, in px, past which releasing a swiped toast dismisses it. */
export const SWIPE_THRESHOLD = 64

export interface ToastPressState {
  /** `PointerEvent.button`; only the primary button swipes. */
  button: number
  /** The press landed on a button inside the toast (buttons own their clicks). */
  onControl: boolean
  /** The user prefers reduced motion: no swipe, the buttons are the way to dismiss. */
  reducedMotion: boolean
}

/** Whether a press on a toast starts a swipe. */
export function toastPressStartsSwipe(state: ToastPressState): boolean {
  return !state.reducedMotion && state.button === 0 && !state.onControl
}

/** Whether a swipe released after travelling `dx` px dismisses the toast (either direction). */
export function toastSwipeDismisses(dx: number): boolean {
  return Math.abs(dx) >= SWIPE_THRESHOLD
}

const hasWindow = typeof window !== 'undefined'

/**
 * Per-toast auto-dismiss controller. Tracks remaining time so the timer can be
 * paused (on hover/focus) and resumed without losing or resetting the budget.
 */
export class ToastTimer {
  #fire: () => void
  #remaining: number
  #startedAt = 0
  #handle: ReturnType<typeof setTimeout> | null = null

  constructor(timeout: number, fire: () => void) {
    this.#fire = fire
    this.#remaining = timeout
    this.resume()
  }

  get sticky(): boolean {
    return isSticky(this.#remaining)
  }

  resume(): void {
    if (this.#handle !== null || this.sticky || !hasWindow) return
    this.#startedAt = Date.now()
    this.#handle = setTimeout(this.#fire, this.#remaining)
  }

  pause(): void {
    if (this.#handle === null) return
    clearTimeout(this.#handle)
    this.#handle = null
    this.#remaining -= Date.now() - this.#startedAt
  }

  /** Re-arm with a fresh budget (used by `update`). */
  reset(timeout: number): void {
    this.cancel()
    this.#remaining = timeout
    this.resume()
  }

  cancel(): void {
    if (this.#handle !== null) clearTimeout(this.#handle)
    this.#handle = null
  }
}
