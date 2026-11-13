/**
 * Tooltip (DS-0148) — hover/focus reveal over Tooltip.svelte's DOM:
 * `.ss-tooltip[data-placement] > .trigger + .tip[role=tooltip]`. Basic four-way placement
 * only: the pre-rendered `data-placement` is honoured as-is (no collision engine). Escape
 * hides any open tip wherever focus is (WCAG 1.4.13). While open the focusable trigger inside
 * `.trigger` (not the wrapper) carries `aria-describedby` → the tip (an id is generated when
 * the markup has none); the token is added alongside any description the trigger already has
 * (DS-0163).
 */
import { on, all } from './delegate.js'

const ROOT = '.ss-tooltip'
const FOCUSABLE =
  'a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]'
let seq = 0

/** Element currently described by each open tooltip's tip. */
const described = new WeakMap<HTMLElement, HTMLElement>()

function tipOf(root: HTMLElement): HTMLElement | null {
  return root.querySelector<HTMLElement>(':scope > .tip')
}

/** The focused trigger element, else the first focusable in `.trigger`, else its first element. */
function describedTarget(root: HTMLElement, from?: EventTarget | null): HTMLElement {
  const trigger = root.querySelector<HTMLElement>(':scope > .trigger')
  if (!trigger) return root
  if (from instanceof HTMLElement && from !== trigger && trigger.contains(from)) return from
  return (
    trigger.querySelector<HTMLElement>(FOCUSABLE) ??
    (trigger.firstElementChild as HTMLElement | null) ??
    trigger
  )
}

function ids(el: HTMLElement): string[] {
  return (el.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean)
}

function undescribe(root: HTMLElement, tipId: string): void {
  const el = described.get(root)
  described.delete(root)
  if (!el) return
  const rest = ids(el).filter((id) => id !== tipId)
  if (rest.length) el.setAttribute('aria-describedby', rest.join(' '))
  else el.removeAttribute('aria-describedby')
}

/**
 * Open `root`'s tip. `from` is the element that triggered it (the focused element on
 * focusin); `aria-describedby` goes on that element when it sits inside `.trigger`.
 */
export function showTooltip(root: HTMLElement, from?: EventTarget | null): void {
  const tip = tipOf(root)
  if (!tip) return
  if (!tip.id) tip.id = `ss-tip-${++seq}`
  tip.hidden = false
  tip.classList.add('open')
  const target = describedTarget(root, from)
  if (described.get(root) !== target) {
    undescribe(root, tip.id)
    const cur = ids(target)
    if (!cur.includes(tip.id)) target.setAttribute('aria-describedby', [...cur, tip.id].join(' '))
    described.set(root, target)
  }
}

export function hideTooltip(root: HTMLElement): void {
  const tip = tipOf(root)
  if (!tip) return
  tip.hidden = true
  tip.classList.remove('open')
  undescribe(root, tip.id)
}

export function installTooltip(): void {
  // mouseenter/leave don't bubble; mouseover/out do — filter by relatedTarget.
  on('mouseover', ROOT, (root, e) => {
    const from = e.relatedTarget as Node | null
    if (!from || !root.contains(from)) showTooltip(root)
  })
  on('mouseout', ROOT, (root, e) => {
    const to = e.relatedTarget as Node | null
    if (!to || !root.contains(to)) hideTooltip(root)
  })
  on('focusin', ROOT, (root, e) => showTooltip(root, e.target))
  on('focusout', ROOT, (root, e) => {
    const to = e.relatedTarget as Node | null
    if (!to || !root.contains(to)) hideTooltip(root)
  })
  // Document-level Escape: a tip opened by hover closes even when focus is elsewhere.
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return
    for (const tip of all(document, `${ROOT} > .tip.open`)) {
      const root = tip.parentElement
      if (root) hideTooltip(root)
    }
  })
}
