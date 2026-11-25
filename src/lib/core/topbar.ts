/**
 * Topbar core (DS-0197) — the tab strip's decisions: the normalized tab list, which tab is the
 * roving tab stop and where a key moves focus. Pure functions; Topbar.svelte owns the DOM focus
 * call. No DOM, no Svelte.
 */
import { rovingStep, rovingTabindex, type RovingMove } from './behaviors/roving.js'

/** A tab as the consumer passes it: a plain string (id = label) or an object. */
export type TopbarTabInput = string | { id: string; label?: string; href?: string }

/** One normalized tab. */
export interface TopbarTabItem {
  id: string
  label: string
  href?: string
}

/** Normalize both tab shapes: string tabs keep id === label, object tabs default `label` to `id`. */
export function topbarTabs(tabs: readonly TopbarTabInput[]): TopbarTabItem[] {
  return tabs.map((t) =>
    typeof t === 'string'
      ? { id: t, label: t }
      : { id: t.id, label: t.label ?? t.id, href: t.href },
  )
}

/**
 * The roving tab stop: the active tab, or — when `active` matches no tab — the first button
 * tab, so the strip stays reachable by Tab. `-1` when there is neither.
 */
export function topbarRovingIndex(
  tabs: readonly TopbarTabItem[],
  active: string | undefined,
): number {
  const i = tabs.findIndex((t) => t.id === active)
  return i >= 0 ? i : tabs.findIndex((t) => !t.href)
}

/**
 * `tabindex` for a tab. Button tabs rove (one tab stop); link tabs return `undefined` and stay
 * in the natural tab order, so they remain keyboard-reachable without JS.
 */
export function topbarTabTabindex(
  tab: TopbarTabItem,
  index: number,
  rovingIndex: number,
): 0 | -1 | undefined {
  return tab.href ? undefined : rovingTabindex(index, rovingIndex)
}

/** A key the tab strip handles: its action, and whether the browser default must be cancelled. */
export interface TopbarKeyResult {
  action: { type: 'focus'; index: number } | null
  preventDefault: boolean
}

const MOVES: Record<string, RovingMove> = {
  ArrowRight: 'next',
  ArrowDown: 'next',
  ArrowLeft: 'prev',
  ArrowUp: 'prev',
  Home: 'first',
  End: 'last',
}

/**
 * A key on tab `index` of `count` tabs: arrows move focus across the strip (wrapping), Home/End
 * jump to the ends. `null` = not a tab-strip key, let it through.
 */
export function topbarTabKey(key: string, index: number, count: number): TopbarKeyResult | null {
  if (!Object.hasOwn(MOVES, key)) return null
  const all = Array.from({ length: count }, (_, i) => i)
  const target = rovingStep(all, index, MOVES[key])
  return { action: target >= 0 ? { type: 'focus', index: target } : null, preventDefault: true }
}
