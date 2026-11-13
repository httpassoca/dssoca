import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { toast, toasts } from '$lib/vanilla/toast'

// DS-0179 — persistent live regions, focus restore on dismiss, and focus-aware timer resume.

const q = <E extends HTMLElement = HTMLElement>(sel: string) => document.querySelector<E>(sel)
const qa = (sel: string) => Array.from(document.querySelectorAll<HTMLElement>(sel))

beforeEach(() => {
  vi.useFakeTimers()
  document.body.innerHTML = ''
})

afterEach(() => {
  toasts.clear()
  vi.useRealTimers()
})

describe('vanilla toast — live regions', () => {
  it('prepares the regions of an author-placed container before the first toast', () => {
    document.body.innerHTML =
      '<div class="ss-toaster" role="region" aria-label="Notifications"></div>'
    toasts.prepare()
    const polite = q('.ss-toaster > .live[role="status"]')!
    const assertive = q('.ss-toaster > .live[role="alert"]')!
    expect(polite.getAttribute('aria-live')).toBe('polite')
    expect(assertive.getAttribute('aria-live')).toBe('assertive')
    expect(polite.textContent).toBe('')
  })

  it('reuses author-written regions and writes into them (not into a fresh node)', () => {
    document.body.innerHTML =
      '<div class="ss-toaster"><div class="live" role="status" aria-live="polite"></div>' +
      '<div class="live" role="alert" aria-live="assertive"></div></div>'
    const polite = q('.live[role="status"]')!
    const assertive = q('.live[role="alert"]')!
    toast.success('saved')
    toast.error('boom')
    // pre-existing regions are written synchronously
    expect(polite.textContent).toBe('saved')
    expect(assertive.textContent).toBe('boom')
    expect(qa('.live')).toHaveLength(2)
    expect(q('.ss-toast')!.hasAttribute('aria-live')).toBe(false)
  })

  it('defers the first write into freshly created regions', () => {
    toast.info('hello')
    const polite = q('.live[role="status"]')!
    expect(polite.textContent).toBe('')
    vi.advanceTimersByTime(100)
    expect(polite.textContent).toBe('hello')
  })

  it('moves the message to the assertive region when a toast flips to error; removes on dismiss', () => {
    toasts.prepare() // no container yet: no-op
    document.body.innerHTML = '<div class="ss-toaster"></div>'
    toasts.prepare()
    vi.advanceTimersByTime(100)
    const id = toast.loading('saving')
    expect(q('.live[role="status"]')!.textContent).toBe('saving')
    toasts.update(id, { kind: 'error', message: 'failed' })
    expect(q('.live[role="status"]')!.textContent).toBe('')
    expect(q('.live[role="alert"]')!.textContent).toBe('failed')
    toasts.dismiss(id)
    expect(q('.live[role="alert"]')!.textContent).toBe('')
  })
})

describe('vanilla toast — focus management', () => {
  it('moves focus to the next toast when the focused one is dismissed', () => {
    toast.info('a', 0)
    toast.info('b', 0)
    const [a, b] = qa('.ss-toast')
    const x = a.querySelector<HTMLButtonElement>('.x')!
    x.focus()
    x.click()
    expect(document.activeElement).toBe(b)
  })

  it('returns focus to its origin when the last toast is dismissed', () => {
    const origin = document.createElement('button')
    document.body.appendChild(origin)
    toast.info('only', 0)
    const el = q('.ss-toast')!
    origin.focus()
    el.focus()
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(document.activeElement).toBe(origin)
  })

  it('pointerleave does not resume the timer while the toast holds focus', () => {
    toast.success('a') // 4000ms
    const el = q('.ss-toast')!
    el.focus()
    el.dispatchEvent(new Event('pointerenter'))
    el.dispatchEvent(new Event('pointerleave'))
    vi.advanceTimersByTime(5000)
    expect(el.classList.contains('leaving')).toBe(false)
    el.blur()
    vi.advanceTimersByTime(4000)
    expect(el.classList.contains('leaving')).toBe(true)
  })

  it('focusout does not resume the timer while the pointer is still over the toast', () => {
    toast.success('a')
    const el = q('.ss-toast')!
    el.dispatchEvent(new Event('pointerenter'))
    el.focus()
    el.blur()
    vi.advanceTimersByTime(5000)
    expect(el.classList.contains('leaving')).toBe(false)
  })
})
