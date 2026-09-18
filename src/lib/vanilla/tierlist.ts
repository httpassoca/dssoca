/**
 * TierList (DS-0159) — plain-HTML behaviour for the markup `TierList.svelte` renders: pointer
 * drag between/within rows (Pointer Events, so touch works) and the keyboard path (Space picks
 * a tile up, arrows move it, Space drops, Escape cancels) with a polite live region. The move
 * math and the wording come from `../tierlist-core.js`, shared with the Svelte component.
 * Emits `ss:change` on the root with `{ placements }` (tier id → item ids; the tray is
 * implicit). `data-ss-readonly` on the root makes the list inert.
 */
import { on, emit, all } from './delegate.js'
import {
  TRAY,
  announceText,
  insertionIndex,
  keyboardTarget,
  type TierListKeyMove,
  type TierListPlacements,
  type TierListZones,
} from '../tierlist-core.js'

const ROOT = '.ss-tierlist'
const TILE = `${ROOT} .tile[data-item]`
const DRAG_THRESHOLD = 4

function rootOf(el: Element): HTMLElement | null {
  return el.closest<HTMLElement>(ROOT)
}

function zonesOf(root: HTMLElement): HTMLElement[] {
  return all(root, '[data-zone]').filter((z) => rootOf(z) === root)
}

function zoneKey(zone: HTMLElement): string {
  return zone.hasAttribute('data-tray') ? TRAY : (zone.dataset.zone as string)
}

function zoneByKey(root: HTMLElement, key: string): HTMLElement | undefined {
  return zonesOf(root).find((z) => zoneKey(z) === key)
}

function zoneLabel(zone: HTMLElement): string {
  return zone.getAttribute('aria-label') ?? zone.dataset.zoneLabel ?? zoneKey(zone)
}

function cellsOf(zone: HTMLElement): HTMLElement[] {
  return all(zone, ':scope > .cell')
}

/** The zone map as the DOM currently has it. */
export function readZones(root: HTMLElement): TierListZones {
  const zones: TierListZones = {}
  for (const zone of zonesOf(root)) {
    zones[zoneKey(zone)] = cellsOf(zone).map(
      (c) => c.querySelector<HTMLElement>('.tile[data-item]')?.dataset.item ?? '',
    )
  }
  return zones
}

/** Public placements read from the DOM: every non-tray zone, in DOM order. */
export function readPlacements(root: HTMLElement): TierListPlacements {
  const out: TierListPlacements = {}
  for (const zone of zonesOf(root)) {
    const key = zoneKey(zone)
    if (key !== TRAY) out[key] = readZones(root)[key]
  }
  return out
}

function isReadonly(root: HTMLElement): boolean {
  return root.hasAttribute('data-ss-readonly')
}

function announce(root: HTMLElement, text: string): void {
  const live = root.querySelector<HTMLElement>('.live')
  if (live) live.textContent = text
}

// Re-inserting a focused node blurs it (browsers run the focus fixup on removal); while a
// keyboard move is in flight that blur must not read as "the user left the tile".
let moving = false

/** Physically move a tile's cell to `zone` at `index` (clamped; the cell may already be there). */
function placeCell(root: HTMLElement, cell: HTMLElement, zone: string, index: number): void {
  const target = zoneByKey(root, zone)
  if (!target) return
  const siblings = cellsOf(target).filter((c) => c !== cell)
  const before = siblings[Math.max(0, Math.min(index, siblings.length))] ?? null
  const was = moving
  moving = true
  try {
    target.insertBefore(cell, before)
  } finally {
    moving = was
  }
}

function describe(root: HTMLElement, tile: HTMLElement) {
  const cell = tile.closest<HTMLElement>('.cell')!
  const zone = cell.parentElement as HTMLElement
  const cells = cellsOf(zone)
  return {
    label: tile.getAttribute('aria-label') ?? tile.textContent?.trim() ?? '',
    zone: zoneLabel(zone),
    index: cells.indexOf(cell),
    count: cells.length,
  }
}

