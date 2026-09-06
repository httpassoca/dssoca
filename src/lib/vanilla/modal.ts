/**
 * Modal (DS-0148) — the component is a native `<dialog class="ss-modal">`, so the browser owns
 * the focus trap, inertness and Escape. Vanilla only needs openers and closers:
 *
 *   <button data-ss-modal="#confirm">Open</button>
 *   <dialog class="ss-modal" id="confirm"> … <button class="close" data-ss-dismiss>×</button>
 *
 * Backdrop pointerdown closes unless the dialog carries `data-ss-static`; Escape is blocked
 * when it carries `data-ss-no-esc` (mirrors `closeOnBackdrop` / `closeOnEsc`).
 */
import { on, byId } from './delegate.js'

export function openModal(dialog: HTMLDialogElement): void {
  if (!dialog.open) dialog.showModal()
}

export function closeModal(dialog: HTMLDialogElement): void {
  if (dialog.open) dialog.close()
}

export function installModal(): void {
  on('click', '[data-ss-modal]', (opener, e) => {
    const target = byId(opener.getAttribute('data-ss-modal'))
    if (!(target instanceof HTMLDialogElement)) return
    e.preventDefault()
    openModal(target)
  })

  on('click', 'dialog.ss-modal [data-ss-dismiss]', (btn) => {
    const dialog = btn.closest('dialog.ss-modal')
    if (dialog instanceof HTMLDialogElement) closeModal(dialog)
  })

  on('pointerdown', 'dialog.ss-modal', (dialog, e) => {
    if (e.target !== dialog || dialog.hasAttribute('data-ss-static')) return
    closeModal(dialog as HTMLDialogElement)
  })

  // `cancel` does not bubble — capture it.
  on(
    'cancel',
    'dialog.ss-modal[data-ss-no-esc]',
    (_dialog, e) => {
      e.preventDefault()
    },
    { capture: true },
  )
}
