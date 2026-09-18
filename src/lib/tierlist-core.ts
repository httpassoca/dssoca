/**
 * TierList core (DS-0159) — the framework-free half of the component: the data model, the pure
 * move/keyboard/hit-test math and the live-region wording. `TierList.svelte` and the plain-HTML
 * behaviour (`vanilla/tierlist.ts`) both run on this module, so the two paths cannot drift.
 * No DOM, no Svelte, no runes.
 */

/** A row of the list. `color` is any CSS colour (a token `var(--ss-…)` preferred). */
export interface TierListTier {
  id: string
  /** Short row label — the "S", "A", "B" letter (or a word). */
  label: string
  /** Row accent; defaults to a palette slot by row index (see {@link tierColor}). */
  color?: string
}

/** A rankable item. `label` is the tile's accessible name and the default tile text. */
export interface TierListItem {
  id: string
  label: string
}

/** Tier id → item ids in row order. Items in no tier sit in the unranked tray. */
export type TierListPlacements = Record<string, string[]>

/** Internal zone map: every tier id plus the tray, each an ordered list of item ids. */
export type TierListZones = Record<string, string[]>

/** Zone key of the unranked tray. Never a valid tier id. */
export const TRAY = '__tray__'

/** The classic five rows. */
export const DEFAULT_TIERS: readonly TierListTier[] = Object.freeze([
  { id: 'S', label: 'S' },
  { id: 'A', label: 'A' },
  { id: 'B', label: 'B' },
  { id: 'C', label: 'C' },
  { id: 'D', label: 'D' },
])

/**
 * Default row accents by index: palette slots, never literals (DS-0125). The first five mirror
 * the reference app (accent → cyan → yellow → muted → red); longer lists cycle through the rest.
 */
export const TIER_COLOR_VARS: readonly string[] = Object.freeze([
  '--ss-accent',
  '--ss-cyan',
  '--ss-yellow',
  '--ss-fg-muted',
  '--ss-red',
  '--ss-blue',
  '--ss-magenta',
  '--ss-green',
])

/** The CSS colour a row uses: its own `color`, else the slot for its index. */
export function tierColor(tier: Pick<TierListTier, 'color'>, index: number): string {
  return tier.color ?? `var(${TIER_COLOR_VARS[index % TIER_COLOR_VARS.length]})`
}

/**
 * Build the zone map from props. Placement ids that name no item are dropped, an item placed
 * in two tiers keeps its first placement, and everything unplaced goes to the tray — in the
 * order the previous zones had it (so a tray reorder survives a re-render), then `items` order.
 */
export function buildZones(
  tiers: readonly TierListTier[],
  items: readonly TierListItem[],
  placements?: TierListPlacements,
  previous?: TierListZones,
): TierListZones {
  const known = new Set(items.map((i) => i.id))
  const placed = new Set<string>()
  const zones: TierListZones = {}
  for (const tier of tiers) {
    const ids: string[] = []
    for (const id of placements?.[tier.id] ?? []) {
      if (!known.has(id) || placed.has(id)) continue
      placed.add(id)
      ids.push(id)
    }
    zones[tier.id] = ids
  }
  const tray: string[] = []
  for (const id of previous?.[TRAY] ?? []) {
    if (known.has(id) && !placed.has(id)) {
      placed.add(id)
      tray.push(id)
    }
  }
  for (const item of items) {
    if (!placed.has(item.id)) {
      placed.add(item.id)
      tray.push(item.id)
    }
  }
  zones[TRAY] = tray
  return zones
}

/** Where an item currently sits. `null` when it is in no zone. */
export function locate(
  zones: TierListZones,
  itemId: string,
): { zone: string; index: number } | null {
  for (const zone of Object.keys(zones)) {
    const index = zones[zone].indexOf(itemId)
    if (index >= 0) return { zone, index }
  }
  return null
}

/**
 * Move an item to `toZone` at `toIndex` (clamped to the zone's length, counted after the item
 * has been lifted out). Returns the same object when nothing changes, so callers can compare
 * by identity.
 */
