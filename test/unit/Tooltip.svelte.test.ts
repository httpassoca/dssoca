import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { axe } from 'vitest-axe'
import TooltipHarness from '../harness/TooltipHarness.svelte'

const axeOpts = {
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'color-contrast': { enabled: false },
  },
}

const root = (c: HTMLElement) => c.querySelector('.ss-tooltip') as HTMLElement
const trigger = (c: HTMLElement) => c.querySelector('.trigger button') as HTMLButtonElement
const tip = (c: HTMLElement) => c.querySelector('.tip') as HTMLElement

describe('Tooltip', () => {
  it('renders the trigger content inside .ss-tooltip', () => {
    const { container } = render(TooltipHarness, { trigger: 'Help' })
    expect(root(container)).not.toBeNull()
    expect(trigger(container)).toHaveTextContent('Help')
  })

  it('keeps the tooltip element in the DOM with role="tooltip"', () => {
    const { container } = render(TooltipHarness, { text: 'More info' })
    const t = tip(container)
    expect(t).not.toBeNull()
    expect(t).toHaveAttribute('role', 'tooltip')
    expect(t).toHaveTextContent('More info')
  })

  it('is closed by default: tooltip hidden, no aria-describedby', () => {
    const { container } = render(TooltipHarness)
    expect(tip(container)).toHaveAttribute('hidden')
    expect(tip(container)).not.toHaveClass('open')
    expect(root(container)).not.toHaveAttribute('aria-describedby')
  })

  it('shows on focusin: sets aria-describedby to the tooltip id and reveals it', async () => {
    const { container } = render(TooltipHarness, { text: 'More info' })
    await fireEvent.focusIn(root(container))
    const t = tip(container)
    expect(t).toHaveClass('open')
    expect(t).not.toHaveAttribute('hidden')
    expect(root(container)).toHaveAttribute('aria-describedby', t.id)
    expect(t).toHaveTextContent('More info')
  })

  it('hides on focusout', async () => {
    const { container } = render(TooltipHarness)
    await fireEvent.focusIn(root(container))
    expect(tip(container)).toHaveClass('open')
    await fireEvent.focusOut(root(container))
    expect(tip(container)).not.toHaveClass('open')
    expect(root(container)).not.toHaveAttribute('aria-describedby')
  })

  it('shows on mouseenter and hides on mouseleave', async () => {
    const { container } = render(TooltipHarness)
    await fireEvent.mouseEnter(root(container))
    expect(tip(container)).toHaveClass('open')
    await fireEvent.mouseLeave(root(container))
    expect(tip(container)).not.toHaveClass('open')
  })

  it('hides on Escape keydown', async () => {
    const { container } = render(TooltipHarness)
    await fireEvent.focusIn(root(container))
    expect(tip(container)).toHaveClass('open')
    await fireEvent.keyDown(root(container), { key: 'Escape' })
    expect(tip(container)).not.toHaveClass('open')
    expect(root(container)).not.toHaveAttribute('aria-describedby')
  })

  describe('placement', () => {
    it('defaults to top', () => {
      const { container } = render(TooltipHarness)
      expect(root(container)).toHaveAttribute('data-placement', 'top')
    })

    it('reflects the placement prop via data-placement', () => {
      const { container } = render(TooltipHarness, { placement: 'right' })
      expect(root(container)).toHaveAttribute('data-placement', 'right')
    })
  })

  it('applies the explicit size as data-size-variant on the root', () => {
    const { container } = render(TooltipHarness, { size: 'lg' })
    expect(root(container)).toHaveAttribute('data-size-variant', 'lg')
  })

  describe('a11y (axe)', () => {
    it('has no violations while closed', async () => {
      const { container } = render(TooltipHarness, { text: 'More info' })
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })

    it('has no violations while open', async () => {
      const { container } = render(TooltipHarness, { text: 'More info' })
      await fireEvent.focusIn(root(container))
      expect(await axe(container, axeOpts)).toHaveNoViolations()
    })
  })
})
