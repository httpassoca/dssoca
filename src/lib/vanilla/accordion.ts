/**
 * Accordion (DS-0148) — toggles `hidden` + `inert` on the panel referenced by each header's
 * `aria-controls`, mirroring Accordion.svelte: single-open by default (opening one closes the
 * others), `data-ss-multiple` on the root allows several, Arrow/Home/End rove between headers.
 * Emits `ss:change` on the root with `{ value }` (open ids: string | string[] | undefined).
 * The behaviour itself comes from `../core/accordion.js`, shared with the Svelte component
 * (DS-0197): this file reads the state from the DOM, asks the core, and writes the result back.
 */
import { on, emit, all, byId } from './delegate.js'
import {
  accordionHeaderAttrs,
  accordionHeaderKey,
  accordionToggle,
  accordionValue,
} from '../core/accordion.js'

const HEAD = '.ss-accordion .head[aria-controls]'

/** The root's own headers (not those of a nested accordion), in DOM order. */
function heads(root: HTMLElement): HTMLElement[] {
  return all(root, '.head[aria-controls]').filter((h) => h.closest('.ss-accordion') === root)
}

const isOpen = (head: HTMLElement): boolean => head.getAttribute('aria-expanded') === 'true'
/** A section's id on the plain-HTML path is its panel id (`aria-controls`). */
const idOf = (head: HTMLElement): string => head.getAttribute('aria-controls') as string

function setOpen(head: HTMLElement, open: boolean): void {
  head.setAttribute('aria-expanded', accordionHeaderAttrs(open)['aria-expanded'])
  head.closest('.item')?.classList.toggle('open', open)
  const panel = byId(head.getAttribute('aria-controls'))
  if (!panel) return
  panel.hidden = !open
  // A closed panel keeps `display: grid` (so the collapse animates); `inert` keeps its content
  // out of the Tab order and a11y tree, matching Accordion.svelte (DS-0162).
  panel.toggleAttribute('inert', !open)
}

export function toggleAccordion(head: HTMLElement): void {
  const root = head.closest<HTMLElement>('.ss-accordion')
  if (!root) return
  const multiple = root.hasAttribute('data-ss-multiple')
  const list = heads(root)
  // The DOM is the store: read the open ids, ask the core, write the result back.
  const next = accordionToggle(
    { open: list.filter(isOpen).map(idOf), multiple },
    idOf(head),
    head.getAttribute('aria-disabled') === 'true',
  )
  if (!next) return
  for (const h of list) setOpen(h, next.includes(idOf(h)))
  // Reported in DOM order, whatever order the sections were opened in.
  const openIds = list.map(idOf).filter((id) => next.includes(id))
  emit(root, 'ss:change', { value: accordionValue(openIds, multiple) })
}

export function installAccordion(): void {
  on('click', HEAD, (head) => toggleAccordion(head))

  on('keydown', HEAD, (head, e) => {
    const root = head.closest<HTMLElement>('.ss-accordion')
    if (!root) return
    const list = heads(root)
    const result = accordionHeaderKey(list.length, list.indexOf(head), e.key)
    if (!result) return
    if (result.preventDefault) e.preventDefault()
    list[result.focus]?.focus()
  })
}
