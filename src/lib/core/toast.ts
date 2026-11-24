/**
 * Framework-free core of the toast system (DS-0148): types, per-kind defaults and the
 * pause/resume timer. Shared by the Svelte-runes store (`toast.svelte.ts`) and the vanilla
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
