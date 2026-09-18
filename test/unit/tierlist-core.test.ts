import { describe, it, expect } from 'vitest'
import {
  DEFAULT_TIERS,
  TIER_COLOR_VARS,
  TRAY,
  announceText,
  buildZones,
  insertionIndex,
  keyboardTarget,
  locate,
  moveItem,
  placementsOf,
  tierColor,
  zonesEqual,
  type TierListZones,
} from '$lib/tierlist-core'

// DS-0159 — the framework-free half of TierList: shared by TierList.svelte and
// vanilla/tierlist.ts, so the maths is pinned once here.

const tiers = DEFAULT_TIERS
const items = [
  { id: 'a', label: 'A' },
  { id: 'b', label: 'B' },
  { id: 'c', label: 'C' },
  { id: 'd', label: 'D' },
]

describe('tierlist-core — buildZones', () => {
  it('puts every item in the tray when there are no placements, in items order', () => {
    const z = buildZones(tiers, items)
    expect(Object.keys(z)).toEqual(['S', 'A', 'B', 'C', 'D', TRAY])
    expect(z[TRAY]).toEqual(['a', 'b', 'c', 'd'])
    for (const t of tiers) expect(z[t.id]).toEqual([])
  })

  it('honours placements, drops unknown ids and keeps the first of a duplicate', () => {
    const z = buildZones(tiers, items, { S: ['b', 'ghost'], A: ['b', 'a'], zzz: ['c'] })
    expect(z.S).toEqual(['b'])
    expect(z.A).toEqual(['a'])
    expect(z).not.toHaveProperty('zzz')
    expect(z[TRAY]).toEqual(['c', 'd'])
  })

  it('keeps the previous tray order and appends new items after it', () => {
    const previous: TierListZones = { S: [], A: [], B: [], C: [], D: [], [TRAY]: ['d', 'b'] }
    const z = buildZones(tiers, items, { S: ['a'] }, previous)
    expect(z[TRAY]).toEqual(['d', 'b', 'c'])
  })

  it('ignores a previous tray entry that is now placed or gone', () => {
    const previous: TierListZones = { S: [], [TRAY]: ['x', 'a', 'b'] }
    const z = buildZones(tiers, items, { A: ['a'] }, previous)
    expect(z[TRAY]).toEqual(['b', 'c', 'd'])
  })
})

describe('tierlist-core — moveItem / locate / placementsOf', () => {
  const base = buildZones(tiers, items, { S: ['a', 'b'], A: ['c'] })

  it('locates an item', () => {
    expect(locate(base, 'b')).toEqual({ zone: 'S', index: 1 })
    expect(locate(base, 'd')).toEqual({ zone: TRAY, index: 0 })
    expect(locate(base, 'nope')).toBeNull()
  })

  it('moves within a zone, counting the index after the lift', () => {
    const z = moveItem(base, 'a', 'S', 1)
    expect(z.S).toEqual(['b', 'a'])
    expect(z.A).toBe(base.A) // untouched zones keep identity
  })

  it('moves across zones and clamps the index', () => {
    const z = moveItem(base, 'd', 'A', 99)
    expect(z.A).toEqual(['c', 'd'])
    expect(z[TRAY]).toEqual([])
    expect(moveItem(base, 'c', 'S', -5).S).toEqual(['c', 'a', 'b'])
  })

  it('returns the same object for a no-op or an unknown target', () => {
    expect(moveItem(base, 'a', 'S', 0)).toBe(base)
    expect(moveItem(base, 'a', 'nowhere', 0)).toBe(base)
    expect(moveItem(base, 'nope', 'S', 0)).toBe(base)
  })

  it('never mutates its input', () => {
    const snapshot = JSON.stringify(base)
    moveItem(base, 'a', 'D', 0)
    expect(JSON.stringify(base)).toBe(snapshot)
  })

  it('projects the public placements without the tray, in tier order', () => {
    expect(placementsOf(base, tiers)).toEqual({ S: ['a', 'b'], A: ['c'], B: [], C: [], D: [] })
    expect(placementsOf(base, tiers)).not.toHaveProperty(TRAY)
  })

  it('zonesEqual compares by value', () => {
    expect(zonesEqual(base, buildZones(tiers, items, { S: ['a', 'b'], A: ['c'] }))).toBe(true)
    expect(zonesEqual(base, moveItem(base, 'a', 'S', 1))).toBe(false)
    expect(zonesEqual({ S: [] }, { S: [], A: [] })).toBe(false)
  })
})

