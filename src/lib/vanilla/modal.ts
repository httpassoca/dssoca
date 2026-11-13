/**
 * Modal (DS-0148) — the component is a native `<dialog class="ss-modal">`, so the browser owns
 * the focus trap, inertness and Escape. Vanilla only needs openers and closers:
 *
 *   <button data-ss-modal="#confirm">Open</button>
 *   <dialog class="ss-modal" id="confirm"> … <button class="close" data-ss-dismiss>×</button>
 *
 * Backdrop pointerdown closes unless the dialog carries `data-ss-static`; Escape is blocked
 * when it carries `data-ss-no-esc` (mirrors `closeOnBackdrop` / `closeOnEsc`).
 *
 * While a modal is open the page behind it must not scroll (DS-0178): `lockScroll()` sets
 * `overflow: hidden` on `<html>` and `unlockScroll()` restores it. The lock is ref-counted on
 * `<html data-ss-scroll-lock>` so stacked dialogs, and the Svelte component sharing this helper
 * from a separate bundle, release it only when the last one closes.
 */
import { on, byId } from './delegate.js'

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

export function openModal(dialog: HTMLDialogElement): void {
  if (dialog.open) return
  dialog.showModal()
  if (!locked.has(dialog)) {
    locked.add(dialog)
    lockScroll()
  }
}

export function closeModal(dialog: HTMLDialogElement): void {
  if (dialog.open) dialog.close()
  release(dialog)
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

  // Native closes (Escape, `<form method="dialog">`, a direct `.close()`) release the scroll
  // lock too. `close` does not bubble — capture it.
  on(
    'close',
    'dialog.ss-modal',
    (dialog) => {
      if (dialog instanceof HTMLDialogElement) release(dialog)
    },
    { capture: true },
  )

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
