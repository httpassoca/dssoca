/**
 * SegmentedControl (DS-0148) — radio-group selection over `.ss-segmented > .segment[role=radio]`
 * with the same roving model as SegmentedControl.svelte (Arrow/Home/End select + focus,
 * wrapping over enabled segments; Left/Right mirror under RTL). The behaviour itself comes from
 * `../core/segmented.js`, shared with the Svelte component (DS-0197): this file reads the state
 * from the DOM, asks the core, and writes the result back. Emits `ss:change` on the root with
 * `{ value, index, reason }`; `value` is the segment's `data-value` (vanilla-only attribute) or
 * its label text, `reason` is `'press'` or `'key'`.
 */
import { on, emit, all, setAttrs } from './delegate.js'
import {
  segmentedItemAttrs,
  segmentedKey,
  segmentedPress,
  segmentedTabStop,
  type SegmentedAction,
  type SegmentedState,
} from '../core/segmented.js'

const SEGMENT = '.ss-segmented .segment[role="radio"]'

function segments(root: HTMLElement): HTMLButtonElement[] {
  return all<HTMLButtonElement>(root, '.segment[role="radio"]').filter(
    (s) => s.closest('.ss-segmented') === root,
  )
}

/** The group's state, read from the DOM (the DOM is the store on the plain-HTML path). */
function read(root: HTMLElement, list: HTMLButtonElement[]): SegmentedState {
  const groupDisabled = root.getAttribute('aria-disabled') === 'true'
  return {
    selected: list.findIndex((s) => s.getAttribute('aria-checked') === 'true'),
    enabled: groupDisabled
      ? []
      : list.map((s, index) => (s.disabled ? -1 : index)).filter((index) => index >= 0),
  }
}

/** Apply a core action to the DOM. */
function run(root: HTMLElement, list: HTMLButtonElement[], action: SegmentedAction | null): void {
  if (!action) return
  const segment = list[action.index]
  if (!segment) return
  const tabStop = segmentedTabStop({ ...read(root, list), selected: action.index })
  list.forEach((s, index) => {
    s.classList.toggle('selected', index === action.index)
    setAttrs(s, segmentedItemAttrs(index, action.index, tabStop))
  })
  if (action.changed) {
    const value =
      segment.dataset.value ?? segment.querySelector('.label')?.textContent?.trim() ?? ''
    emit(root, 'ss:change', { value, index: action.index, reason: action.reason })
  }
  if (action.focus) segment.focus()
}

export function selectSegment(segment: HTMLButtonElement): void {
  const root = segment.closest<HTMLElement>('.ss-segmented')
  if (!root) return
  const list = segments(root)
  run(root, list, segmentedPress(read(root, list), list.indexOf(segment)))
}

export function installSegmented(): void {
  on('click', SEGMENT, (s) => selectSegment(s as HTMLButtonElement))

  on('keydown', SEGMENT, (segment, e) => {
    const root = segment.closest<HTMLElement>('.ss-segmented')
    if (!root) return
    const list = segments(root)
    // RTL: the row runs right-to-left, so ArrowLeft points at the NEXT segment. Read the
    // inherited computed direction at keydown time and hand it to the core.
    const rtl = getComputedStyle(segment).direction === 'rtl'
    const result = segmentedKey(
      read(root, list),
      list.indexOf(segment as HTMLButtonElement),
      e.key,
      rtl,
    )
    if (!result) return
    if (result.preventDefault) e.preventDefault()
    run(root, list, result.action)
  })
}
