/**
 * SegmentedControl (DS-0148) — radio-group selection over `.ss-segmented > .segment[role=radio]`
 * with the same roving model as SegmentedControl.svelte (Arrow/Home/End select + focus,
 * wrapping over enabled segments). Emits `ss:change` on the root with `{ value, index }`;
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
    let target: number
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        target = ((pos < 0 ? -1 : pos) + 1 + n) % n
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        target = ((pos < 0 ? 0 : pos) - 1 + n) % n
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
