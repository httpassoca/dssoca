/**
 * Modal core (DS-0197) — when the dialog closes and why, shared by Modal.svelte and
 * `vanilla/modal.ts`. The element is a native `<dialog>`: the browser owns the focus trap, the
 * focus return to the opener and the Escape key (it fires `cancel`, then closes). The adapters
 * own `showModal()` / `close()` and the scroll lock; this module only decides. No DOM, no Svelte.
 */

/**
 * Why the modal closed; passed to `onclose` / `ss:close`.
 * `programmatic` = closed from code (the `open` prop, `closeModal()`, a direct `.close()` or a
 * `<form method="dialog">`).
 */
export type ModalReason = 'escape' | 'backdrop' | 'button' | 'programmatic'

export interface ModalCloseDetails {
  reason: ModalReason
}

export interface ModalState {
  open: boolean
  /** Escape closes the modal (`closeOnEsc`; vanilla: no `data-ss-no-esc`). */
  closeOnEsc: boolean
  /** A press on the backdrop closes the modal (`closeOnBackdrop`; vanilla: no `data-ss-static`). */
  closeOnBackdrop: boolean
}

export type ModalAction = { type: 'open' } | { type: 'close'; reason: ModalReason }

/** An opener was pressed (vanilla `[data-ss-modal]`). */
export function modalOpenerPress(state: ModalState): ModalAction | null {
  return state.open ? null : { type: 'open' }
}

/** The close button (or any `[data-ss-dismiss]` control) was pressed. */
export function modalDismissPress(state: ModalState): ModalAction | null {
  return state.open ? { type: 'close', reason: 'button' } : null
}

/**
 * A pointer went down on the dialog. `onBackdrop` = it landed on the `<dialog>` element itself
 * rather than the panel inside it (the adapter's hit test).
 */
export function modalBackdropPress(state: ModalState, onBackdrop: boolean): ModalAction | null {
  return state.open && onBackdrop && state.closeOnBackdrop
    ? { type: 'close', reason: 'backdrop' }
    : null
}

/** The outcome of the native `cancel` event (Escape). */
export interface ModalCancelResult {
  /** Cancel the event so the browser keeps the dialog open. */
  preventDefault: boolean
  /** The reason to remember for the close the browser performs next; `null` when it will not. */
  reason: ModalReason | null
}

/** Escape was pressed: the browser fired `cancel` and will close the dialog unless prevented. */
export function modalCancel(state: ModalState): ModalCancelResult {
  return state.closeOnEsc
    ? { preventDefault: false, reason: 'escape' }
    : { preventDefault: true, reason: null }
}

/**
 * The dialog has closed (native `close` event). `pending` is the reason recorded by the action
 * or the cancel that led here; with none, the close came from code.
 */
export function modalClosed(pending: ModalReason | null | undefined): ModalCloseDetails {
  return { reason: pending ?? 'programmatic' }
}
