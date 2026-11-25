/**
 * Popover (DS-0197) — Popover.svelte's non-modal panel over the exact same DOM:
 * `.ss-popover > .trigger[aria-expanded][aria-controls]` and `.panel[role=dialog]`. The
 * behaviour itself comes from `../core/popover.js`, shared with the Svelte component: this file
 * reads the state from the DOM, asks the core, and writes the result back. Opening moves focus
 * into the panel (its first focusable element, else the panel); Escape closes and returns focus
 * to the trigger; an outside pointerdown or tabbing out closes without pulling focus back. A
 * closed panel is `inert`. Emits `ss:openchange` on the root with `{ open, reason }`. A panel
 * with neither `aria-label` nor `aria-labelledby` gets `aria-labelledby` pointing at its
 * trigger on first open (an id is minted if needed).
 */
import { on, emit, all, setAttrs } from './delegate.js'
import { FOCUSABLE_SELECTOR } from '../core/behaviors/focusable.js'
import {
  popoverClose,
  popoverFocusOut,
  popoverKey,
  popoverOpen,
  popoverOutsidePress,
  popoverPanelAttrs,
  popoverTriggerAttrs,
  popoverTriggerPress,
  type PopoverAction,
  type PopoverState,
} from '../core/popover.js'

const TRIGGER = '.ss-popover > .trigger'
const OPEN_TRIGGER = `${TRIGGER}[aria-expanded="true"]`

interface Parts {
  root: HTMLElement
  trigger: HTMLButtonElement
  panel: HTMLElement
}

function parts(el: Element): Parts | null {
  const root = el.closest<HTMLElement>('.ss-popover')
  const trigger = root?.querySelector<HTMLButtonElement>(':scope > .trigger')
  const panel = root?.querySelector<HTMLElement>(':scope > .panel')
  return root && trigger && panel ? { root, trigger, panel } : null
}

/** The popover's state, read from the DOM (the DOM is the store on the plain-HTML path). */
function read({ trigger }: Parts): PopoverState {
  return { open: trigger.getAttribute('aria-expanded') === 'true' }
}

let autoId = 0

/** An unnamed `role="dialog"` panel is named by its trigger (mirrors Popover.svelte's fallback). */
function ensureName(trigger: HTMLElement, panel: HTMLElement): void {
  if (panel.hasAttribute('aria-label') || panel.hasAttribute('aria-labelledby')) return
  if (!trigger.id) trigger.id = `ss-popover-trigger-${++autoId}`
  panel.setAttribute('aria-labelledby', trigger.id)
}

/**
 * Move focus into an opened panel: its first focusable element, else the panel itself. Shared
 * with Popover.svelte. Focus lands on the panel first and is then handed to the target, retried
 * over a few frames: a child with its own `visibility` transition (`transition: all`, as on
 * `.ss-btn`) still computes as hidden — so refuses focus — until that transition has started.
 */
export function focusPopoverPanel(panel: HTMLElement): void {
  const target = panel.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
  panel.focus()
  if (!target) return
  let tries = 5
  const attempt = (): void => {
    // Focus was moved on (or the popover closed) meanwhile: leave it where it is.
    if (document.activeElement !== panel) return
    target.focus()
    if (document.activeElement !== target && tries-- > 0) requestAnimationFrame(attempt)
  }
  attempt()
}

/** Apply a core action to the DOM. */
function run(p: Parts, action: PopoverAction | null): void {
  if (!action) return
  const { root, trigger, panel } = p
  const open = action.type === 'open'
  if (open) ensureName(trigger, panel)
  setAttrs(trigger, popoverTriggerAttrs(open))
  setAttrs(panel, popoverPanelAttrs())
  panel.toggleAttribute('inert', !open)
  panel.classList.toggle('open', open)
  emit(root, 'ss:openchange', { open, reason: action.reason })
  if (action.type === 'open') {
    queueMicrotask(() => focusPopoverPanel(panel))
  } else if (action.returnFocus) {
    trigger.focus()
  }
}

export function openPopover(trigger: HTMLElement): void {
  const p = parts(trigger)
  if (p) run(p, popoverOpen(read(p)))
}

export function closePopover(trigger: HTMLElement, returnFocus = true): void {
  const p = parts(trigger)
  if (p) run(p, popoverClose(read(p), returnFocus))
}

/** Every open popover, as parts. */
function openPopovers(): Parts[] {
  return all(document, OPEN_TRIGGER)
    .map((t) => parts(t))
    .filter((p): p is Parts => p !== null)
}

export function installPopover(): void {
  on('click', TRIGGER, (trigger) => {
    const p = parts(trigger)
    if (p) run(p, popoverTriggerPress(read(p)))
  })

  on('keydown', '.ss-popover', (root, e) => {
    // Something inside (a nested menu, say) already used this key.
    if (e.defaultPrevented) return
    const p = parts(root)
    const result = p && popoverKey(read(p), e.key)
    if (!p || !result) return
    if (result.preventDefault) e.preventDefault()
    run(p, result.action)
  })

  document.addEventListener('focusout', (e) => {
    const from = e.target as Node | null
    const to = e.relatedTarget as Node | null
    for (const p of openPopovers()) {
      if (!from || !p.root.contains(from)) continue
      run(p, popoverFocusOut(read(p), !to ? 'nowhere' : p.root.contains(to) ? 'inside' : 'outside'))
    }
  })

  document.addEventListener(
    'pointerdown',
    (e) => {
      const t = e.target as Node | null
      for (const p of openPopovers()) {
        if (t && p.root.contains(t)) continue
        run(p, popoverOutsidePress(read(p)))
      }
    },
    true,
  )
}
