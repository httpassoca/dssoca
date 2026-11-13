import { readFileSync } from 'node:fs'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { tick } from 'svelte'
import Toaster from '$lib/components/Toaster.svelte'
import { toasts } from '$lib/toast.svelte'

describe('Toaster', () => {
  beforeEach(() => {
    toasts.clear()
  })

  it('labels the notifications container (toasts carry their own live semantics)', () => {
    const { container } = render(Toaster, {})
    const region = container.querySelector('.ss-toaster')
    expect(region).toHaveAttribute('aria-label', 'Notifications')
    // a named landmark: aria-label is prohibited on a role-less div (axe aria-prohibited-attr)
    expect(region).toHaveAttribute('role', 'region')
    // the container is no longer the live region — avoids double announcements
    expect(region).not.toHaveAttribute('aria-live')
  })

  it('renders persistent polite + assertive live regions before any toast', () => {
    const { container } = render(Toaster, {})
    const polite = container.querySelector('.ss-toaster > .live[role="status"]')
    const assertive = container.querySelector('.ss-toaster > .live[role="alert"]')
    expect(polite).toHaveAttribute('aria-live', 'polite')
    expect(assertive).toHaveAttribute('aria-live', 'assertive')
    expect(polite!.textContent).toBe('')
    expect(assertive!.textContent).toBe('')
  })

  it('announces info/success politely and errors assertively via the persistent regions', async () => {
    const { container } = render(Toaster, {})
    const polite = container.querySelector('.live[role="status"]')!
    const assertive = container.querySelector('.live[role="alert"]')!
    toasts.push('success', 'ok', 0)
    toasts.push('error', 'bad', 0)
    await tick()
    expect(polite.textContent).toBe('ok')
    expect(assertive.textContent).toBe('bad')
    // the same nodes persist — the toasts themselves carry no live role
    expect(container.querySelector('.live[role="status"]')).toBe(polite)
    for (const el of container.querySelectorAll('.ss-toast')) {
      expect(el).toHaveAttribute('role', 'group')
      expect(el).not.toHaveAttribute('aria-live')
      const name = document.getElementById(el.getAttribute('aria-labelledby')!)
      expect(name).toBe(el.querySelector('.msg'))
    }
  })

  it('moves the announcement to the assertive region when a toast flips to error', async () => {
    const { container } = render(Toaster, {})
    const id = toasts.push('loading', 'saving', 0)
    await tick()
    expect(container.querySelector('.live[role="status"]')!.textContent).toBe('saving')
    toasts.update(id, { kind: 'error', message: 'failed' })
    await tick()
    expect(container.querySelector('.live[role="status"]')!.textContent).toBe('')
    expect(container.querySelector('.live[role="alert"]')!.textContent).toBe('failed')
  })

  it('moves focus to a neighbouring toast when the focused one is dismissed', async () => {
    const { container } = render(Toaster, {})
    toasts.push('info', 'a', 0)
    toasts.push('info', 'b', 0)
    await tick()
    const [a, b] = container.querySelectorAll<HTMLElement>('.ss-toast')
    a.querySelector<HTMLButtonElement>('.x')!.focus()
    await fireEvent.click(a.querySelector('.x')!)
    expect(document.activeElement).toBe(b)
  })

  it('returns focus to where it came from when the last focused toast is dismissed', async () => {
    const outside = document.createElement('button')
    document.body.appendChild(outside)
    try {
      const { container } = render(Toaster, {})
      toasts.push('info', 'only', 0)
      await tick()
      outside.focus()
      const el = container.querySelector<HTMLElement>('.ss-toast')!
      el.focus()
      await fireEvent.keyDown(el, { key: 'Escape' })
      expect(toasts.items).toHaveLength(0)
      expect(document.activeElement).toBe(outside)
    } finally {
      outside.remove()
    }
  })

  it('pointerleave does not resume the timer while the toast holds focus', async () => {
    const { container } = render(Toaster, {})
    const resume = vi.spyOn(toasts, 'resume')
    toasts.push('info', 'kbd', 1000)
    await tick()
    const el = container.querySelector<HTMLElement>('.ss-toast')!
    el.focus()
    await fireEvent.pointerEnter(el)
    await fireEvent.pointerLeave(el)
    expect(resume).not.toHaveBeenCalled()
    el.blur()
    expect(resume).toHaveBeenCalledOnce()
    resume.mockRestore()
  })

  it('focusout does not resume the timer while the pointer is still over the toast', async () => {
    const { container } = render(Toaster, {})
    const resume = vi.spyOn(toasts, 'resume')
    toasts.push('info', 'hover', 1000)
    await tick()
    const el = container.querySelector<HTMLElement>('.ss-toast')!
    await fireEvent.pointerEnter(el)
    el.focus()
    el.blur()
    expect(resume).not.toHaveBeenCalled()
    await fireEvent.pointerLeave(el)
    expect(resume).toHaveBeenCalledOnce()
    resume.mockRestore()
  })

  it('renders nothing when the store is empty', () => {
    const { container } = render(Toaster, {})
    expect(container.querySelectorAll('.ss-toast')).toHaveLength(0)
  })

  it('renders a toast reactively when one is pushed', async () => {
    const { container } = render(Toaster, {})
    toasts.push('success', 'Saved!', 0)
    await Promise.resolve()
    const toastEl = container.querySelector('.ss-toast')
    expect(toastEl).not.toBeNull()
    expect(toastEl).toHaveClass('success')
    expect(container.querySelector('.ss-toast .msg')).toHaveTextContent('Saved!')
  })

  it('renders the right glyph per kind', async () => {
    const { container } = render(Toaster, {})
    toasts.push('success', 'a', 0)
    toasts.push('error', 'b', 0)
    toasts.push('info', 'c', 0)
    await Promise.resolve()
    const glyphs = Array.from(container.querySelectorAll('.ss-toast .ic')).map((e) => e.textContent)
    expect(glyphs).toEqual(['✓', '✕', 'i'])
  })

  it('dismisses a toast when its × button is clicked', async () => {
    const { container } = render(Toaster, {})
    toasts.push('info', 'bye', 0)
    await Promise.resolve()
    expect(container.querySelectorAll('.ss-toast')).toHaveLength(1)
    await fireEvent.click(container.querySelector('.ss-toast .x')!)
    // The click removes the item from the store (the real contract). The DOM
    // node lingers briefly under the `fly` out-transition, so assert on the
    // store, which is the source of truth the Toaster renders from.
    expect(toasts.items).toHaveLength(0)
  })

  it('the dismiss button is labelled for a11y', async () => {
    const { container } = render(Toaster, {})
    toasts.push('info', 'x', 0)
    await Promise.resolve()
    expect(container.querySelector('.ss-toast .x')).toHaveAttribute('aria-label', 'Dismiss')
  })

  it('renders a spinner (no glyph) for the loading kind', async () => {
    const { container } = render(Toaster, {})
    toasts.push('loading', 'working', 0)
    await Promise.resolve()
    const toastEl = container.querySelector('.ss-toast')
    expect(toastEl).toHaveClass('loading')
    expect(container.querySelector('.ss-toast .spinner')).not.toBeNull()
  })

  it('renders an action button when a toast carries an action', async () => {
    const { container } = render(Toaster, {})
    toasts.push('info', 'undo me', { action: { label: 'Undo', onClick: () => {} } })
    await Promise.resolve()
    const btn = container.querySelector('.ss-toast .action')
    expect(btn).not.toBeNull()
    expect(btn).toHaveTextContent('Undo')
  })

  it('invoking the action runs the callback and dismisses by default', async () => {
    const { container } = render(Toaster, {})
    let ran = false
    toasts.push('info', 'x', {
      action: {
        label: 'Go',
        onClick: () => {
          ran = true
        },
      },
    })
    await Promise.resolve()
    await fireEvent.click(container.querySelector('.ss-toast .action')!)
    expect(ran).toBe(true)
    expect(toasts.items).toHaveLength(0)
  })

  it('an action returning false keeps the toast open', async () => {
    const { container } = render(Toaster, {})
    toasts.push('info', 'x', { action: { label: 'Keep', onClick: () => false } })
    await Promise.resolve()
    await fireEvent.click(container.querySelector('.ss-toast .action')!)
    expect(toasts.items).toHaveLength(1)
  })

  it('applies the position as data-position (default top-right)', () => {
    const { container } = render(Toaster, {})
    expect(container.querySelector('.ss-toaster')).toHaveAttribute('data-position', 'top-right')
  })

  it('honors a custom position prop', () => {
    const { container } = render(Toaster, { position: 'bottom-center' })
    expect(container.querySelector('.ss-toaster')).toHaveAttribute('data-position', 'bottom-center')
  })

  it('pauses on pointer enter and resumes on leave', async () => {
    const { container } = render(Toaster, {})
    const pause = vi.spyOn(toasts, 'pause')
    const resume = vi.spyOn(toasts, 'resume')
    toasts.push('info', 'hover', 1000)
    await Promise.resolve()
    const el = container.querySelector('.ss-toast')!
    await fireEvent.pointerEnter(el)
    expect(pause).toHaveBeenCalled()
    await fireEvent.pointerLeave(el)
    expect(resume).toHaveBeenCalled()
    pause.mockRestore()
    resume.mockRestore()
  })

  it('renders fine while reading the fly duration from --ss-dur-fast (DS-0068)', async () => {
    // jsdom doesn't cascade custom properties, so the component must fall
    // back gracefully (180ms) instead of crashing or producing NaN.
    document.documentElement.style.setProperty('--ss-dur-fast', '90ms')
    try {
      const { container } = render(Toaster, {})
      toasts.push('info', 'timed', 0)
      await Promise.resolve()
      expect(container.querySelector('.ss-toast')).not.toBeNull()
      await fireEvent.click(container.querySelector('.ss-toast .x')!)
      expect(toasts.items).toHaveLength(0)
    } finally {
      document.documentElement.style.removeProperty('--ss-dur-fast')
    }
  })

  it('dismisses on Escape when the toast is focused', async () => {
    const { container } = render(Toaster, {})
    toasts.push('info', 'esc', 0)
    await Promise.resolve()
    const el = container.querySelector('.ss-toast')!
    await fireEvent.keyDown(el, { key: 'Escape' })
    expect(toasts.items).toHaveLength(0)
  })
})

describe('Toaster — dismiss target size (DS-0179)', () => {
  it('gives the × button a 24×24 hit area without growing the glyph', () => {
    const src = readFileSync('src/lib/components/Toaster.svelte', 'utf8')
    const x = src.slice(src.indexOf('    .x {'), src.indexOf('&:hover', src.indexOf('    .x {')))
    expect(x).toContain('min-inline-size: var(--ss-s-6)')
    expect(x).toContain('min-block-size: var(--ss-s-6)')
  })
})
