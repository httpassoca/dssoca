import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { toast, toasts } from '$lib/vanilla/toast'

const axeOpts = {
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'color-contrast': { enabled: false },
  },
}

const q = <E extends HTMLElement = HTMLElement>(sel: string) => document.querySelector<E>(sel)
const qa = (sel: string) => Array.from(document.querySelectorAll<HTMLElement>(sel))
const settle = () => vi.advanceTimersByTime(500) // > the leave fallback

beforeEach(() => {
  vi.useFakeTimers()
  document.body.innerHTML = ''
})

afterEach(() => {
  toasts.clear()
  toasts.max = 3
  vi.useRealTimers()
})

describe('vanilla — toast', () => {
  it('auto-creates the toaster and renders the Toaster.svelte DOM', () => {
    const id = toast.success('saved')
    const container = q('.ss-toaster')!
    expect(container.getAttribute('aria-label')).toBe('Notifications')
    expect(container.dataset.position).toBe('top-right')
    const el = q('.ss-toast')!
    expect(el.classList.contains('success')).toBe(true)
    expect(el.getAttribute('role')).toBe('status')
    expect(el.getAttribute('aria-live')).toBe('polite')
    expect(el.tabIndex).toBe(-1)
    expect(el.querySelector('.ic')!.textContent).toBe('✓')
    expect(el.querySelector('.msg')!.textContent).toBe('saved')
    expect(el.querySelector('.x')!.getAttribute('aria-label')).toBe('Dismiss')
    expect(toasts.items.map((t) => t.id)).toEqual([id])
  })

  it('respects an author-placed container and its position', () => {
    document.body.innerHTML = '<div class="ss-toaster" data-position="bottom-left"></div>'
    toast.info('hi')
    expect(qa('.ss-toaster')).toHaveLength(1)
    expect(q('.ss-toaster .ss-toast.info')).not.toBeNull()
  })

  it('errors are assertive alerts; loading shows the spinner glyph', () => {
    toast.error('boom')
    toast.loading('wait')
    const [err, load] = qa('.ss-toast')
    expect(err.getAttribute('role')).toBe('alert')
    expect(err.getAttribute('aria-live')).toBe('assertive')
    expect(load.querySelector('.ic.spinner')).not.toBeNull()
  })

  it('escapes message and action label', () => {
    toast.info('<b>x</b>', { action: { label: '<i>', onClick: () => {} } })
    expect(q('.msg')!.innerHTML).toBe('&lt;b&gt;x&lt;/b&gt;')
    expect(q('.action')!.innerHTML).toBe('&lt;i&gt;')
  })

  it('auto-dismisses after the per-kind default and pauses on hover/focus', () => {
    toast.success('a') // 4000ms
    const el = q('.ss-toast')!
    el.dispatchEvent(new Event('pointerenter'))
    vi.advanceTimersByTime(4500)
    expect(q('.ss-toast')).not.toBeNull()
    el.dispatchEvent(new Event('pointerleave'))
    vi.advanceTimersByTime(3999)
    expect(el.classList.contains('leaving')).toBe(false)
    vi.advanceTimersByTime(1)
    expect(el.classList.contains('leaving')).toBe(true)
    settle()
    expect(q('.ss-toast')).toBeNull()
  })

  it('removes the element on animationend (without waiting for the fallback)', () => {
    const id = toast.info('x')
    const el = q('.ss-toast')!
    toasts.dismiss(id)
    expect(el.classList.contains('leaving')).toBe(true)
    el.dispatchEvent(new Event('animationend'))
    expect(el.isConnected).toBe(false)
  })

  it('caps visible toasts at max and promotes the queue on dismiss', () => {
    const ids = [1, 2, 3, 4].map((n) => toast.info(`t${n}`, 0))
    expect(qa('.ss-toast')).toHaveLength(3)
    expect(toasts.items).toHaveLength(3)
    toasts.dismiss(ids[0])
    settle()
    expect(qa('.ss-toast .msg').map((m) => m.textContent)).toEqual(['t2', 't3', 't4'])
    toasts.dismiss(ids[3])
    expect(toasts.items).toHaveLength(2)
  })

  it('dismisses from the × button and from Escape', () => {
    toast.info('a', 0)
    toast.info('b', 0)
    const [a, b] = qa('.ss-toast')
    a.querySelector<HTMLButtonElement>('.x')!.click()
    b.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    settle()
    expect(qa('.ss-toast')).toHaveLength(0)
  })

  it('action: dismisses unless onClick returns false', () => {
    const keep = vi.fn(() => false as const)
    const go = vi.fn()
    toast.info('k', { action: { label: 'undo', onClick: keep } })
    toast.info('g', { action: { label: 'ok', onClick: go } })
    const [k, g] = qa('.ss-toast')
    expect(toasts.items[0].timeout).toBe(0) // actions default to sticky
    k.querySelector<HTMLButtonElement>('.action')!.click()
    g.querySelector<HTMLButtonElement>('.action')!.click()
    settle()
    expect(keep).toHaveBeenCalledOnce()
    expect(go).toHaveBeenCalledOnce()
    expect(qa('.ss-toast .msg').map((m) => m.textContent)).toEqual(['k'])
  })

  it('update re-renders kind/message and re-arms the timer; promise drives it', async () => {
    let resolve!: (v: string) => void
    const p = new Promise<string>((r) => (resolve = r))
    void toast.promise(p, { loading: 'working', success: (v) => `done ${v}`, error: 'failed' })
    expect(q('.ss-toast.loading .msg')!.textContent).toBe('working')
    resolve('ok')
    await p
    await Promise.resolve()
    const el = q('.ss-toast')!
    expect(el.classList.contains('success')).toBe(true)
    expect(el.querySelector('.msg')!.textContent).toBe('done ok')
    vi.advanceTimersByTime(4000)
    expect(el.classList.contains('leaving')).toBe(true)
    expect(toasts.update(999, { message: 'x' })).toBe(false)
  })

  it('clear removes everything at once', () => {
    toast.info('a')
    toast.info('b')
    toasts.clear()
    expect(qa('.ss-toast')).toHaveLength(0)
    expect(toasts.items).toHaveLength(0)
  })

  it('has no axe violations', async () => {
    vi.useRealTimers() // axe schedules its own timers
    toast.success('ok')
    toast.error('bad', { action: { label: 'retry', onClick: () => {} } })
    expect(await axe(document.body, axeOpts)).toHaveNoViolations()
  })
})