function change(root: HTMLElement): void {
  emit(root, 'ss:change', { placements: readPlacements(root) })
}

// ---- keyboard ------------------------------------------------------------------------------

interface Grab {
  tile: HTMLElement
  /** Where to put the cell back on Escape. */
  zone: string
  index: number
}
const grabs = new WeakMap<HTMLElement, Grab>()

const KEY_MOVES: Record<string, TierListKeyMove> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
  Home: 'home',
  End: 'end',
}

function setGrabbed(root: HTMLElement, tile: HTMLElement | null): void {
  for (const t of all(root, '.tile[aria-pressed="true"]')) {
    t.setAttribute('aria-pressed', 'false')
    t.closest('.cell')?.classList.remove('grabbed')
  }
  root.classList.toggle('sorting', Boolean(tile))
  if (tile) {
    tile.setAttribute('aria-pressed', 'true')
    tile.closest('.cell')?.classList.add('grabbed')
  }
}

/** Pick a tile up (or drop it when it is already grabbed). */
export function toggleGrab(tile: HTMLElement): void {
  const root = rootOf(tile)
  if (!root || isReadonly(root)) return
  const grab = grabs.get(root)
  if (grab?.tile === tile) {
    grabs.delete(root)
    setGrabbed(root, null)
    announce(root, announceText('drop', describe(root, tile)))
    change(root)
    return
  }
  const d = describe(root, tile)
  const cell = tile.closest<HTMLElement>('.cell')!
  grabs.set(root, { tile, zone: zoneKey(cell.parentElement as HTMLElement), index: d.index })
  setGrabbed(root, tile)
  announce(root, announceText('grab', d))
}

/** `focusBack`: Escape keeps the user on the tile; a cancel caused by focus leaving must not pull it back. */
function cancelGrab(root: HTMLElement, focusBack: boolean): void {
  const grab = grabs.get(root)
  if (!grab) return
  grabs.delete(root)
  const cell = grab.tile.closest<HTMLElement>('.cell')!
  moving = true
  try {
    placeCell(root, cell, grab.zone, grab.index)
    setGrabbed(root, null)
    if (focusBack) grab.tile.focus()
  } finally {
    moving = false
  }
  announce(root, announceText('cancel', describe(root, grab.tile)))
}

function keyMove(root: HTMLElement, tile: HTMLElement, move: TierListKeyMove): void {
  const zones = readZones(root)
  const order = zonesOf(root).map(zoneKey)
  const target = keyboardTarget(zones, order, tile.dataset.item as string, move)
  if (!target) return
  const cell = tile.closest<HTMLElement>('.cell')!
  moving = true
  try {
    placeCell(root, cell, target.zone, target.index)
    tile.focus()
  } finally {
    moving = false
  }
  announce(root, announceText('move', describe(root, tile)))
}

// ---- pointer -------------------------------------------------------------------------------

interface Drag {
  root: HTMLElement
  tile: HTMLElement
  cell: HTMLElement
  startX: number
  startY: number
  dragging: boolean
  ghost: HTMLElement | null
  dx: number
  dy: number
  /** Where to put the cell back on pointercancel. */
  zone: string
  index: number
}
let drag: Drag | null = null

function zoneAt(root: HTMLElement, x: number, y: number): HTMLElement | null {
  for (const el of document.elementsFromPoint(x, y)) {
    const zone = el.closest<HTMLElement>('[data-zone]')
    if (zone && rootOf(zone) === root) return zone
  }
  return null
}

function startDrag(d: Drag): void {
  d.dragging = true
  const rect = d.tile.getBoundingClientRect()
  d.dx = d.startX - rect.left
  d.dy = d.startY - rect.top
  const ghost = d.tile.cloneNode(true) as HTMLElement
  ghost.classList.add('ghost')
  ghost.removeAttribute('id')
  ghost.setAttribute('aria-hidden', 'true')
  ghost.style.width = `${rect.width}px`
  ghost.style.height = `${rect.height}px`
  d.root.appendChild(ghost)
  d.ghost = ghost
  d.cell.classList.add('shadow')
  d.root.classList.add('dragging')
}

