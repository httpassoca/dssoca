/**
 * Modal (DS-0148) — the component is a native `<dialog class="ss-modal">`, so the browser owns
 * the focus trap, inertness and Escape. Vanilla only needs openers and closers:
 *
 *   <button data-ss-modal="#confirm">Open</button>
 *   <dialog class="ss-modal" id="confirm"> … <button class="close" data-ss-dismiss>×</button>
 *
 * A backdrop click closes unless the dialog carries `data-ss-static`; Escape is blocked
 * when it carries `data-ss-no-esc` (mirrors `closeOnBackdrop` / `closeOnEsc`). Those decisions
 * come from `core/modal.ts`, the same functions Modal.svelte calls. Every close emits `ss:close`
 * on the dialog with `{ reason }` (escape · backdrop · button · programmatic).
 *
 * While a modal is open the page behind it must not scroll (DS-0178): `lockScroll()` sets
 * `overflow: hidden` on `<html>` and `unlockScroll()` restores it. The lock is ref-counted on
 * `<html data-ss-scroll-lock>` so stacked dialogs, and the Svelte component sharing this helper
 * from a separate bundle, release it only when the last one closes.
 */
import { on, byId, emit } from './delegate.js'
import {
  modalBackdropPress,
  modalCancel,
  modalClosed,
  modalDismissPress,
  modalOpenerPress,
  type ModalAction,
  type ModalReason,
  type ModalState,
} from '../core/modal.js'

const COUNT = 'ssScrollLock'
const PREV = 'ssScrollLockPrev'

/** Lock page scrolling on `<html>` (ref-counted). Pair every call with `unlockScroll()`. */
export function lockScroll(): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const n = Number(root.dataset[COUNT] ?? 0) || 0
  if (n === 0) {
    root.dataset[PREV] = root.style.overflow
    root.style.overflow = 'hidden'
  }
  root.dataset[COUNT] = String(n + 1)
}

/** Release one `lockScroll()`; the last release restores `<html>`'s previous `overflow`. */
export function unlockScroll(): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const n = Number(root.dataset[COUNT] ?? 0) || 0
  if (n <= 0) return
  if (n > 1) {
    root.dataset[COUNT] = String(n - 1)
    return
  }
  root.style.overflow = root.dataset[PREV] ?? ''
  delete root.dataset[COUNT]
  delete root.dataset[PREV]
}

// Dialogs that currently hold a scroll lock (so a lock is taken and released exactly once).
const locked = new WeakSet<HTMLDialogElement>()

function release(dialog: HTMLDialogElement): void {
  if (!locked.has(dialog)) return
  locked.delete(dialog)
  unlockScroll()
}

// Why a dialog is about to close, kept from the action (or the cancel) until its native `close`.
const pending = new WeakMap<HTMLDialogElement, ModalReason>()

/** The core's state, read from the DOM. */
function stateOf(dialog: HTMLDialogElement): ModalState {
  return {
    open: dialog.open,
    closeOnEsc: !dialog.hasAttribute('data-ss-no-esc'),
    closeOnBackdrop: !dialog.hasAttribute('data-ss-static'),
  }
}

export function openModal(dialog: HTMLDialogElement): void {
  if (dialog.open) return
  pending.delete(dialog)
  dialog.showModal()
  if (!locked.has(dialog)) {
    locked.add(dialog)
    lockScroll()
  }
}

/** Close `dialog`; `reason` is reported on its `ss:close` event. */
export function closeModal(dialog: HTMLDialogElement, reason: ModalReason = 'programmatic'): void {
  if (dialog.open) {
    pending.set(dialog, reason)
    dialog.close()
  }
  release(dialog)
}

/** Apply a core action to the DOM. */
function run(dialog: HTMLDialogElement, action: ModalAction | null): void {
  if (!action) return
  if (action.type === 'open') openModal(dialog)
  else closeModal(dialog, action.reason)
}

export function installModal(): void {
  on('click', '[data-ss-modal]', (opener, e) => {
    const target = byId(opener.getAttribute('data-ss-modal'))
    if (!(target instanceof HTMLDialogElement)) return
    e.preventDefault()
    run(target, modalOpenerPress(stateOf(target)))
  })

  on('click', 'dialog.ss-modal [data-ss-dismiss]', (btn) => {
    const dialog = btn.closest('dialog.ss-modal')
    if (dialog instanceof HTMLDialogElement) run(dialog, modalDismissPress(stateOf(dialog)))
  })

  // A press that starts on the dialog itself is a backdrop hit; the dialog closes on the click
  // that follows. Closing on the pointerdown would return focus to the opener and then let the
  // same gesture's mousedown blur it, dropping focus on <body>. Remembering where the press
  // began keeps a drag from inside the panel to the backdrop from closing.
  let pressed: Element | null = null
  document.addEventListener('pointerdown', (e) => {
    const t = e.target
    pressed = t instanceof HTMLDialogElement && t.matches('dialog.ss-modal') ? t : null
  })
  on('click', 'dialog.ss-modal', (dialog, e) => {
    const hit = pressed === dialog && e.target === dialog
    pressed = null
    if (!(dialog instanceof HTMLDialogElement)) return
    run(dialog, modalBackdropPress(stateOf(dialog), hit))
  })

  // Native closes (Escape, `<form method="dialog">`, a direct `.close()`) release the scroll
  // lock too. `close` does not bubble — capture it.
  on(
    'close',
    'dialog.ss-modal',
    (dialog) => {
      if (!(dialog instanceof HTMLDialogElement)) return
      const details = modalClosed(pending.get(dialog))
      pending.delete(dialog)
      release(dialog)
      emit(dialog, 'ss:close', details)
    },
    { capture: true },
  )

  // Escape fires `cancel` before the browser closes the dialog. `cancel` does not bubble —
  // capture it.
  on(
    'cancel',
    'dialog.ss-modal',
    (dialog, e) => {
      if (!(dialog instanceof HTMLDialogElement)) return
      const result = modalCancel(stateOf(dialog), e.cancelable)
      if (result.preventDefault) e.preventDefault()
      if (result.reason) pending.set(dialog, result.reason)
      else pending.delete(dialog)
    },
    { capture: true },
  )
}
