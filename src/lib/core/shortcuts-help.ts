/**
 * ShortcutsHelp core (DS-0197) — what the overlay decides beyond the shortcut registry itself:
 * how the registered shortcuts are sectioned, and what a key pressed while recording a new
 * binding does. Pure functions; ShortcutsHelp.svelte reads the registry and applies the result.
 * No DOM, no Svelte.
 */

/** The bucket for ungrouped shortcuts; sorted last by default. */
export const SHORTCUTS_FALLBACK_GROUP = 'General'

export interface ShortcutsHelpGroup<T> {
  name: string
  items: T[]
}

/**
 * Section the shortcuts: buckets in first-appearance order with "General" forced last; an
 * explicit `groupOrder` lists its named groups first and the rest keep the default order.
 */
export function shortcutsHelpGroups<T extends { group?: string }>(
  items: readonly T[],
  groupOrder?: readonly string[],
): ShortcutsHelpGroup<T>[] {
  const buckets: ShortcutsHelpGroup<T>[] = []
  for (const item of items) {
    const name = item.group ?? SHORTCUTS_FALLBACK_GROUP
    const bucket = buckets.find((g) => g.name === name)
    if (bucket) bucket.items.push(item)
    else buckets.push({ name, items: [item] })
  }
  let ordered = buckets.filter((g) => g.name !== SHORTCUTS_FALLBACK_GROUP)
  const general = buckets.find((g) => g.name === SHORTCUTS_FALLBACK_GROUP)
  if (general) ordered.push(general)
  if (groupOrder?.length) {
    const explicit = groupOrder
      .map((n) => ordered.find((g) => g.name === n))
      .filter((g): g is ShortcutsHelpGroup<T> => g !== undefined)
    ordered = [...explicit, ...ordered.filter((g) => !explicit.includes(g))]
  }
  return ordered
}

/** The row's Change / Cancel button: start recording that shortcut, or cancel if it already is. */
export function shortcutsHelpRecordPress(
  recordingId: string | null,
  id: string,
): { type: 'start'; id: string } | { type: 'cancel' } {
  return recordingId === id ? { type: 'cancel' } : { type: 'start', id }
}

/**
 * How the registry judged a pressed combo: usable, reserved by the browser, or not parseable
 * as a binding at all.
 */
export type ShortcutComboVerdict = 'ok' | 'reserved' | 'invalid'

export type ShortcutsHelpRecordAction =
  /** Modifier-only press: a chord in progress, keep listening. */
  | { type: 'wait' }
  /** Bare Escape: abandon the recording. */
  | { type: 'cancel' }
  /** The combo cannot be bound; recording stays live for another try. */
  | { type: 'reject'; why: 'reserved' | 'invalid'; combo: string }
  /** Bind the combo and stop recording. */
  | { type: 'remap'; combo: string }

/**
 * A keydown while recording. `combo` is the registry's normalized combo for the event (`null`
 * for a modifier-only press); `verdict` is only asked for when the combo is a candidate.
 */
export function shortcutsHelpRecordKey(
  combo: string | null,
  verdict: (combo: string) => ShortcutComboVerdict,
): ShortcutsHelpRecordAction {
  if (combo === null) return { type: 'wait' }
  if (combo === 'escape') return { type: 'cancel' }
  const judged = verdict(combo)
  return judged === 'ok' ? { type: 'remap', combo } : { type: 'reject', why: judged, combo }
}