function moveDrag(d: Drag, x: number, y: number): void {
  if (d.ghost) d.ghost.style.transform = `translate(${x - d.dx}px, ${y - d.dy}px)`
  const zone = zoneAt(d.root, x, y)
  for (const z of zonesOf(d.root)) z.classList.toggle('target', z === zone)
  if (!zone) return
  const boxes = cellsOf(zone)
    .filter((c) => c !== d.cell)
    .map((c) => c.getBoundingClientRect())
  placeCell(d.root, d.cell, zoneKey(zone), insertionIndex(boxes, x, y))
}

function endDrag(d: Drag, cancelled: boolean): void {
  d.ghost?.remove()
  d.cell.classList.remove('shadow')
  d.root.classList.remove('dragging')
  for (const z of zonesOf(d.root)) z.classList.remove('target')
  if (cancelled) {
    placeCell(d.root, d.cell, d.zone, d.index)
    return
  }
  const now = describe(d.root, d.tile)
  if (zoneKey(d.cell.parentElement as HTMLElement) !== d.zone || now.index !== d.index) {
    announce(d.root, announceText('drop', now))
    change(d.root)
  }
}

export function installTierlist(): void {
  on('keydown', TILE, (tile, e) => {
    const root = rootOf(tile)
    if (!root || isReadonly(root)) return
    const grab = grabs.get(root)
    if (e.key === ' ' || (e.key === 'Enter' && !tile.hasAttribute('data-ss-activate'))) {
      e.preventDefault()
      toggleGrab(tile)
      return
    }
    if (e.key === 'Escape' && grab?.tile === tile) {
      e.preventDefault()
      cancelGrab(root, true)
      return
    }
    const move = KEY_MOVES[e.key]
    if (move && grab?.tile === tile) {
      e.preventDefault()
      keyMove(root, tile, move)
    }
  })

  // Cancel when focus has really left a grabbed tile — checked a beat later, because moving
  // the node (a row change re-inserts it) blurs it in some browsers before it is re-focused.
  on('focusout', TILE, (tile) => {
    if (moving) return
    const root = rootOf(tile)
    if (!root || grabs.get(root)?.tile !== tile) return
    setTimeout(() => {
      if (grabs.get(root)?.tile === tile && document.activeElement !== tile) cancelGrab(root, false)
    }, 0)
  })

  on('pointerdown', TILE, (tile, e) => {
    const root = rootOf(tile)
    if (!root || isReadonly(root) || e.button !== 0 || grabs.has(root)) return
    const cell = tile.closest<HTMLElement>('.cell')!
    const zone = cell.parentElement as HTMLElement
    drag = {
      root,
      tile,
      cell,
      startX: e.clientX,
      startY: e.clientY,
      dragging: false,
      ghost: null,
      dx: 0,
      dy: 0,
      zone: zoneKey(zone),
      index: cellsOf(zone).indexOf(cell),
    }
  })

  // Document-level, not on the tile: re-inserting the cell while it moves between rows
  // releases any pointer capture, so the rest of the drag must not depend on the tile.
  document.addEventListener('pointermove', (e) => {
    if (!drag) return
    if (!drag.dragging) {
      if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < DRAG_THRESHOLD) return
      startDrag(drag)
    }
    e.preventDefault()
    moveDrag(drag, e.clientX, e.clientY)
  })

  document.addEventListener('pointerup', () => {
    if (!drag) return
    const d = drag
    drag = null
    if (d.dragging) endDrag(d, false)
  })

  document.addEventListener('pointercancel', () => {
    if (!drag) return
    const d = drag
    drag = null
    if (d.dragging) endDrag(d, true)
  })
}
