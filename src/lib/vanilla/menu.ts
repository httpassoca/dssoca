/**
 * Menu (DS-0148) — Menu.svelte's open/close + roving-focus model over the exact same DOM:
 * `.ss-menu > .trigger[aria-expanded][aria-controls]` and `.panel[role=menu] > .item`.
 * The behaviour itself comes from `../core/menu.js`, shared with the Svelte component
 * (DS-0198): this file reads the state from the DOM, asks the core, and writes the result back.
 * Outside pointerdown closes without returning focus; Escape / item activation return focus
 * to the trigger. Emits on the root: `ss:select` with `{ index, value }` (`value` is the
 * item's `data-value`, when authored) and `ss:openchange` with `{ open, reason }`. For
 * `menuitemradio` items the check marker moves to the activated item. A panel with neither
 * `aria-label` nor `aria-labelledby` gets `aria-labelledby` pointing at its trigger on first
 * open (an id is minted if needed).
 */
import { on, emit, all, setAttrs } from './delegate.js'
import { iconSvg } from './icons.js'
import {
  menuClose,
  menuItemPress,
  menuOpen,
  menuOutsidePress,
  menuPanelAttrs,
  menuPanelKey,
  menuTriggerAttrs,
  menuTriggerKey,
  menuTriggerPress,
  type MenuAction,
  type MenuKeyResult,
  type MenuState,
} from '../core/menu.js'

const TRIGGER = '.ss-menu > .trigger'
const PANEL = '.ss-menu > .panel[role="menu"]'

interface Parts {
  root: HTMLElement
  trigger: HTMLButtonElement
  panel: HTMLElement
}

function parts(el: Element): Parts | null {
  const root = el.closest<HTMLElement>('.ss-menu')
  const trigger = root?.querySelector<HTMLButtonElement>(':scope > .trigger')
  const panel = root?.querySelector<HTMLElement>(':scope > .panel')
  return root && trigger && panel ? { root, trigger, panel } : null
}

function items(panel: HTMLElement): HTMLButtonElement[] {
  return all<HTMLButtonElement>(panel, '.item').filter((i) => i.closest('.panel') === panel)
}

/** The menu's state, read from the DOM (the DOM is the store on the plain-HTML path). */
function read({ trigger, panel }: Parts): MenuState {
  const list = items(panel)
  return {
    open: trigger.getAttribute('aria-expanded') === 'true',
    active: list.indexOf(document.activeElement as HTMLButtonElement),
    enabled: list
      .map((i, index) => (i.disabled || i.getAttribute('aria-disabled') === 'true' ? -1 : index))
      .filter((index) => index >= 0),
  }
}

function focusItem(panel: HTMLElement, index: number): void {
  const list = items(panel)
  const item = list[index]
  if (!item) return
  for (const i of list) i.tabIndex = i === item ? 0 : -1
  item.focus()
}

let autoId = 0

/** An unnamed `role="menu"` panel is named by its trigger (mirrors Menu.svelte's fallback). */
function ensureName(trigger: HTMLElement, panel: HTMLElement): void {
  if (panel.hasAttribute('aria-label') || panel.hasAttribute('aria-labelledby')) return
  if (!trigger.id) trigger.id = `ss-menu-trigger-${++autoId}`
  panel.setAttribute('aria-labelledby', trigger.id)
}

/** Apply a core action to the DOM. */
function run(p: Parts, action: MenuAction | null): void {
  if (!action) return
  const { root, trigger, panel } = p
  switch (action.type) {
    case 'open':
      ensureName(trigger, panel)
      setAttrs(trigger, menuTriggerAttrs(true))
      setAttrs(panel, menuPanelAttrs(true))
      panel.classList.add('open')
      emit(root, 'ss:openchange', { open: true, reason: action.reason })
      queueMicrotask(() => focusItem(panel, action.focus))
      break
    case 'close':
      setAttrs(trigger, menuTriggerAttrs(false))
      setAttrs(panel, menuPanelAttrs(false))
      panel.classList.remove('open')
      for (const i of items(panel)) i.tabIndex = -1
      emit(root, 'ss:openchange', { open: false, reason: action.reason })
      if (action.returnFocus) trigger.focus()
      break
    case 'focus':
      focusItem(panel, action.index)
      break
  }
}

function onKey(p: Parts, result: MenuKeyResult | null, e: KeyboardEvent): void {
  if (!result) return
  if (result.preventDefault) e.preventDefault()
  run(p, result.action)
}

export function openMenu(trigger: HTMLElement, focus: 'first' | 'last' = 'first'): void {
  const p = parts(trigger)
  if (p) run(p, menuOpen(read(p), focus))
}

export function closeMenu(trigger: HTMLElement, returnFocus = true): void {
  const p = parts(trigger)
  if (p) run(p, menuClose(read(p), returnFocus))
}

function activate(item: HTMLButtonElement): void {
  const p = parts(item)
  if (!p) return
  const list = items(p.panel)
  const index = list.indexOf(item)
  const result = menuItemPress(read(p), index)
  if (!result) return
  if (item.getAttribute('role') === 'menuitemradio') {
    for (const i of list) {
      const on = i === item
      i.classList.toggle('selected', on)
      i.setAttribute('aria-checked', String(on))
      const marker = i.querySelector('.marker')
      if (marker) marker.innerHTML = on ? iconSvg('check') : ''
    }
  }
  emit(p.root, 'ss:select', { index, value: item.dataset.value })
  run(p, result.action)
}

export function installMenu(): void {
  on('click', TRIGGER, (trigger) => {
    const p = parts(trigger)
    if (p) run(p, menuTriggerPress(read(p)))
  })

  on('keydown', TRIGGER, (trigger, e) => {
    const p = parts(trigger)
    if (p) onKey(p, menuTriggerKey(read(p), e.key), e)
  })

  on('keydown', PANEL, (panel, e) => {
    const p = parts(panel)
    if (p) onKey(p, menuPanelKey(read(p), e.key), e)
  })

  on('click', `${PANEL} .item`, (item) => activate(item as HTMLButtonElement))

  document.addEventListener(
    'pointerdown',
    (e) => {
      const t = e.target as Node | null
      for (const trigger of all(document, `${TRIGGER}[aria-expanded="true"]`)) {
        const p = parts(trigger)
        if (!p || (t && p.root.contains(t))) continue
        run(p, menuOutsidePress(read(p)))
      }
    },
    true,
  )
}