export function moveItem(
  zones: TierListZones,
  itemId: string,
  toZone: string,
  toIndex: number,
): TierListZones {
  const from = locate(zones, itemId)
  if (!from || !(toZone in zones)) return zones
  const lifted = zones[from.zone].filter((id) => id !== itemId)
  const target = from.zone === toZone ? lifted : zones[toZone].slice()
  const index = Math.max(0, Math.min(toIndex, target.length))
  if (from.zone === toZone && index === from.index) return zones
  target.splice(index, 0, itemId)
  return {
    ...zones,
    [from.zone]: from.zone === toZone ? target : lifted,
    [toZone]: target,
  }
}

/** The public placements: tiers only, in the given tier order; the tray is implicit. */
export function placementsOf(
  zones: TierListZones,
  tiers: readonly TierListTier[],
): TierListPlacements {
  const out: TierListPlacements = {}
  for (const tier of tiers) out[tier.id] = (zones[tier.id] ?? []).slice()
  return out
}

export function zonesEqual(a: TierListZones, b: TierListZones): boolean {
  const ka = Object.keys(a)
  const kb = Object.keys(b)
  if (ka.length !== kb.length) return false
  for (const k of ka) {
    const x = a[k]
    const y = b[k]
    if (!y || x.length !== y.length) return false
    for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return false
  }
  return true
}

export type TierListKeyMove = 'left' | 'right' | 'up' | 'down' | 'home' | 'end'

/**
 * Keyboard sorting target: left/right step within the zone (wrapping is deliberately off —
 * the edges are meaningful), home/end jump within it, up/down move to the neighbouring zone
 * keeping the same position (clamped). `zoneOrder` is the visual order, tray last.
 * Returns `null` when the move is impossible (already at the edge).
 */
export function keyboardTarget(
  zones: TierListZones,
  zoneOrder: readonly string[],
  itemId: string,
  move: TierListKeyMove,
): { zone: string; index: number } | null {
  const at = locate(zones, itemId)
  if (!at) return null
  const len = zones[at.zone].length
  const zi = zoneOrder.indexOf(at.zone)
  switch (move) {
    case 'left':
      return at.index > 0 ? { zone: at.zone, index: at.index - 1 } : null
    case 'right':
      return at.index < len - 1 ? { zone: at.zone, index: at.index + 1 } : null
    case 'home':
      return at.index > 0 ? { zone: at.zone, index: 0 } : null
    case 'end':
      return at.index < len - 1 ? { zone: at.zone, index: len - 1 } : null
    case 'up':
    case 'down': {
      const next = zoneOrder[zi + (move === 'up' ? -1 : 1)]
      if (next === undefined) return null
      return { zone: next, index: Math.min(at.index, zones[next].length) }
    }
  }
}

/** Axis-aligned box, as `getBoundingClientRect()` gives it. */
export interface Box {
  left: number
  right: number
  top: number
  bottom: number
}

/**
 * Insertion index for a pointer at (x, y) among wrapped tiles: every tile whose row ends above
 * the pointer counts as "before", and on the pointer's own row every tile whose centre is left
 * of it. The dragged tile's own box must not be in `cells`.
 */
export function insertionIndex(cells: readonly Box[], x: number, y: number): number {
  let index = 0
  for (const c of cells) {
    if (c.bottom <= y) index++
    else if (c.top <= y && (c.left + c.right) / 2 <= x) index++
  }
  return index
}

/** Copy for the polite live region — one sentence per step, position 1-based. */
export function announceText(
  kind: 'grab' | 'move' | 'drop' | 'cancel',
  d: { label: string; zone: string; index: number; count: number },
): string {
  const where = `${d.zone}, position ${d.index + 1} of ${d.count}`
  switch (kind) {
    case 'grab':
      return `Picked up ${d.label}, ${where}. Use the arrow keys to move it, Space to drop, Escape to cancel.`
    case 'move':
      return `${d.label} moved to ${where}.`
    case 'drop':
      return `Dropped ${d.label} in ${where}.`
    case 'cancel':
      return `Cancelled. ${d.label} returned to ${where}.`
  }
}

/** Screen-reader instructions attached to every tile. */
export const TILE_INSTRUCTIONS =
  'Press Space to pick up the tile, then the arrow keys to move it between positions and tiers, Space again to drop it, or Escape to cancel.'