describe('tierlist-core — keyboardTarget', () => {
  const order = [...tiers.map((t) => t.id), TRAY]
  const z = buildZones(tiers, items, { S: ['a', 'b', 'c'], B: ['d'] })

  it('steps within the row and refuses to pass the edges', () => {
    expect(keyboardTarget(z, order, 'b', 'left')).toEqual({ zone: 'S', index: 0 })
    expect(keyboardTarget(z, order, 'b', 'right')).toEqual({ zone: 'S', index: 2 })
    expect(keyboardTarget(z, order, 'a', 'left')).toBeNull()
    expect(keyboardTarget(z, order, 'c', 'right')).toBeNull()
  })

  it('home/end jump within the row', () => {
    expect(keyboardTarget(z, order, 'c', 'home')).toEqual({ zone: 'S', index: 0 })
    expect(keyboardTarget(z, order, 'a', 'end')).toEqual({ zone: 'S', index: 2 })
    expect(keyboardTarget(z, order, 'a', 'home')).toBeNull()
  })

  it('up/down move to the neighbouring zone keeping the position (clamped)', () => {
    expect(keyboardTarget(z, order, 'c', 'down')).toEqual({ zone: 'A', index: 0 })
    expect(keyboardTarget(z, order, 'd', 'up')).toEqual({ zone: 'A', index: 0 })
    expect(keyboardTarget(z, order, 'a', 'up')).toBeNull()
    expect(keyboardTarget(z, order, 'd', 'down')).toEqual({ zone: 'C', index: 0 })
    const bottom = buildZones(tiers, items) // everything in the tray, the last zone
    expect(keyboardTarget(bottom, order, 'a', 'down')).toBeNull()
    expect(keyboardTarget(bottom, order, 'a', 'up')).toEqual({ zone: 'D', index: 0 })
  })

  it('returns null for an unknown item', () => {
    expect(keyboardTarget(z, order, 'nope', 'left')).toBeNull()
  })
})

describe('tierlist-core — insertionIndex', () => {
  // Two rows of two 100×100 tiles.
  const cells = [
    { left: 0, right: 100, top: 0, bottom: 100 },
    { left: 110, right: 210, top: 0, bottom: 100 },
    { left: 0, right: 100, top: 110, bottom: 210 },
    { left: 110, right: 210, top: 110, bottom: 210 },
  ]

  it('counts tiles above the pointer and, on its row, those left of it', () => {
    expect(insertionIndex(cells, 10, 50)).toBe(0)
    expect(insertionIndex(cells, 90, 50)).toBe(1)
    expect(insertionIndex(cells, 200, 50)).toBe(2)
    expect(insertionIndex(cells, 10, 150)).toBe(2)
    expect(insertionIndex(cells, 200, 150)).toBe(4)
    expect(insertionIndex(cells, 500, 500)).toBe(4)
    expect(insertionIndex([], 5, 5)).toBe(0)
  })
})

describe('tierlist-core — colours and wording', () => {
  it('defaults a row colour by index, cycling through the slot list', () => {
    expect(tierColor({}, 0)).toBe('var(--ss-accent)')
    expect(tierColor({}, 4)).toBe('var(--ss-red)')
    expect(tierColor({}, TIER_COLOR_VARS.length)).toBe('var(--ss-accent)')
    expect(tierColor({ color: 'var(--ss-blue)' }, 0)).toBe('var(--ss-blue)')
    for (const v of TIER_COLOR_VARS) expect(v).toMatch(/^--ss-/)
  })

  it('announces each step with a 1-based position', () => {
    const d = { label: 'Alpha', zone: 'S', index: 0, count: 3 }
    expect(announceText('grab', d)).toBe(
      'Picked up Alpha, S, position 1 of 3. Use the arrow keys to move it, Space to drop, Escape to cancel.',
    )
    expect(announceText('move', d)).toBe('Alpha moved to S, position 1 of 3.')
    expect(announceText('drop', d)).toBe('Dropped Alpha in S, position 1 of 3.')
    expect(announceText('cancel', d)).toBe('Cancelled. Alpha returned to S, position 1 of 3.')
  })

  it('ships the five classic tiers', () => {
    expect(DEFAULT_TIERS.map((t) => t.id)).toEqual(['S', 'A', 'B', 'C', 'D'])
  })
})
