import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { createRawSnippet } from 'svelte'
import { axe } from 'vitest-axe'
import Modal from '$lib/components/Modal.svelte'

// jsdom does not implement HTMLDialogElement.showModal()/close(). Polyfill the
// bits the component relies on: showModal() marks the dialog open, close()
// clears it and dispatches the native 'close' event (which the component
// listens to in order to sync `open` back to false + fire `onclose`).
beforeAll(() => {
  const proto = HTMLDialogElement.prototype
  if (!proto.showModal) {
    proto.showModal = function (this: HTMLDialogElement) {
      this.open = true
    }
  }
  if (!proto.close) {
    proto.close = function (this: HTMLDialogElement) {
      this.open = false
      this.dispatchEvent(new Event('close'))
    }
  }
})

const snippet = (html: string) => createRawSnippet(() => ({ render: () => html }))

const axeOpts = {
  rules: {
    region: { enabled: false },
    'landmark-one-main': { enabled: false },
    'page-has-heading-one': { enabled: false },
    'color-contrast': { enabled: false },
  },
}

const baseProps = () => ({
  open: true,
  title: 'Confirm',
  children: snippet('<p>Body copy</p>'),
})

describe('Modal — rendering', () => {
  it('renders the title, body and footer when open', () => {
    const { container, getByText } = render(Modal, {
      ...baseProps(),
      footer: snippet('<button type="button">OK</button>'),
    })
    expect(container.querySelector('dialog.ss-modal')).not.toBeNull()
    expect(getByText('Confirm')).toBeTruthy()
    expect(getByText('Body copy')).toBeTruthy()
    expect(getByText('OK')).toBeTruthy()
  })

  it('calls showModal() so the dialog reports as open', () => {
    const { container } = render(Modal, baseProps())
    const dialog = container.querySelector<HTMLDialogElement>('dialog.ss-modal')!
    expect(dialog.open).toBe(true)
  })

  it('renders the root identity on the <dialog> element', () => {
    const { container } = render(Modal, baseProps())
    expect(container.querySelector('dialog')).toHaveClass('ss-modal')
  })

  it('renders an accessible Close button', () => {
    const { getByLabelText } = render(Modal, baseProps())
    expect(getByLabelText('Close')).toBeTruthy()
  })

  it('applies the danger styling hint', () => {
    const { container } = render(Modal, { ...baseProps(), danger: true })
    expect(container.querySelector('dialog.ss-modal')).toHaveClass('danger')
  })

  it('reflects the size prop on data-size-variant (controls max-width)', () => {
    const { container } = render(Modal, { ...baseProps(), size: 'lg' })
    expect(container.querySelector('dialog.ss-modal')).toHaveAttribute('data-size-variant', 'lg')
  })
})

describe('Modal — labelling', () => {
  it('wires aria-labelledby to the title element when title is set', () => {
    const { container } = render(Modal, baseProps())
    const dialog = container.querySelector<HTMLDialogElement>('dialog.ss-modal')!
    const labelledby = dialog.getAttribute('aria-labelledby')
    expect(labelledby).toBeTruthy()
    const heading = container.querySelector(`#${labelledby}`)
    expect(heading).not.toBeNull()
    expect(heading).toHaveTextContent('Confirm')
    // With a title there is no redundant aria-label.
    expect(dialog).not.toHaveAttribute('aria-label')
  })

  it('falls back to aria-label when no title is provided', () => {
    const { container } = render(Modal, {
      open: true,
      'aria-label': 'Settings dialog',
      children: snippet('<p>x</p>'),
    })
    const dialog = container.querySelector<HTMLDialogElement>('dialog.ss-modal')!
    expect(dialog).toHaveAttribute('aria-label', 'Settings dialog')
    expect(dialog).not.toHaveAttribute('aria-labelledby')
  })
})

