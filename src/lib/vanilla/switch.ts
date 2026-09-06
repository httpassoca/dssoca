/**
 * Switch (DS-0148) — flips `aria-checked` + `.on` on `.ss-switch .track[role=switch]`; clicking
 * the sibling `.label` toggles too (same target as the control, like Switch.svelte). Emits
 * `ss:change` on the root with `{ checked }`.
 */
import { on, emit } from './delegate.js'

export function toggleSwitch(track: HTMLButtonElement): void {
  if (track.disabled) return
  const next = track.getAttribute('aria-checked') !== 'true'
  track.setAttribute('aria-checked', String(next))
  track.classList.toggle('on', next)
  emit(track.closest('.ss-switch') ?? track, 'ss:change', { checked: next })
}

export function installSwitch(): void {
  on('click', '.ss-switch .track[role="switch"]', (track) =>
    toggleSwitch(track as HTMLButtonElement),
  )
  on('click', '.ss-switch .label', (label) => {
    const track = label.closest('.ss-switch')?.querySelector<HTMLButtonElement>('.track')
    if (track) toggleSwitch(track)
  })
}
