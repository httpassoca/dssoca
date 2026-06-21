import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import BadgeHarness from '../harness/BadgeHarness.svelte'
import ButtonHarness from '../harness/ButtonHarness.svelte'
import InputHarness from '../harness/InputHarness.svelte'
import LinkHarness from '../harness/LinkHarness.svelte'
import LogStream from '$lib/components/LogStream.svelte'

// DS-0071 — keyboard interaction coverage. jsdom does not implement the
// browser's native key→activation pipeline (Enter/Space on a <button>/<a>
// does not synthesize a click) nor sequential focus navigation (Tab). So
// these tests pin the *component-side* half of the platform contract:
//   • the control is a native <button>/<a href> (which is what guarantees
//     Enter/Space/Tab behaviour in a real browser),
//   • it is focusable and carries an accessible name,
//   • the activation keydown reaches it un-prevented,
//   • and the activation (click) handler does the right thing.

/** Emulate keyboard activation of a natively-activatable control: assert the
 *  native-element contract, deliver the key un-prevented, then fire the click
 *  the platform would synthesize. */
async function pressActivate(el: HTMLElement, key: 'Enter' | ' ') {
  expect(['BUTTON', 'A']).toContain(el.tagName) // native key activation only exists on these
  el.focus()
  expect(el).toHaveFocus()
  const unprevented = await fireEvent.keyDown(el, { key })
  expect(unprevented).toBe(true) // component didn't preventDefault the activation key
  await fireEvent.keyUp(el, { key })
  await fireEvent.click(el)
}

/** Elements reachable by Tab, in DOM order. With no positive tabindex in the
 *  tree, a real browser's Tab order IS this document order (and Shift+Tab the
 *  exact reverse) — so asserting the list pins the traversal both ways. */
function tabbables(container: HTMLElement): HTMLElement[] {
  const sel = 'a[href], button, input, select, textarea, [tabindex]'
  return [...container.querySelectorAll<HTMLElement>(sel)].filter(
    (el) => el.tabIndex >= 0 && !el.hasAttribute('disabled'),
  )
}

describe('keyboard — Badge is non-interactive (DS-0120)', () => {
  it('exposes no tabbable / interactive element in any prop combination', () => {
    const { container } = render(BadgeHarness, {
      text: 'build',
      label: 'build',
      dot: true,
      count: 4,
      live: true,
    })
    expect(tabbables(container)).toHaveLength(0)
    expect(container.querySelector('button')).toBeNull()
  })
})

describe('keyboard — Button activation (DS-0071)', () => {
  it.each(['Enter', ' '] as const)('activates on %j', async (key) => {
    const onclick = vi.fn()
    render(ButtonHarness, { onclick, text: 'Save' })
    await pressActivate(screen.getByRole('button', { name: 'Save' }), key)
    expect(onclick).toHaveBeenCalledOnce()
  })

  it('stays focusable while loading but guards keyboard activation', async () => {
    const onclick = vi.fn()
    render(ButtonHarness, { onclick, loading: true, text: 'Save' })
    const btn = screen.getByRole('button', { name: 'Save' })
    await pressActivate(btn, 'Enter') // soft-disable: reachable, announceable…
    expect(onclick).not.toHaveBeenCalled() // …but the activation is swallowed
  })

  it('is removed from the tab order when natively disabled', () => {
    const { container } = render(ButtonHarness, { disabled: true, text: 'Save' })
    expect(tabbables(container)).toHaveLength(0)
  })
})

