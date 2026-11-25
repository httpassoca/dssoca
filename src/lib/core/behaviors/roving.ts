/**
 * Roving focus (DS-0198): a composite widget is ONE tab stop and the arrow keys move focus
 * between its enabled items. Pure index maths — the caller owns the DOM focus call.
 */

export type RovingMove = 'next' | 'prev' | 'first' | 'last'

/**
 * The index to focus after `move`. `enabled` holds the focusable item indexes in DOM order;
 * `active` is the currently focused index (`-1` or a disabled index when none is). Wraps at
 * both ends. Returns `-1` when nothing is focusable.
 */
export function rovingStep(enabled: readonly number[], active: number, move: RovingMove): number {
  if (enabled.length === 0) return -1
  const first = enabled[0]
  const last = enabled[enabled.length - 1]
  switch (move) {
    case 'first':
      return first
    case 'last':
      return last
    case 'next':
      return active < 0 ? first : (enabled.find((i) => i > active) ?? first)
    case 'prev':
      return active < 0 ? last : ([...enabled].reverse().find((i) => i < active) ?? last)
  }
}

/** Roving tabindex for one item: the active item is the tab stop, the rest are skipped. */
export function rovingTabindex(index: number, active: number): 0 | -1 {
  return index === active ? 0 : -1
}
