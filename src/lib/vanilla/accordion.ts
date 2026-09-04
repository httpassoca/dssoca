/**
 * Accordion (DS-0148) — toggles `hidden` on the panel referenced by each header's
 * `aria-controls`, mirroring Accordion.svelte: single-open by default (opening one closes the
 * others), `data-ss-multiple` on the root allows several, Arrow/Home/End rove between headers.
 * Emits `ss:change` on the root with `{ value }` (open ids: string | string[] | undefined).
 */
import { on, emit, wrap, all, byId } from './delegate.js'

const HEAD = '.ss-accordion .head[aria-controls]'

function setOpen(head: HTMLElement, open: boolean): void {
  head.setAttribute('aria-expanded', String(open))
  head.closest('.item')?.classList.toggle('open', open)
  const panel = byId(head.getAttribute('aria-controls'))
  if (panel) panel.hidden = !open
}

export function toggleAccordion(head: HTMLElement): void {
  if (head.getAttribute('aria-disabled') === 'true') return
  const root = head.closest<HTMLElement>('.ss-accordion')
  if (!root) return
  const multiple = root.hasAttribute('data-ss-multiple')
  const wasOpen = head.getAttribute('aria-expanded') === 'true'
  const heads = all(root, '.head[aria-controls]').filter((h) => h.closest('.ss-accordion') === root)
  if (!wasOpen && !multiple) for (const h of heads) if (h !== head) setOpen(h, false)
  setOpen(head, !wasOpen)
  const openIds = heads
    .filter((h) => h.getAttribute('aria-expanded') === 'true')
    .map((h) => h.getAttribute('aria-controls') as string)
  emit(root, 'ss:change', { value: multiple ? openIds : openIds[0] })
}

export function installAccordion(): void {
  on('click', HEAD, (head) => toggleAccordion(head))

  on('keydown', HEAD, (head, e) => {
    const root = head.closest<HTMLElement>('.ss-accordion')
    if (!root) return
    const heads = all(root, '.head[aria-controls]').filter(
      (h) => h.closest('.ss-accordion') === root,
    )
    const i = heads.indexOf(head)
    let target = -1
    if (e.key === 'ArrowDown') target = wrap(i + 1, heads.length)
    else if (e.key === 'ArrowUp') target = wrap(i - 1, heads.length)
    else if (e.key === 'Home') target = 0
    else if (e.key === 'End') target = heads.length - 1
    if (target < 0) return
    e.preventDefault()
    heads[target]?.focus()
  })
}