describe('keyboard — Input tab order + clearable (DS-0071)', () => {
  it('Tab reaches the input then the clear button, in DOM order (Shift+Tab reverses)', () => {
    const { container } = render(InputHarness, {
      label: 'Email',
      clearable: true,
      initial: 'x',
    })
    const order = tabbables(container)
    const input = screen.getByLabelText('Email')
    const clear = screen.getByRole('button', { name: 'Clear' })
    expect(order).toEqual([input, clear])
    // No positive tabindex anywhere → natural forward order, exact reverse on Shift+Tab.
    expect(order.every((el) => el.tabIndex === 0)).toBe(true)
  })

  it('the clear button is keyboard-accessible: focus, activate, value cleared', async () => {
    render(InputHarness, { label: 'Email', clearable: true, initial: 'hello' })
    const input = screen.getByLabelText('Email') as HTMLInputElement
    expect(input.value).toBe('hello')
    await pressActivate(screen.getByRole('button', { name: 'Clear' }), 'Enter')
    expect(input.value).toBe('')
  })

  it('clearing hands focus back to the input (no keyboard dead-end)', async () => {
    render(InputHarness, { label: 'Email', clearable: true, initial: 'hello' })
    const input = screen.getByLabelText('Email')
    const clear = screen.getByRole('button', { name: 'Clear' })
    clear.focus()
    await fireEvent.click(clear) // the button disappears once the value empties
    expect(input).toHaveFocus()
  })

  it('a disabled input exposes no tab stops (clear button hidden too)', () => {
    const { container } = render(InputHarness, {
      label: 'Email',
      clearable: true,
      initial: 'x',
      disabled: true,
    })
    expect(tabbables(container)).toHaveLength(0)
  })
})

describe('keyboard — Link button-variant (DS-0071)', () => {
  it('is a real <a href> (native Enter activation) with the button look', async () => {
    render(LinkHarness, { variant: 'button', href: '/deploy', text: 'Deploy' })
    const link = screen.getByRole('link', { name: 'Deploy' })
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '/deploy')
    expect(link).toHaveClass('ss-link', 'button')
    // Enter must reach the anchor un-prevented for native navigation to run.
    link.focus()
    expect(link).toHaveFocus()
    expect(await fireEvent.keyDown(link, { key: 'Enter' })).toBe(true)
  })

  it('is in the tab order exactly once', () => {
    const { container } = render(LinkHarness, {
      variant: 'button',
      href: '/deploy',
      text: 'Deploy',
    })
    const order = tabbables(container)
    expect(order).toHaveLength(1)
    expect(order[0]).toBe(screen.getByRole('link', { name: 'Deploy' }))
  })
})

describe('keyboard — LogStream filter buttons (DS-0071)', () => {
  const lines = [
    { lvl: 'info', svc: '[hub]', msg: 'session refresh' },
    { lvl: 'err', svc: '[tasks]', msg: 'EADDRINUSE :3004' },
  ] as const

  it('level filters are native toggle buttons with aria-pressed state', () => {
    render(LogStream, { lines: [...lines] })
    for (const name of ['INFO', 'WARN', 'ERR', 'OK']) {
      const chip = screen.getByRole('button', { name, pressed: true })
      expect(chip.tagName).toBe('BUTTON')
      expect(chip).toHaveAttribute('type', 'button')
    }
  })

  it.each(['Enter', ' '] as const)(
    'toggling a level via %j hides those lines and flips aria-pressed',
    async (key) => {
      render(LogStream, { lines: [...lines] })
      expect(screen.getByText('EADDRINUSE :3004')).toBeInTheDocument()
      const errChip = screen.getByRole('button', { name: 'ERR' })
      await pressActivate(errChip, key)
      expect(errChip).toHaveAttribute('aria-pressed', 'false')
      expect(screen.queryByText('EADDRINUSE :3004')).not.toBeInTheDocument()
      expect(screen.getByText('session refresh')).toBeInTheDocument()
      // toggling back restores the lines
      await pressActivate(errChip, key)
      expect(errChip).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByText('EADDRINUSE :3004')).toBeInTheDocument()
    },
  )

  it('the toolbar is fully keyboard-reachable (filters, search, wrap, copy)', () => {
    const { container } = render(LogStream, { lines: [...lines] })
    const bar = container.querySelector('.bar') as HTMLElement
    const stops = tabbables(bar)
    // 4 level chips + search input + WRAP + COPY (controlled mode has no CLEAR).
    expect(stops.length).toBeGreaterThanOrEqual(7)
    expect(stops.every((el) => el.tabIndex === 0)).toBe(true)
    expect(screen.getByRole('textbox', { name: 'Filter log text' })).toBeInTheDocument()
  })
})
