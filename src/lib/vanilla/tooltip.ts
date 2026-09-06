/**
 * Tooltip (DS-0148) — hover/focus reveal over Tooltip.svelte's DOM:
 * `.ss-tooltip[data-placement] > .trigger + .tip[role=tooltip]`. Basic four-way placement
 * only: the pre-rendered `data-placement` is honoured as-is (no collision engine). Escape
 * hides. While open the wrapper carries `aria-describedby` → the tip (an id is generated when
 * the markup has none).
 */
import { on } from './delegate.js'

const ROOT = '.ss-tooltip'
let seq = 0

function tipOf(root: HTMLElement): HTMLElement | null {
  return root.querySelector<HTMLElement>(':scope > .tip')
}

export function showTooltip(root: HTMLElement): void {
  const tip = tipOf(root)
  if (!tip) return
  if (!tip.id) tip.id = `ss-tip-${++seq}`
  tip.hidden = false
  tip.classList.add('open')
  root.setAttribute('aria-describedby', tip.id)
}

export function hideTooltip(root: HTMLElement): void {
  const tip = tipOf(root)
  if (!tip) return
  tip.hidden = true
  tip.classList.remove('open')
  root.removeAttribute('aria-describedby')
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
  on('focusin', ROOT, (root) => showTooltip(root))
  on('focusout', ROOT, (root, e) => {
    const to = e.relatedTarget as Node | null
    if (!to || !root.contains(to)) hideTooltip(root)
  })
  on('keydown', ROOT, (root, e) => {
    if (e.key === 'Escape') hideTooltip(root)
  })
}
