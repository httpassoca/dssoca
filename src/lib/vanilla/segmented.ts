/**
 * SegmentedControl (DS-0148) — radio-group selection over `.ss-segmented > .segment[role=radio]`
 * with the same roving model as SegmentedControl.svelte (Arrow/Home/End select + focus,
 * wrapping over enabled segments; Left/Right mirror under RTL). Emits `ss:change` on the root with `{ value, index }`;
 * `value` is the segment's `data-value` (vanilla-only attribute) or its label text.
 */
import { on, emit, all } from './delegate.js'

function segments(root: HTMLElement): HTMLButtonElement[] {
  return all<HTMLButtonElement>(root, '.segment[role="radio"]').filter(
    (s) => s.closest('.ss-segmented') === root,
  )
}

export function selectSegment(segment: HTMLButtonElement): void {
  const root = segment.closest<HTMLElement>('.ss-segmented')
  if (!root || segment.disabled || root.getAttribute('aria-disabled') === 'true') return
  const list = segments(root)
  const already = segment.getAttribute('aria-checked') === 'true'
  for (const s of list) {
    const on = s === segment
    s.classList.toggle('selected', on)
    s.setAttribute('aria-checked', String(on))
    s.tabIndex = on ? 0 : -1
  }
  if (already) return
  const value = segment.dataset.value ?? segment.querySelector('.label')?.textContent?.trim() ?? ''
  emit(root, 'ss:change', { value, index: list.indexOf(segment) })
}

export function installSegmented(): void {
  on('click', '.ss-segmented .segment[role="radio"]', (s) => selectSegment(s as HTMLButtonElement))

  on('keydown', '.ss-segmented .segment[role="radio"]', (segment, e) => {
    const root = segment.closest<HTMLElement>('.ss-segmented')
    if (!root) return
    const enabled = segments(root).filter((s) => !s.disabled)
    const pos = enabled.indexOf(segment as HTMLButtonElement)
    const n = enabled.length
    const next = ((pos < 0 ? -1 : pos) + 1 + n) % n
    const prev = ((pos < 0 ? 0 : pos) - 1 + n) % n
    // RTL: the row runs right-to-left, so ArrowLeft points at the NEXT segment.
    // Read the inherited computed direction at keydown time; Up/Down stay logical.
    const rtl = getComputedStyle(segment).direction === 'rtl'
    let target: number
    switch (e.key) {
      case 'ArrowRight':
        target = rtl ? prev : next
        break
      case 'ArrowLeft':
        target = rtl ? next : prev
        break
      case 'ArrowDown':
        target = next
        break
      case 'ArrowUp':
        target = prev
        break
      case 'Home':
        target = 0
        break
      case 'End':
        target = n - 1
        break
      default:
        return
    }
    if (n === 0) return
    e.preventDefault()
    selectSegment(enabled[target])
    enabled[target].focus()
  })
}
