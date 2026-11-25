/**
 * Switch core (DS-0198) — the toggle decision and the state attributes, shared by Switch.svelte
 * and `vanilla/switch.ts`. No DOM, no Svelte.
 */

/** What flipped the switch; passed to `onchange` / `ss:change`. */
export type SwitchReason = 'track' | 'label'

export interface SwitchChangeDetails {
  reason: SwitchReason
}

export interface SwitchState {
  checked: boolean
  disabled: boolean
}

/** The next `checked` value, or `null` when the switch is disabled and must not change. */
export function switchToggle(state: SwitchState): boolean | null {
  return state.disabled ? null : !state.checked
}

export function switchTrackAttrs(checked: boolean) {
  return { role: 'switch', 'aria-checked': checked ? 'true' : 'false' } as const
}
