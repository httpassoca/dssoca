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

/** Default auto-dismiss per kind. Errors linger; loading is sticky. */
const DEFAULT_TIMEOUT: Record<ToastKind, number> = {
  success: 4000,
  info: 4000,
  error: 7000,
  loading: 0, // sticky until updated/dismissed
}

/** Toasts carrying an action default to sticky so the action stays reachable. */
const ACTION_TIMEOUT = 0

/** Treat <= 0 or non-finite as sticky (never auto-dismiss). */
function isSticky(timeout: number): boolean {
  return !(timeout > 0) || !Number.isFinite(timeout)
}

const hasWindow = typeof window !== 'undefined'

/**
 * Per-toast auto-dismiss controller. Tracks remaining time so the timer can be
 * paused (on hover/focus) and resumed without losing or resetting the budget.
 */
class ToastTimer {
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

/**
 * Module-singleton toast store (Svelte 5 runes). One instance is shared by
 * every consumer of the package, so `toast.success(...)` from anywhere shows
 * in the single <Toaster /> mounted at the app root.
 *
 * Visible toasts are capped at `max`; overflow waits in a private queue and is
 * promoted (FIFO) whenever a visible slot frees up on dismiss.
 */
class ToastStore {
  /** The currently VISIBLE toasts (capped at `max`). */
  items = $state<Toast[]>([])
  /** Visible-stack cap; extra pushes queue until a slot frees. */
  max = $state(3)

  #seq = 0
  #queue: Toast[] = []
  #timers = new Map<number, ToastTimer>()

  #resolveTimeout(kind: ToastKind, opts?: ToastOptions): number {
    if (opts?.timeout !== undefined) return opts.timeout
    if (opts?.action) return ACTION_TIMEOUT
    return DEFAULT_TIMEOUT[kind]
  }

  push(kind: ToastKind, message: string, opts?: ToastOptions | number): number {
    // Back-compat: the old signature accepted a bare `timeout` number.
    const o: ToastOptions | undefined = typeof opts === 'number' ? { timeout: opts } : opts
    const id = ++this.#seq
    const toast: Toast = {
      id,
      kind,
      message,
      timeout: this.#resolveTimeout(kind, o),
      action: o?.action,
    }
    if (this.items.length < this.max) {
      this.#show(toast)
    } else {
      this.#queue.push(toast)
    }
    return id
  }

  #show(toast: Toast): void {
    this.items.push(toast)
    this.#arm(toast)
  }

  #arm(toast: Toast): void {
    this.#timers.get(toast.id)?.cancel()
    if (isSticky(toast.timeout)) {
      this.#timers.delete(toast.id)
      return
    }
    this.#timers.set(toast.id, new ToastTimer(toast.timeout, () => this.dismiss(toast.id)))
  }

  /** Patch a live (or queued) toast in place; re-arms its timer. Returns success. */
  update(id: number, patch: ToastPatch): boolean {
    const live = this.items.find((t) => t.id === id)
    const target = live ?? this.#queue.find((t) => t.id === id)
    if (!target) return false
    if (patch.kind !== undefined) target.kind = patch.kind
    if (patch.message !== undefined) target.message = patch.message
    if ('action' in patch) target.action = patch.action
    if (patch.timeout !== undefined) target.timeout = patch.timeout
    else if (patch.kind !== undefined) target.timeout = DEFAULT_TIMEOUT[patch.kind]
    if (live) this.#arm(live)
    return true
  }

  /** Pause a visible toast's auto-dismiss timer (hover/focus). */
  pause(id: number): void {
    this.#timers.get(id)?.pause()
  }

  /** Resume a paused timer (pointer/focus leave). */
  resume(id: number): void {
    this.#timers.get(id)?.resume()
  }

  dismiss(id: number): void {
    this.#timers.get(id)?.cancel()
    this.#timers.delete(id)
    const i = this.items.findIndex((t) => t.id === id)
    if (i !== -1) {
      this.items.splice(i, 1)
      this.#promote()
      return
    }
    // Might still be waiting in the queue.
    const qi = this.#queue.findIndex((t) => t.id === id)
    if (qi !== -1) this.#queue.splice(qi, 1)
  }

  /** Promote the next queued toast into a freed visible slot. */
  #promote(): void {
    while (this.items.length < this.max && this.#queue.length > 0) {
      this.#show(this.#queue.shift()!)
    }
  }

  clear(): void {
    for (const t of this.#timers.values()) t.cancel()
    this.#timers.clear()
    this.#queue = []
    this.items = []
  }
}

export const toasts = new ToastStore()

/** Options for `toast.promise`. */
export interface PromiseMessages<T> {
  loading: string
  success: string | ((value: T) => string)
  error: string | ((err: unknown) => string)
}

export const toast = {
  success: (message: string, opts?: ToastOptions | number) => toasts.push('success', message, opts),
  error: (message: string, opts?: ToastOptions | number) => toasts.push('error', message, opts),
  info: (message: string, opts?: ToastOptions | number) => toasts.push('info', message, opts),
  loading: (message: string, opts?: ToastOptions | number) => toasts.push('loading', message, opts),

  /**
   * Push a sticky `loading` toast, then update it to success/error when the
   * promise settles. Returns the same promise so callers can keep chaining.
   */
  promise<T>(p: Promise<T>, messages: PromiseMessages<T>): Promise<T> {
    const id = toasts.push('loading', messages.loading, { timeout: 0 })
    p.then(
      (value) => {
        const msg =
          typeof messages.success === 'function' ? messages.success(value) : messages.success
        toasts.update(id, { kind: 'success', message: msg })
      },
      (err) => {
        const msg = typeof messages.error === 'function' ? messages.error(err) : messages.error
        toasts.update(id, { kind: 'error', message: msg })
      },
    )
    return p
  },
}