describe('Modal — closing', () => {
  it('Close button click sets open false and fires onclose', async () => {
    const onclose = vi.fn()
    const { container, getByLabelText } = render(Modal, { ...baseProps(), onclose })
    await fireEvent.click(getByLabelText('Close'))
    const dialog = container.querySelector<HTMLDialogElement>('dialog.ss-modal')!
    expect(dialog.open).toBe(false)
    expect(onclose).toHaveBeenCalledTimes(1)
  })

  it('clicking the dialog backdrop closes when closeOnBackdrop (default)', async () => {
    const onclose = vi.fn()
    const { container } = render(Modal, { ...baseProps(), onclose })
    const dialog = container.querySelector<HTMLDialogElement>('dialog.ss-modal')!
    // A pointerdown whose target IS the dialog (not the inner panel) = backdrop.
    await fireEvent.pointerDown(dialog)
    expect(dialog.open).toBe(false)
    expect(onclose).toHaveBeenCalledTimes(1)
  })

  it('does not close on a pointerdown that lands on the inner panel', async () => {
    const { container } = render(Modal, baseProps())
    const dialog = container.querySelector<HTMLDialogElement>('dialog.ss-modal')!
    const panel = container.querySelector('.ss-modal .panel')!
    await fireEvent.pointerDown(panel)
    expect(dialog.open).toBe(true)
  })

  it('does not close on backdrop when closeOnBackdrop is false', async () => {
    const { container } = render(Modal, { ...baseProps(), closeOnBackdrop: false })
    const dialog = container.querySelector<HTMLDialogElement>('dialog.ss-modal')!
    await fireEvent.pointerDown(dialog)
    expect(dialog.open).toBe(true)
  })

  it('preventDefault()s the cancel event when closeOnEsc is false', async () => {
    const { container } = render(Modal, { ...baseProps(), closeOnEsc: false })
    const dialog = container.querySelector<HTMLDialogElement>('dialog.ss-modal')!
    const cancel = new Event('cancel', { cancelable: true })
    dialog.dispatchEvent(cancel)
    expect(cancel.defaultPrevented).toBe(true)
  })

  it('syncs state and notifies on a native close event (Esc / programmatic)', async () => {
    const onclose = vi.fn()
    const { container } = render(Modal, { ...baseProps(), onclose })
    const dialog = container.querySelector<HTMLDialogElement>('dialog.ss-modal')!
    dialog.close()
    expect(dialog.open).toBe(false)
    expect(onclose).toHaveBeenCalledTimes(1)
  })
})

describe('Modal — bindable open', () => {
  it('opens when open flips from false to true', async () => {
    const { container, rerender } = render(Modal, {
      open: false,
      title: 'Confirm',
      children: snippet('<p>x</p>'),
    })
    const dialog = container.querySelector<HTMLDialogElement>('dialog.ss-modal')!
    expect(dialog.open).toBe(false)
    await rerender({ open: true, title: 'Confirm', children: snippet('<p>x</p>') })
    expect(dialog.open).toBe(true)
  })
})

// DS-0145: `fullscreen` fills the viewport instead of rendering a capped panel.
describe('Modal — fullscreen', () => {
  it('is off by default (no data-fullscreen)', () => {
    const { container } = render(Modal, baseProps())
    expect(container.querySelector('dialog.ss-modal')).not.toHaveAttribute('data-fullscreen')
  })

  it('marks the dialog with data-fullscreen when set', () => {
    const { container } = render(Modal, { ...baseProps(), fullscreen: true })
    expect(container.querySelector('dialog.ss-modal')).toHaveAttribute('data-fullscreen')
  })

  it('keeps the size axis on the element (CSS makes it inert, the API does not change)', () => {
    const { container } = render(Modal, { ...baseProps(), fullscreen: true, size: 'sm' })
    const dialog = container.querySelector('dialog.ss-modal')!
    expect(dialog).toHaveAttribute('data-size-variant', 'sm')
    expect(dialog).toHaveAttribute('data-fullscreen')
  })

  it('still renders the header/body/footer anatomy', () => {
    const { container, getByText, getByLabelText } = render(Modal, {
      ...baseProps(),
      fullscreen: true,
      footer: snippet('<button type="button">OK</button>'),
    })
    expect(container.querySelector('.ss-modal .panel')).not.toBeNull()
    expect(getByText('Confirm')).toBeTruthy()
    expect(getByText('Body copy')).toBeTruthy()
    expect(getByText('OK')).toBeTruthy()
    expect(getByLabelText('Close')).toBeTruthy()
  })

  it('closes via the Close button', async () => {
    const onclose = vi.fn()
    const { container, getByLabelText } = render(Modal, {
      ...baseProps(),
      fullscreen: true,
      onclose,
    })
    await fireEvent.click(getByLabelText('Close'))
    expect(container.querySelector<HTMLDialogElement>('dialog.ss-modal')!.open).toBe(false)
    expect(onclose).toHaveBeenCalledTimes(1)
  })

  it('still honours closeOnEsc=false (cancel prevented)', () => {
    const { container } = render(Modal, { ...baseProps(), fullscreen: true, closeOnEsc: false })
    const dialog = container.querySelector<HTMLDialogElement>('dialog.ss-modal')!
    const cancel = new Event('cancel', { cancelable: true })
    dialog.dispatchEvent(cancel)
    expect(cancel.defaultPrevented).toBe(true)
  })

  it('has no axe violations while open', async () => {
    const { container } = render(Modal, {
      ...baseProps(),
      fullscreen: true,
      footer: snippet('<button type="button">OK</button>'),
    })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })
})

describe('Modal — a11y', () => {
  it('has no axe violations while open', async () => {
    const { container } = render(Modal, {
      ...baseProps(),
      footer: snippet('<button type="button">OK</button>'),
    })
    expect(await axe(container, axeOpts)).toHaveNoViolations()
  })
})
