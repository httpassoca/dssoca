import {
  type Toast,
  type ToastKind,
  type ToastOptions,
  type ToastPatch,
  type PromiseMessages,
  DEFAULT_TIMEOUT,
  isSticky,
  resolveTimeout,
  normalizeOptions,
  ToastTimer,
} from './toast-core.js'

// Types + timer live in `toast-core.ts` (framework-free, shared with the vanilla port —
// DS-0148); re-exported here so the public `dssoca` surface is unchanged.
export type {
  Toast,
  ToastKind,
  ToastAction,
  ToastOptions,
  ToastPatch,
  PromiseMessages,
} from './toast-core.js'

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

  push(kind: ToastKind, message: string, opts?: ToastOptions | number): number {
    const o = normalizeOptions(opts)
    const id = ++this.#seq
    const toast: Toast = {
      id,
      kind,
      message,
      timeout: resolveTimeout(kind, o),
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
