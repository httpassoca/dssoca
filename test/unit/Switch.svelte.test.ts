import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { axe } from 'vitest-axe'
import Switch from '$lib/components/Switch.svelte'

const axeOpts = {
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'color-contrast': { enabled: false },
  },
}

describe('Switch', () => {
  it('renders a switch with aria-checked reflecting the off state', () => {
    const { container } = render(Switch, { label: 'Notifications' })
    const sw = container.querySelector('[role="switch"]')!
    expect(sw).toHaveAttribute('aria-checked', 'false')
  })

  it('reflects the on state via aria-checked when checked', () => {
    const { container } = render(Switch, { label: 'Notifications', checked: true })
    expect(container.querySelector('[role="switch"]')).toHaveAttribute('aria-checked', 'true')
  })

  it('toggles checked on click and calls onchange with the new value', async () => {
    const onchange = vi.fn()
    const { container } = render(Switch, { label: 'Notifications', onchange })
    const sw = container.querySelector<HTMLButtonElement>('[role="switch"]')!
    await fireEvent.click(sw)
    expect(onchange).toHaveBeenCalledWith(true)
    expect(sw).toHaveAttribute('aria-checked', 'true')
  })

  it('toggles back off on a second click', async () => {
    const onchange = vi.fn()
    const { container } = render(Switch, { label: 'Notifications', checked: true, onchange })
    const sw = container.querySelector<HTMLButtonElement>('[role="switch"]')!
    await fireEvent.click(sw)
    expect(onchange).toHaveBeenCalledWith(false)
    expect(sw).toHaveAttribute('aria-checked', 'false')
  })

  it('toggles on Space (native button activation)', async () => {
    const onchange = vi.fn()
    const { container } = render(Switch, { label: 'Notifications', onchange })
    const sw = container.querySelector<HTMLButtonElement>('[role="switch"]')!
    // jsdom does not synthesize a click from keydown, so fire the click that a
    // real browser dispatches when Space is released on a focused button.
    await fireEvent.keyDown(sw, { key: ' ' })
    await fireEvent.click(sw)
    expect(onchange).toHaveBeenCalledWith(true)
    expect(sw).toHaveAttribute('aria-checked', 'true')
  })

  it('toggles on Enter (native button activation)', async () => {
    const onchange = vi.fn()
    const { container } = render(Switch, { label: 'Notifications', onchange })
    const sw = container.querySelector<HTMLButtonElement>('[role="switch"]')!
    await fireEvent.keyDown(sw, { key: 'Enter' })
    await fireEvent.click(sw)
    expect(onchange).toHaveBeenCalledWith(true)
    expect(sw).toHaveAttribute('aria-checked', 'true')
  })

  it('does not toggle when disabled (no onchange, state unchanged)', async () => {
    const onchange = vi.fn()
    const { container } = render(Switch, { label: 'Notifications', disabled: true, onchange })
    const sw = container.querySelector<HTMLButtonElement>('[role="switch"]')!
    expect(sw).toBeDisabled()
    await fireEvent.click(sw)
    expect(onchange).not.toHaveBeenCalled()
    expect(sw).toHaveAttribute('aria-checked', 'false')
  })

  it('renders the label and uses it as the accessible name', () => {
    const { container, getByText } = render(Switch, { label: 'Dark mode' })
    const sw = container.querySelector('[role="switch"]')!
    const labelEl = getByText('Dark mode')
    expect(sw).toHaveAttribute('aria-labelledby', labelEl.id)
    expect(labelEl.id).toBeTruthy()
  })

  it('toggles when the label is clicked', async () => {
    const onchange = vi.fn()
    const { container, getByText } = render(Switch, { label: 'Dark mode', onchange })
    await fireEvent.click(getByText('Dark mode'))
    expect(onchange).toHaveBeenCalledWith(true)
    expect(container.querySelector('[role="switch"]')).toHaveAttribute('aria-checked', 'true')
  })

  it('writes data-size-variant when an explicit size is given', () => {
    const { container } = render(Switch, { label: 'X', size: 'lg' })
    expect(container.querySelector('.ss-switch')).toHaveAttribute('data-size-variant', 'lg')
  })

  it('has no axe violations when off', async () => {
    const { container } = render(Switch, { label: 'Notifications' })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })

  it('has no axe violations when on', async () => {
    const { container } = render(Switch, { label: 'Notifications', checked: true })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })

  it('has no axe violations when disabled', async () => {
    const { container } = render(Switch, { label: 'Notifications', disabled: true })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })
})
