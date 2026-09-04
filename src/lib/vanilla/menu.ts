/**
 * Menu (DS-0148) — port of Menu.svelte's open/close + roving-focus model over the exact same
 * DOM: `.ss-menu > .trigger[aria-expanded][aria-controls]` and `.panel[role=menu] > .item`.
 * Outside pointerdown closes without returning focus; Escape / item activation return focus
 * to the trigger. Emits `ss:select` on the root with `{ index, value }` (`value` is the
 * item's `data-value`, when authored). For `menuitemradio` items the check marker moves to
 * the activated item.
 */
import { on, emit, all } from './delegate.js'
import { iconSvg } from './icons.js'

const TRIGGER = '.ss-menu > .trigger'
const PANEL = '.ss-menu > .panel[role="menu"]'

function parts(el: Element) {
  const root = el.closest<HTMLElement>('.ss-menu')
  const trigger = root?.querySelector<HTMLButtonElement>(':scope > .trigger') ?? null
  const panel = root?.querySelector<HTMLElement>(':scope > .panel') ?? null
  return { root, trigger, panel }
}

function items(panel: HTMLElement): HTMLButtonElement[] {
  return all<HTMLButtonElement>(panel, '.item').filter((i) => i.closest('.panel') === panel)
}

function enabled(panel: HTMLElement): HTMLButtonElement[] {
  return items(panel).filter((i) => !i.disabled && i.getAttribute('aria-disabled') !== 'true')
}

function focusItem(panel: HTMLElement, item: HTMLButtonElement | undefined): void {
  if (!item) return
  for (const i of items(panel)) i.tabIndex = i === item ? 0 : -1
  item.focus()
}

export function openMenu(trigger: HTMLElement, focus: 'first' | 'last' = 'first'): void {
  const { panel } = parts(trigger)
  if (!panel || trigger.getAttribute('aria-expanded') === 'true') return
  trigger.setAttribute('aria-expanded', 'true')
  panel.classList.add('open')
  panel.setAttribute('aria-hidden', 'false')
  queueMicrotask(() => {
    const list = enabled(panel)
    focusItem(panel, focus === 'first' ? list[0] : list[list.length - 1])
  })
}

export function closeMenu(trigger: HTMLElement, returnFocus = true): void {
  const { panel } = parts(trigger)
  if (!panel || trigger.getAttribute('aria-expanded') !== 'true') return
  trigger.setAttribute('aria-expanded', 'false')
  panel.classList.remove('open')
  panel.setAttribute('aria-hidden', 'true')
  for (const i of items(panel)) i.tabIndex = -1
  if (returnFocus) trigger.focus()
}

function activate(item: HTMLButtonElement): void {
  const { root, trigger, panel } = parts(item)
  if (!root || !trigger || !panel || item.disabled) return
  if (item.getAttribute('role') === 'menuitemradio') {
    for (const i of items(panel)) {
      const on = i === item
      i.classList.toggle('selected', on)
      i.setAttribute('aria-checked', String(on))
      const marker = i.querySelector('.marker')
      if (marker) marker.innerHTML = on ? iconSvg('check') : ''
    }
  }
  emit(root, 'ss:select', { index: items(panel).indexOf(item), value: item.dataset.value })
  closeMenu(trigger)
}

export function installMenu(): void {
  on('click', TRIGGER, (trigger) => {
    if (trigger.getAttribute('aria-expanded') === 'true') closeMenu(trigger)
    else openMenu(trigger, 'first')
  })

  on('keydown', TRIGGER, (trigger, e) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openMenu(trigger, 'first')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      openMenu(trigger, 'last')
    }
  })

  on('keydown', PANEL, (panel, e) => {
    const { trigger } = parts(panel)
    if (!trigger) return
    const list = enabled(panel)
    const active = list.findIndex((i) => i === document.activeElement)
    const pick = (i: number) =>
      focusItem(panel, list[((i % list.length) + list.length) % list.length])
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        pick(active < 0 ? 0 : active + 1)
        break
      case 'ArrowUp':
        e.preventDefault()
        pick(active < 0 ? list.length - 1 : active - 1)
        break
      case 'Home':
        e.preventDefault()
        pick(0)
        break
      case 'End':
        e.preventDefault()
        pick(list.length - 1)
        break
      case 'Escape':
        e.preventDefault()
        closeMenu(trigger)
        break
      case 'Tab':
        closeMenu(trigger, false)
        break
    }
  })

  on('click', `${PANEL} .item`, (item) => activate(item as HTMLButtonElement))

  document.addEventListener(
    'pointerdown',
    (e) => {
      const t = e.target as Node | null
      for (const trigger of all(document, `${TRIGGER}[aria-expanded="true"]`)) {
        const root = trigger.closest('.ss-menu')
        if (root && t && root.contains(t)) continue
        closeMenu(trigger, false)
      }
    },
    true,
  )
}
