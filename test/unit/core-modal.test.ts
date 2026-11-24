import { describe, it, expect } from 'vitest'
import {
  modalBackdropPress,
  modalCancel,
  modalClosed,
  modalDismissPress,
  modalOpenerPress,
  type ModalState,
} from '$lib/core/modal'

const state = (over: Partial<ModalState> = {}): ModalState => ({
  open: true,
  closeOnEsc: true,
  closeOnBackdrop: true,
  ...over,
})

describe('core/modal — opener', () => {
  it('opens a closed modal', () => {
    expect(modalOpenerPress(state({ open: false }))).toEqual({ type: 'open' })
  })

  it('does nothing when it is already open', () => {
    expect(modalOpenerPress(state())).toBeNull()
  })
})

describe('core/modal — close button', () => {
  it('closes with reason "button"', () => {
    expect(modalDismissPress(state())).toEqual({ type: 'close', reason: 'button' })
  })

  it('closes even when Escape and the backdrop are disabled', () => {
    expect(modalDismissPress(state({ closeOnEsc: false, closeOnBackdrop: false }))).toEqual({
      type: 'close',
      reason: 'button',
    })
  })

  it('does nothing when the modal is closed', () => {
    expect(modalDismissPress(state({ open: false }))).toBeNull()
  })
})

describe('core/modal — backdrop press', () => {
  it('closes with reason "backdrop" when the press landed on the backdrop', () => {
    expect(modalBackdropPress(state(), true)).toEqual({ type: 'close', reason: 'backdrop' })
  })

  it('ignores a press inside the panel', () => {
    expect(modalBackdropPress(state(), false)).toBeNull()
  })

  it('ignores the backdrop when closeOnBackdrop is off', () => {
    expect(modalBackdropPress(state({ closeOnBackdrop: false }), true)).toBeNull()
  })

  it('does nothing when the modal is closed', () => {
    expect(modalBackdropPress(state({ open: false }), true)).toBeNull()
  })
})

describe('core/modal — Escape (native cancel)', () => {
  it('lets the browser close and records "escape"', () => {
    expect(modalCancel(state())).toEqual({ preventDefault: false, reason: 'escape' })
  })

  it('cancels the event and records nothing when closeOnEsc is off', () => {
    expect(modalCancel(state({ closeOnEsc: false }))).toEqual({
      preventDefault: true,
      reason: null,
    })
  })
})

describe('core/modal — closed', () => {
  it.each(['escape', 'backdrop', 'button', 'programmatic'] as const)(
    'reports the pending reason %s',
    (reason) => {
      expect(modalClosed(reason)).toEqual({ reason })
    },
  )

  it('falls back to "programmatic" when nothing led to the close', () => {
    expect(modalClosed(null)).toEqual({ reason: 'programmatic' })
    expect(modalClosed(undefined)).toEqual({ reason: 'programmatic' })
  })
})
