/**
 * Tooltip (DS-0148) — hover/focus reveal over Tooltip.svelte's DOM:
 * `.ss-tooltip[data-placement] > .trigger + .tip[role=tooltip]`. Basic four-way placement
 * only: the pre-rendered `data-placement` is honoured as-is (no collision engine). Escape
 * hides any open tip wherever focus is (WCAG 1.4.13). While open the focusable trigger inside
 * `.trigger` (not the wrapper) carries `aria-describedby` → the tip (an id is generated when
 * the markup has none); the token is added alongside any description the trigger already has
 * (DS-0163). Which event shows or hides a tip is decided in `core/tooltip.ts`, the same
 * functions Tooltip.svelte calls.
 */
import { on, all } from './delegate.js'
import {
  tooltipDescribedBy,
  tooltipFocusIn,
  tooltipFocusOut,
  tooltipKey,
  tooltipPointerEnter,
  tooltipPointerLeave,
  type TooltipAction,
  type TooltipState,
} from '../core/tooltip.js'

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

function setDescribedBy(el: HTMLElement, tipId: string, open: boolean): void {
  const value = tooltipDescribedBy(el.getAttribute('aria-describedby'), tipId, open)
  if (value === undefined) el.removeAttribute('aria-describedby')
  else el.setAttribute('aria-describedby', value)
}

/** The core's state, read from the DOM. */
function stateOf(root: HTMLElement): TooltipState {
  return { open: Boolean(tipOf(root)?.classList.contains('open')) }
}

/** The other end of a pointer or focus move is still inside `root`. */
function within(root: HTMLElement, node: EventTarget | null): boolean {
  return node instanceof Node && root.contains(node)
}

/** Apply a core action to the DOM. */
function run(root: HTMLElement, action: TooltipAction | null, from?: EventTarget | null): void {
  if (!action) return
  if (action.type === 'show') showTooltip(root, from)
  else hideTooltip(root)
}

function undescribe(root: HTMLElement, tipId: string): void {
  const el = described.get(root)
  described.delete(root)
  if (!el) return
  setDescribedBy(el, tipId, false)
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
    setDescribedBy(target, tip.id, true)
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
    run(root, tooltipPointerEnter(stateOf(root), { within: within(root, e.relatedTarget) }))
  })
  on('mouseout', ROOT, (root, e) => {
    run(root, tooltipPointerLeave(stateOf(root), { within: within(root, e.relatedTarget) }))
  })
  on('focusin', ROOT, (root, e) => run(root, tooltipFocusIn(stateOf(root)), e.target))
  on('focusout', ROOT, (root, e) => {
    run(root, tooltipFocusOut(stateOf(root), { within: within(root, e.relatedTarget) }))
  })
  // Document-level Escape: a tip opened by hover closes even when focus is elsewhere.
  document.addEventListener('keydown', (e) => {
    // Cheap exit for every key that could not dismiss a tip, before touching the DOM.
    if (!tooltipKey({ open: true }, e.key)) return
    for (const tip of all(document, `${ROOT} > .tip.open`)) {
      const root = tip.parentElement
      if (root) run(root, tooltipKey(stateOf(root), e.key))
    }
  })
}
