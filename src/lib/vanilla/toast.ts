/**
 * Toasts (DS-0148) — framework-free port of `toast.svelte.ts` + Toaster.svelte that renders
 * the exact Toaster DOM directly. Same API names as the Svelte one:
 *
 *   toast.success('saved')            toast.error('nope', { action: { label, onClick } })
 *   toast.loading('…')                toast.promise(p, { loading, success, error })
 *   toasts.dismiss(id) / clear() / update(id, patch) / max
 *
 * The stack lives in the first `.ss-toaster` on the page (author it to choose `data-position`
 * / size) or in one auto-created under `<body>`. Hover/focus pause the timer, Escape and the
 * × button dismiss, exit runs the `.leaving` CSS animation from vanilla.css. Swipe-to-dismiss
 * is not ported.
 */
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
} from '../toast-core.js'

export type {
  Toast,
  ToastKind,
  ToastOptions,
  ToastPatch,
  ToastAction,
  PromiseMessages,
} from '../toast-core.js'

const GLYPH: Record<ToastKind, string> = { success: '✓', error: '✕', info: 'i', loading: '' }
const LEAVE_FALLBACK_MS = 400

interface Live {
  toast: Toast
  el: HTMLElement
  timer: ToastTimer | null
}

const reduceMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

class VanillaToastStore {
  max = 3
  #seq = 0
  #live: Live[] = []
  #queue: Toast[] = []
  #container: HTMLElement | null = null

  /** Visible toasts (read-only snapshot). */
  get items(): Toast[] {
    return this.#live.map((l) => l.toast)
  }

  get container(): HTMLElement {
    if (this.#container?.isConnected) return this.#container
    let el = document.querySelector<HTMLElement>('.ss-toaster')
    if (!el) {
      el = document.createElement('div')
      el.className = 'ss-toaster'
      el.setAttribute('aria-label', 'Notifications')
      el.dataset.position = 'top-right'
      document.body.appendChild(el)
    }
    this.#container = el
    return el
  }

  push(kind: ToastKind, message: string, opts?: ToastOptions | number): number {
    const o = normalizeOptions(opts)
    const id = ++this.#seq
    const t: Toast = { id, kind, message, timeout: resolveTimeout(kind, o), action: o?.action }
    if (this.#live.length < this.max) this.#show(t)
    else this.#queue.push(t)
    return id
  }

  #show(t: Toast): void {
    const el = document.createElement('div')
    el.tabIndex = -1
    this.#render(el, t)
    el.addEventListener('pointerenter', () => this.pause(t.id))
    el.addEventListener('pointerleave', () => this.resume(t.id))
    el.addEventListener('focusin', () => this.pause(t.id))
    el.addEventListener('focusout', () => this.resume(t.id))
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        this.dismiss(t.id)
      }
    })
    el.addEventListener('click', (e) => {
      const btn = (e.target as Element).closest('button')
      if (!btn) return
      if (btn.classList.contains('x')) this.dismiss(t.id)
      else if (btn.classList.contains('action')) {
        const keep = this.#find(t.id)?.toast.action?.onClick() === false
        if (!keep) this.dismiss(t.id)
      }
    })
    this.container.appendChild(el)
    const live: Live = { toast: t, el, timer: null }
    this.#live.push(live)
    this.#arm(live)
  }

  #render(el: HTMLElement, t: Toast): void {
    el.className = `ss-toast ${t.kind}`
    el.setAttribute('role', t.kind === 'error' ? 'alert' : 'status')
    el.setAttribute('aria-live', t.kind === 'error' ? 'assertive' : 'polite')
    const ic =
      t.kind === 'loading'
        ? `<span class="ic spinner${reduceMotion() ? ' still' : ''}" aria-hidden="true"></span>`
        : `<span class="ic" aria-hidden="true">${GLYPH[t.kind]}</span>`
    const action = t.action
      ? `<button class="action" type="button">${escapeHtml(t.action.label)}</button>`
      : ''
    el.innerHTML =
      `${ic}<span class="msg">${escapeHtml(t.message)}</span>${action}` +
      `<button class="x" type="button" aria-label="Dismiss">×</button>`
  }

  #find(id: number): Live | undefined {
    return this.#live.find((l) => l.toast.id === id)
  }

  #arm(live: Live): void {
    live.timer?.cancel()
    live.timer = isSticky(live.toast.timeout)
      ? null
      : new ToastTimer(live.toast.timeout, () => this.dismiss(live.toast.id))
  }

  update(id: number, patch: ToastPatch): boolean {
    const live = this.#find(id)
    const target = live?.toast ?? this.#queue.find((t) => t.id === id)
    if (!target) return false
    if (patch.kind !== undefined) target.kind = patch.kind
    if (patch.message !== undefined) target.message = patch.message
    if ('action' in patch) target.action = patch.action
    if (patch.timeout !== undefined) target.timeout = patch.timeout
    else if (patch.kind !== undefined) target.timeout = DEFAULT_TIMEOUT[patch.kind]
    if (live) {
      this.#render(live.el, live.toast)
      this.#arm(live)
    }
    return true
  }

  pause(id: number): void {
    this.#find(id)?.timer?.pause()
  }

  resume(id: number): void {
    this.#find(id)?.timer?.resume()
  }

  dismiss(id: number): void {
    const i = this.#live.findIndex((l) => l.toast.id === id)
    if (i !== -1) {
      const [live] = this.#live.splice(i, 1)
      live.timer?.cancel()
      this.#leave(live.el)
      this.#promote()
      return
    }
    const qi = this.#queue.findIndex((t) => t.id === id)
    if (qi !== -1) this.#queue.splice(qi, 1)
  }

  #leave(el: HTMLElement): void {
    if (reduceMotion()) {
      el.remove()
      return
    }
    let done = false
    const finish = () => {
      if (done) return
      done = true
      el.remove()
    }
    el.classList.add('leaving')
    el.addEventListener('animationend', finish, { once: true })
    setTimeout(finish, LEAVE_FALLBACK_MS)
  }

  #promote(): void {
    while (this.#live.length < this.max && this.#queue.length > 0) this.#show(this.#queue.shift()!)
  }

  clear(): void {
    for (const l of this.#live) {
      l.timer?.cancel()
      l.el.remove()
    }
    this.#live = []
    this.#queue = []
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export const toasts = new VanillaToastStore()

export const toast = {
  success: (message: string, opts?: ToastOptions | number) => toasts.push('success', message, opts),
  error: (message: string, opts?: ToastOptions | number) => toasts.push('error', message, opts),
  info: (message: string, opts?: ToastOptions | number) => toasts.push('info', message, opts),
  loading: (message: string, opts?: ToastOptions | number) => toasts.push('loading', message, opts),

  /** Push a sticky `loading` toast, then flip it to success/error when the promise settles. */
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
