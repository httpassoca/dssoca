/**
 * Switch (DS-0148) — flips `aria-checked` + `.on` on `.ss-switch .track[role=switch]`; clicking
 * the sibling `.label` toggles too (same target as the control, like Switch.svelte). Emits
 * `ss:change` on the root with `{ checked, reason }`. The decision comes from
 * `../core/switch.js`, shared with the Svelte component (DS-0198); state is read from the DOM.
 */
import { on, emit, setAttrs } from './delegate.js'
import { switchToggle, switchTrackAttrs, type SwitchReason } from '../core/switch.js'

export function toggleSwitch(track: HTMLButtonElement, reason: SwitchReason = 'track'): void {
  const next = switchToggle({
    checked: track.getAttribute('aria-checked') === 'true',
    disabled: track.disabled,
  })
  if (next === null) return
  setAttrs(track, switchTrackAttrs(next))
  track.classList.toggle('on', next)
  emit(track.closest('.ss-switch') ?? track, 'ss:change', { checked: next, reason })
}

export function installSwitch(): void {
  on('click', '.ss-switch .track[role="switch"]', (track) =>
    toggleSwitch(track as HTMLButtonElement),
  )
  on('click', '.ss-switch .label', (label) => {
    const track = label.closest('.ss-switch')?.querySelector<HTMLButtonElement>('.track')
    if (track) toggleSwitch(track, 'label')
  })
}
