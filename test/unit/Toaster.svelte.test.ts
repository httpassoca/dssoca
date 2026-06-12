import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
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
    // the container is no longer the live region — avoids double announcements
    expect(region).not.toHaveAttribute('aria-live')
  })

  it('announces info/success politely and errors assertively', async () => {
    const { container } = render(Toaster, {})
    toasts.push('success', 'ok', 0)
    toasts.push('error', 'bad', 0)
    await Promise.resolve()
    const els = container.querySelectorAll('.ss-toast')
    expect(els[0]).toHaveAttribute('role', 'status')
    expect(els[0]).toHaveAttribute('aria-live', 'polite')
    expect(els[1]).toHaveAttribute('role', 'alert')
    expect(els[1]).toHaveAttribute('aria-live', 'assertive')
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
