import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { tick } from 'svelte'
import { axe } from 'vitest-axe'
import PopoverHarness from '../harness/PopoverHarness.svelte'

const axeOpts = {
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'color-contrast': { enabled: false },
  },
}

const root = (c: HTMLElement) => c.querySelector('.ss-popover') as HTMLElement
const trigger = (c: HTMLElement) => c.querySelector('.trigger') as HTMLButtonElement
const panel = (c: HTMLElement) => c.querySelector('.panel') as HTMLElement
const byId = (c: HTMLElement, id: string) => c.querySelector(`[data-testid="${id}"]`) as HTMLElement

async function openIt(c: HTMLElement) {
  await fireEvent.click(trigger(c))
  await tick()
}

describe('Popover', () => {
  it('renders a trigger button wired to a non-modal dialog panel', () => {
    const { container } = render(PopoverHarness, { trigger: 'Filters' })
    const t = trigger(container)
    const p = panel(container)
    expect(root(container)).not.toBeNull()
    expect(t.tagName).toBe('BUTTON')
    expect(t).toHaveAttribute('type', 'button')
    expect(t).toHaveTextContent('Filters')
    expect(t).toHaveAttribute('aria-haspopup', 'dialog')
    expect(t).toHaveAttribute('aria-expanded', 'false')
    expect(t).toHaveAttribute('aria-controls', p.id)
    expect(p).toHaveAttribute('role', 'dialog')
    expect(p).not.toHaveAttribute('aria-modal')
    expect(p).toHaveAttribute('tabindex', '-1')
  })

  it('is named by the trigger, or by `label` when given', () => {
    const a = render(PopoverHarness, { trigger: 'Filters', open: true })
    expect(panel(a.container).getAttribute('aria-labelledby')).toBe(trigger(a.container).id)
    expect(panel(a.container)).toHaveAccessibleName('Filters')
    const b = render(PopoverHarness, { label: 'Log filters', open: true })
    expect(panel(b.container)).not.toHaveAttribute('aria-labelledby')
    expect(panel(b.container)).toHaveAccessibleName('Log filters')
  })

  it('stamps side, align and size on the root', () => {
    const { container } = render(PopoverHarness, { side: 'top', align: 'end', size: 'lg' })
    expect(root(container)).toHaveAttribute('data-side', 'top')
    expect(root(container)).toHaveAttribute('data-align', 'end')
    expect(root(container)).toHaveAttribute('data-size-variant', 'lg')
    const def = render(PopoverHarness)
    expect(root(def.container)).toHaveAttribute('data-side', 'bottom')
    expect(root(def.container)).toHaveAttribute('data-align', 'start')
  })

  describe('hidden means hidden', () => {
    it('the closed panel is inert; opening lifts it', async () => {
      const { container } = render(PopoverHarness)
      expect(panel(container)).toHaveAttribute('inert')
      expect(panel(container)).not.toHaveClass('open')
      await openIt(container)
      expect(panel(container)).not.toHaveAttribute('inert')
      expect(panel(container)).toHaveClass('open')
      await fireEvent.click(trigger(container))
      expect(panel(container)).toHaveAttribute('inert')
    })
  })

  describe('open', () => {
    it('a trigger press opens, reports the reason and moves focus to the first focusable', async () => {
      const onOpenChange = vi.fn()
      const { container } = render(PopoverHarness, { onOpenChange })
      await openIt(container)
      expect(trigger(container)).toHaveAttribute('aria-expanded', 'true')
      expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true, { reason: 'trigger' })
      expect(document.activeElement).toBe(byId(container, 'first'))
      expect(byId(container, 'state')).toHaveTextContent('open')
    })

    it('focuses the panel itself when it holds nothing focusable', async () => {
      const { container } = render(PopoverHarness, { focusable: false })
      await openIt(container)
      expect(document.activeElement).toBe(panel(container))
    })

    it('moves focus in when the parent opens it through bind:open', async () => {
      const onOpenChange = vi.fn()
      const { container } = render(PopoverHarness, { onOpenChange })
      await fireEvent.click(byId(container, 'parent-open'))
      await tick()
      expect(trigger(container)).toHaveAttribute('aria-expanded', 'true')
      expect(document.activeElement).toBe(byId(container, 'first'))
      expect(onOpenChange).not.toHaveBeenCalled()
    })

    it('does not grab focus when rendered open', async () => {
      const { container } = render(PopoverHarness, { open: true })
      await tick()
      expect(container.contains(document.activeElement)).toBe(false)
    })
  })

  describe('close', () => {
    it('a second trigger press closes and keeps focus on the trigger', async () => {
      const onOpenChange = vi.fn()
      const { container } = render(PopoverHarness, { onOpenChange })
      await openIt(container)
      await fireEvent.click(trigger(container))
      expect(trigger(container)).toHaveAttribute('aria-expanded', 'false')
      expect(onOpenChange).toHaveBeenLastCalledWith(false, { reason: 'trigger' })
      expect(document.activeElement).toBe(trigger(container))
    })

    it('Escape closes and returns focus to the trigger, from the panel or the trigger', async () => {
      const onOpenChange = vi.fn()
      const { container } = render(PopoverHarness, { onOpenChange })
      await openIt(container)
      const notCancelled = await fireEvent.keyDown(byId(container, 'second'), { key: 'Escape' })
      expect(notCancelled).toBe(false)
      expect(trigger(container)).toHaveAttribute('aria-expanded', 'false')
      expect(document.activeElement).toBe(trigger(container))
      expect(onOpenChange).toHaveBeenLastCalledWith(false, { reason: 'escape' })

      await openIt(container)
      await fireEvent.keyDown(trigger(container), { key: 'Escape' })
      expect(trigger(container)).toHaveAttribute('aria-expanded', 'false')
    })

    it('leaves Escape alone when closed, or when something inside already used it', async () => {
      const { container } = render(PopoverHarness)
      expect(await fireEvent.keyDown(trigger(container), { key: 'Escape' })).toBe(true)
      await openIt(container)
      const inner = byId(container, 'first')
      inner.addEventListener('keydown', (e) => e.preventDefault())
      await fireEvent.keyDown(inner, { key: 'Escape' })
      expect(trigger(container)).toHaveAttribute('aria-expanded', 'true')
    })

    it('an outside pointerdown closes without pulling focus back', async () => {
      const onOpenChange = vi.fn()
      const { container } = render(PopoverHarness, { onOpenChange })
      await openIt(container)
      const before = byId(container, 'before')
      await fireEvent.pointerDown(before)
      expect(trigger(container)).toHaveAttribute('aria-expanded', 'false')
      expect(onOpenChange).toHaveBeenLastCalledWith(false, { reason: 'outside' })
      expect(document.activeElement).not.toBe(trigger(container))
    })

    it('stays open on pointerdown inside the panel or on the trigger', async () => {
      const { container } = render(PopoverHarness)
      await openIt(container)
      await fireEvent.pointerDown(byId(container, 'second'))
      await fireEvent.pointerDown(trigger(container))
      expect(trigger(container)).toHaveAttribute('aria-expanded', 'true')
    })

    it('tabbing out closes it and lets focus go on', async () => {
      const onOpenChange = vi.fn()
      const { container } = render(PopoverHarness, { onOpenChange })
      await openIt(container)
      const after = byId(container, 'after')
      after.focus() // what Tab from the last element does
      await tick()
      expect(trigger(container)).toHaveAttribute('aria-expanded', 'false')
      expect(onOpenChange).toHaveBeenLastCalledWith(false, { reason: 'tab' })
      expect(document.activeElement).toBe(after)
    })

    it('moving focus inside (panel ↔ trigger) or losing it to nothing keeps it open', async () => {
      const { container } = render(PopoverHarness)
      await openIt(container)
      byId(container, 'second').focus()
      trigger(container).focus()
      await tick()
      expect(trigger(container)).toHaveAttribute('aria-expanded', 'true')
      await fireEvent.focusOut(trigger(container), { relatedTarget: null })
      expect(trigger(container)).toHaveAttribute('aria-expanded', 'true')
    })

    it('attaches the document pointerdown listener only while open', async () => {
      const add = vi.spyOn(document, 'addEventListener')
      const remove = vi.spyOn(document, 'removeEventListener')
      const { container } = render(PopoverHarness)
      expect(add.mock.calls.some(([t]) => t === 'pointerdown')).toBe(false)
      await openIt(container)
      expect(add.mock.calls.some(([t]) => t === 'pointerdown')).toBe(true)
      await fireEvent.click(trigger(container))
      expect(remove.mock.calls.some(([t]) => t === 'pointerdown')).toBe(true)
      add.mockRestore()
      remove.mockRestore()
    })
  })

  describe('a11y (axe)', () => {
    it('closed', async () => {
      const { container } = render(PopoverHarness)
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })

    it('open, named by the trigger', async () => {
      const { container } = render(PopoverHarness, { open: true })
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })

    it('open, labelled, text-only content', async () => {
      const { container } = render(PopoverHarness, {
        open: true,
        label: 'Details',
        focusable: false,
      })
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })
  })
})
