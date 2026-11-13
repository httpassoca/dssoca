/**
 * Toasts (DS-0148) — framework-free port of `toast.svelte.ts` + Toaster.svelte that renders
 * the exact Toaster DOM directly. Same API names as the Svelte one:
 *
 *   toast.success('saved')            toast.error('nope', { action: { label, onClick } })
 *   toast.loading('…')                toast.promise(p, { loading, success, error })
 *   toasts.dismiss(id) / clear() / update(id, patch) / max
 *
 * The stack lives in the first `.ss-toaster` on the page (author it to choose `data-position`
 * / size) or in one auto-created under `<body>`. Hover/focus pause the timer (it resumes only
 * once the pointer has left AND focus is outside the toast), Escape and the × button dismiss,
 * exit runs the `.leaving` CSS animation from vanilla.css. Dismissing the focused toast moves
 * focus to a neighbouring toast, or back to where it came from. Swipe-to-dismiss is not ported.
 *
 * Announcements go through two persistent, visually hidden live regions inside the container
 * (`.live[role=status]` polite, `.live[role=alert]` assertive — the same DOM Toaster.svelte
 * renders; author them in the markup or they are added on DOM ready / first use). Each visible
 * toast mirrors its message into one of them; the toasts themselves carry no live role.
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
  /** The toast's mirror node inside the polite/assertive live region. */
  say: HTMLElement
  timer: ToastTimer | null
  hovered: boolean
}

/** Screen readers need a moment to register a fresh live region before it changes. */
const LIVE_READY_MS = 100

const reduceMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

class VanillaToastStore {
  max = 3
  #seq = 0
  #live: Live[] = []
  #queue: Toast[] = []
  #container: HTMLElement | null = null
  #polite: HTMLElement | null = null
  #assertive: HTMLElement | null = null
  /** When the current live regions were created (content inserted earlier may be skipped). */
  #liveSince = 0
  #returnFocus: HTMLElement | null = null

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
      el.setAttribute('role', 'region')
      el.setAttribute('aria-label', 'Notifications')
      el.dataset.position = 'top-right'
      document.body.appendChild(el)
    }
    this.#container = el
    el.addEventListener('focusin', (e) => {
      const from = e.relatedTarget as HTMLElement | null
      if (from && !el.contains(from)) this.#returnFocus = from
    })
    this.#ensureLive(el)
    return el
  }

  /** Make sure the container holds both persistent live regions (adds any that are missing). */
  #ensureLive(el: HTMLElement): void {
    const find = (role: string) =>
      Array.from(el.children).find(
        (c): c is HTMLElement => c.classList.contains('live') && c.getAttribute('role') === role,
      ) ?? null
    let polite = find('status')
    let assertive = find('alert')
    this.#liveSince = !polite || !assertive ? Date.now() : 0
    if (!polite) {
      polite = document.createElement('div')
      polite.className = 'live'
      polite.setAttribute('role', 'status')
      polite.setAttribute('aria-live', 'polite')
      el.prepend(polite)
    }
    if (!assertive) {
      assertive = document.createElement('div')
      assertive.className = 'live'
      assertive.setAttribute('role', 'alert')
      assertive.setAttribute('aria-live', 'assertive')
      polite.after(assertive)
    }
    this.#polite = polite
    this.#assertive = assertive
  }

  /** Prepare the live regions of an author-placed container ahead of the first toast. */
  prepare(): void {
    if (document.querySelector('.ss-toaster')) void this.container
  }

  /** Write a toast's message into the live region matching its kind. */
  #announce(live: Live): void {
    const region = live.toast.kind === 'error' ? this.#assertive! : this.#polite!
    const text = live.toast.message
    const write = () => {
      if (!this.#live.includes(live)) return
      if (live.say.parentElement !== region) region.appendChild(live.say)
      live.say.textContent = text
    }
    const wait = this.#liveSince + LIVE_READY_MS - Date.now()
    if (wait > 0) setTimeout(write, wait)
    else write()
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
    const live: Live = {
      toast: t,
      el,
      say: document.createElement('p'),
      timer: null,
      hovered: false,
    }
    el.addEventListener('pointerenter', () => {
      live.hovered = true
      this.pause(t.id)
    })
    el.addEventListener('pointerleave', () => {
      live.hovered = false
      if (!el.contains(document.activeElement)) this.resume(t.id)
    })
    el.addEventListener('focusin', () => this.pause(t.id))
    el.addEventListener('focusout', (e) => {
      if (el.contains(e.relatedTarget as Node | null) || live.hovered) return
      this.resume(t.id)
    })
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
    this.#live.push(live)
    this.#announce(live)
    this.#arm(live)
  }

  #render(el: HTMLElement, t: Toast): void {
    el.className = `ss-toast ${t.kind}`
    // A focusable group named by its message (focus can land on the toast itself).
    const msgId = `ss-toast-msg-${t.id}`
    el.setAttribute('role', 'group')
    el.setAttribute('aria-labelledby', msgId)
    const ic =
      t.kind === 'loading'
        ? `<span class="ic spinner${reduceMotion() ? ' still' : ''}" aria-hidden="true"></span>`
        : `<span class="ic" aria-hidden="true">${GLYPH[t.kind]}</span>`
    const action = t.action
      ? `<button class="action" type="button">${escapeHtml(t.action.label)}</button>`
      : ''
    el.innerHTML =
      `${ic}<span class="msg" id="${msgId}">${escapeHtml(t.message)}</span>${action}` +
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
      // Re-rendering replaces the toast's buttons; keep focus inside it.
      const hadFocus = live.el.contains(document.activeElement)
      this.#render(live.el, live.toast)
      if (hadFocus && !live.el.contains(document.activeElement)) live.el.focus()
      this.#announce(live)
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
      if (holdsFocus(this.#live[i])) this.#moveFocusFrom(i)
      const [live] = this.#live.splice(i, 1)
      live.timer?.cancel()
      live.say.remove()
      this.#leave(live.el)
      this.#promote()
      return
    }
    const qi = this.#queue.findIndex((t) => t.id === id)
    if (qi !== -1) this.#queue.splice(qi, 1)
  }

  /** Move focus off the toast at `i` (about to be removed): next toast, previous, or origin. */
  #moveFocusFrom(i: number): void {
    const next = this.#live[i + 1] ?? this.#live[i - 1]
    if (next) next.el.focus()
    else if (this.#returnFocus?.isConnected) {
      this.#returnFocus.focus()
      this.#returnFocus = null
    }
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
      l.say.remove()
      l.el.remove()
    }
    this.#live = []
    this.#queue = []
  }
}

const holdsFocus = (l: Live): boolean => l.el.contains(document.activeElement)

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export const toasts = new VanillaToastStore()

// Give an author-placed `.ss-toaster` its live regions as soon as the DOM is ready, so they exist
// well before the first toast writes into them.
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => toasts.prepare(), { once: true })
  } else {
    toasts.prepare()
  }
}

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
