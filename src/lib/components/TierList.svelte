<script module lang="ts">
  // Public types, re-exported from the framework-free core so `import { TierList, type
  // TierListTier } from 'dssoca'` reads naturally (aliases: the svelte eslint plugin misreads a
  // bare `export type … from` in a module script as an import assignment).
  import type {
    TierListTier as CoreTier,
    TierListItem as CoreItem,
    TierListPlacements as CorePlacements,
  } from '../tierlist-core.js'
  export type TierListTier = CoreTier
  export type TierListItem = CoreItem
  export type TierListPlacements = CorePlacements
</script>

<script lang="ts">
  // ─────────────────────────────────────────────────────────────────────────
  // TierList (DS-0159). Labelled tier rows (S/A/B/C/D … + an unranked tray)
  // holding draggable tiles. Presentational and token-driven: it owns the rows,
  // the tiles, pointer drag-and-drop between/within rows and the keyboard
  // equivalent (WCAG 2.2 SC 2.5.7 needs a non-drag path), and hands the
  // consumer the resulting placements. What a tile *shows* is the consumer's
  // `tile` snippet; persistence, export and the like stay outside.
  //
  // Interaction model (mirrors dnd-kit's keyboard sensor): Space picks a tile
  // up, arrows move it — left/right within the row, up/down to the neighbouring
  // row — Space drops, Escape cancels; every step is read out by a polite live
  // region. Pointer drag (Pointer Events, so touch works too) reorders live
  // with a ghost under the pointer and commits on release. Enter activates
  // `onselect` when given (a details view), else behaves like Space.
  //
  // Data: `placements` is tier id → ordered item ids; items in no tier sit in
  // the tray. Controlled-with-callback (`bind:placements` + `onchange`), like
  // the rest of the library; unmanaged when neither is passed.
  // ─────────────────────────────────────────────────────────────────────────
  import { tick, untrack, type Snippet } from 'svelte'
  import { flip } from 'svelte/animate'
  import { resolveComponentSize, type Size } from '../config.js'
  import {
    DEFAULT_TIERS,
    TILE_INSTRUCTIONS,
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
    type TierListKeyMove,
    type TierListZones,
  } from '../tierlist-core.js'

  interface Props {
    /** The rows, top to bottom. Defaults to S / A / B / C / D. */
    tiers?: readonly TierListTier[]
    /** Every rankable item. Items in no tier are shown in the tray. */
    items: readonly TierListItem[]
    /**
     * Tier id → ordered item ids (bindable). Omit to let the component manage the
     * order itself; the tray is never part of it.
     */
    placements?: TierListPlacements
    /** Fired after every drop / keyboard drop with the new placements. */
    onchange?: (placements: TierListPlacements) => void
    /**
     * Activation (Enter, or a click that isn't a drag) — e.g. open a details view.
     * When omitted, Enter picks the tile up like Space.
     */
    onselect?: (item: TierListItem) => void
    /** Tile content. Defaults to the item's label; images/cards go here. */
    tile?: Snippet<[TierListItem]>
    /** Label of the unranked tray, or `false` to hide the tray (every item must then be placed). */
    tray?: string | false
    /** Accessible name of the whole list. */
    label?: string
    /** Display only: no drag, no keyboard sorting; tiles are plain boxes. */
    readonly?: boolean
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
  }

  let {
    tiers = DEFAULT_TIERS,
    items,
    placements = $bindable(),
    onchange,
    onselect,
    tile,
    tray = 'Unranked',
    label = 'Tier list',
    readonly = false,
    size,
  }: Props = $props()

  const uid = $props.id()
  const hintId = `ss-tier-${uid}-hint`
  const letterId = (tier: TierListTier) => `ss-tier-${uid}-${tier.id}`

  // --- zones ---------------------------------------------------------------
  // The working order. Re-derived from props whenever they change (a bound
  // `placements` echoing our own commit lands on an equal map, so no churn);
  // the tray keeps the order the user gave it.
  let zones = $state<TierListZones>(untrack(() => buildZones(tiers, items, placements)))
  $effect(() => {
    const current = untrack(() => zones)
    const next = buildZones(tiers, items, placements ?? placementsOf(current, tiers), current)
    if (!zonesEqual(next, current)) zones = next
  })

  const byId = $derived(new Map(items.map((i) => [i.id, i])))
  const zoneOrder = $derived([...tiers.map((t) => t.id), ...(tray === false ? [] : [TRAY])])
  const zoneLabel = (zone: string): string =>
    zone === TRAY ? tray || 'Unranked' : (tiers.find((t) => t.id === zone)?.label ?? zone)
  const zoneItems = (zone: string): TierListItem[] =>
    (zones[zone] ?? []).flatMap((id) => {
      const it = byId.get(id)
      return it ? [it] : []
    })

  function commit(next: TierListZones) {
    zones = next
    const p = placementsOf(next, tiers)
    if (placements !== undefined) placements = p
    onchange?.(p)
  }

  function describe(id: string) {
    const at = locate(zones, id)!
    return {
      label: byId.get(id)?.label ?? id,
      zone: zoneLabel(at.zone),
      index: at.index,
      count: zones[at.zone].length,
    }
  }

  // --- live region ---------------------------------------------------------
  let announcement = $state('')
  const announce = (text: string) => (announcement = text)

  // --- keyboard sorting ----------------------------------------------------
  let grabbed = $state<{ id: string; origin: TierListZones } | null>(null)
  const KEY_MOVES: Record<string, TierListKeyMove> = {
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'up',
    ArrowDown: 'down',
    Home: 'home',
    End: 'end',
  }

  function toggleGrab(id: string) {
    if (grabbed?.id === id) {
      const origin = grabbed.origin
      grabbed = null
      announce(announceText('drop', describe(id)))
      if (!zonesEqual(origin, zones)) commit(zones)
      return
    }
    grabbed = { id, origin: zones }
    announce(announceText('grab', describe(id)))
  }

  // `focusBack`: Escape keeps the user on the tile; a cancel caused by focus leaving
  // (Tab, a click elsewhere) must not pull focus back — that would be a trap.
  function cancelGrab(focusBack: boolean) {
    if (!grabbed) return
    const { id, origin } = grabbed
    grabbed = null
    zones = origin
    announce(announceText('cancel', describe(id)))
    if (focusBack) void refocus(id)
  }

  // Every keyboard move re-inserts the tile's node (a row change even re-creates it in the
  // other row's keyed block), and browsers blur a node that leaves the document — so focus is
  // put back after the DOM settles, and the blur that causes must not read as a cancel.
  let refocusing = false
  async function refocus(id: string) {
    refocusing = true
    await tick()
    root?.querySelector<HTMLElement>(`.tile[data-item="${CSS.escape(id)}"]`)?.focus()
    refocusing = false
  }

  function onTileKeydown(e: KeyboardEvent, item: TierListItem) {
    if (readonly) return
    if (e.key === ' ' || (e.key === 'Enter' && !onselect)) {
      e.preventDefault()
      toggleGrab(item.id)
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      onselect?.(item)
      return
    }
    if (grabbed?.id !== item.id) return
    if (e.key === 'Escape') {
      e.preventDefault()
      cancelGrab(true)
      return
    }
    const move = KEY_MOVES[e.key]
    if (!move) return
    e.preventDefault()
    const target = keyboardTarget(zones, zoneOrder, item.id, move)
    if (!target) return
    zones = moveItem(zones, item.id, target.zone, target.index)
    announce(announceText('move', describe(item.id)))
    void refocus(item.id)
  }

  // Leaving the tile while it is picked up (Tab, a click elsewhere) cancels —
  // the WAI-ARIA convention; nothing moves without an explicit drop. Checked a
  // beat later: a cross-row move re-creates the node (blur, then our refocus),
  // and browsers differ on whether removal even fires blur, so only a focus
  // that has really left the tile counts.
  function onTileBlur(item: TierListItem) {
    if (grabbed?.id !== item.id) return
    setTimeout(() => {
      if (grabbed?.id !== item.id || refocusing) return
      const el = root?.querySelector<HTMLElement>(`.tile[data-item="${CSS.escape(item.id)}"]`)
      if (el && document.activeElement === el) return
      cancelGrab(false)
    }, 0)
  }

  // --- pointer drag --------------------------------------------------------
  interface Drag {
    id: string
    origin: TierListZones
    startX: number
    startY: number
    active: boolean
    x: number
    y: number
    dx: number
    dy: number
    w: number
    h: number
    zone: string | null
  }
  let drag = $state<Drag | null>(null)
  let root: HTMLElement | undefined = $state()
  const DRAG_THRESHOLD = 4
  let suppressClick = false

  // The drag listens on `window`, not the tile: the live preview moves the
  // dragged item between rows, and a row change re-creates its node — pointer
  // capture on the old node would die with it and the drag would hang.
  function listen() {
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerCancel)
  }
  function unlisten() {
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('pointercancel', onPointerCancel)
  }
  $effect(() => unlisten)

  function onPointerDown(e: PointerEvent, item: TierListItem) {
    if (readonly || e.button !== 0 || grabbed) return
    const tileEl = e.currentTarget as HTMLElement
    const rect = tileEl.getBoundingClientRect()
    listen()
    drag = {
      id: item.id,
      origin: zones,
      startX: e.clientX,
      startY: e.clientY,
      active: false,
      x: e.clientX,
      y: e.clientY,
      dx: e.clientX - rect.left,
      dy: e.clientY - rect.top,
      w: rect.width,
      h: rect.height,
      zone: null,
    }
  }

  function zoneAt(x: number, y: number): string | null {
    if (!root || typeof document.elementsFromPoint !== 'function') return null
    for (const el of document.elementsFromPoint(x, y)) {
      const zone = el.closest<HTMLElement>('[data-zone]')
      if (zone && root.contains(zone)) {
        return zone.hasAttribute('data-tray') ? TRAY : (zone.dataset.zone as string)
      }
    }
    return null
  }

  function onPointerMove(e: PointerEvent) {
    if (!drag) return
    if (!drag.active) {
      if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < DRAG_THRESHOLD) return
      drag.active = true
    }
    e.preventDefault()
    drag.x = e.clientX
    drag.y = e.clientY
    const zone = zoneAt(e.clientX, e.clientY)
    if (!zone || !root) return
    drag.zone = zone
    const zoneEl = root.querySelector<HTMLElement>(
      zone === TRAY ? '[data-zone][data-tray]' : `[data-zone="${CSS.escape(zone)}"]`,
    )
    if (!zoneEl) return
    const boxes = Array.from(zoneEl.querySelectorAll<HTMLElement>(':scope > .cell'))
      .filter((c) => c.dataset.item !== drag!.id)
      .map((c) => c.getBoundingClientRect())
    const next = moveItem(zones, drag.id, zone, insertionIndex(boxes, e.clientX, e.clientY))
    if (next !== zones) zones = next
  }

  function onPointerUp() {
    if (!drag) return
    const d = drag
    drag = null
    unlisten()
    if (!d.active) return
    suppressClick = true
    if (zonesEqual(d.origin, zones)) return
    announce(announceText('drop', describe(d.id)))
    commit(zones)
  }

  function onPointerCancel() {
    if (!drag) return
    const d = drag
    drag = null
    unlisten()
    if (d.active) zones = d.origin
  }

  function onTileClick(item: TierListItem) {
    if (suppressClick) {
      suppressClick = false
      return
    }
    if (!readonly) onselect?.(item)
  }

  const draggedItem = $derived(drag?.active ? byId.get(drag.id) : undefined)
  const sizeAttr = $derived(resolveComponentSize('TierList', size))
</script>

{#snippet tileBody(item: TierListItem)}
  {#if tile}
    {@render tile(item)}
  {:else}
    <span class="name">{item.label}</span>
  {/if}
{/snippet}

{#snippet zone(key: string, isTray: boolean)}
  <ul
    class="zone"
    class:tray={isTray}
    class:target={drag?.active && drag.zone === key}
    data-zone={key}
    data-tray={isTray ? '' : undefined}
    aria-label={zoneLabel(key)}
  >
    {#each zoneItems(key) as item (item.id)}
      <li
        class="cell"
        class:shadow={drag?.active && drag.id === item.id}
        class:grabbed={grabbed?.id === item.id}
        data-item={item.id}
        animate:flip={{ duration: 150 }}
      >
        {#if readonly}
          <div class="tile" data-item={item.id} aria-label={item.label} role="img">
            {@render tileBody(item)}
          </div>
        {:else}
          <button
            type="button"
            class="tile"
            data-item={item.id}
            data-ss-activate={onselect ? '' : undefined}
            aria-label={item.label}
            aria-describedby={hintId}
            aria-pressed={grabbed?.id === item.id}
            aria-roledescription="draggable tile"
            onkeydown={(e) => onTileKeydown(e, item)}
            onblur={() => onTileBlur(item)}
            onpointerdown={(e) => onPointerDown(e, item)}
            onclick={() => onTileClick(item)}
          >
            {@render tileBody(item)}
          </button>
        {/if}
      </li>
    {/each}
  </ul>
{/snippet}

<div
  bind:this={root}
  class="ss-tierlist"
  class:sorting={grabbed !== null}
  class:dragging={drag?.active}
  role="group"
  aria-label={label}
  data-size-variant={sizeAttr}
  data-ss-readonly={readonly ? '' : undefined}
>
  {#if !readonly}
    <p class="sr-only" id={hintId}>{TILE_INSTRUCTIONS}</p>
    <div class="live sr-only" role="status" aria-live="polite" aria-atomic="true">
      {announcement}
    </div>
  {/if}

  {#each tiers as tier, i (tier.id)}
    <div class="row" data-tier={tier.id} style:--ss-tier-color={tierColor(tier, i)}>
      <div class="letter" id={letterId(tier)}>{tier.label}</div>
      {@render zone(tier.id, false)}
    </div>
  {/each}

  {#if tray !== false}
    <div class="tray-row">
      <span class="tray-label">{tray}</span>
      {@render zone(TRAY, true)}
    </div>
  {/if}

  {#if drag?.active && draggedItem}
    <div
      class="tile ghost"
      aria-hidden="true"
      style="width: {drag.w}px; height: {drag.h}px; transform: translate({drag.x -
        drag.dx}px, {drag.y - drag.dy}px)"
    >
      {@render tileBody(draggedItem)}
    </div>
  {/if}
</div>

<style lang="scss">
  .ss-tierlist {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--ss-tier-gap);
    font-family: var(--ss-font-body);

    .row {
      display: flex;
      align-items: stretch;
      gap: var(--ss-tier-gap);
    }

    // The tier letter: a token wash of the row's accent (Badge's recipe, DS-0125).
    .letter {
      flex: none;
      width: var(--ss-tier-label-w);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--ss-font-display);
      font-size: var(--ss-tier-label-font);
      color: var(--ss-tier-color);
      border: 1px solid color-mix(in srgb, var(--ss-tier-color) 40%, transparent);
      background: color-mix(in srgb, var(--ss-tier-color) 12%, transparent);
      overflow-wrap: anywhere;
      text-align: center;
    }

    .zone {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      align-content: flex-start;
      gap: var(--ss-tier-gap);
      // Never shorter than one tile so an empty row stays a drop target.
      min-height: calc(var(--ss-tier-tile-h) + 2 * var(--ss-tier-gap) + 2px);
      margin: 0;
      padding: var(--ss-tier-gap);
      list-style: none;
      border: 1px solid var(--ss-line);
      background: var(--ss-bg-elev);
      box-sizing: border-box;
      transition: outline-color var(--ss-dur-fast) var(--ss-ease);

      &.target {
        outline: 1px dashed var(--ss-accent);
        outline-offset: 2px;
      }
    }

    .tray-row {
      display: flex;
      flex-direction: column;
      gap: var(--ss-s-1);
      margin-top: var(--ss-s-1);
      padding-top: var(--ss-s-2);
      border-top: 1px solid var(--ss-line);
    }
    .tray-label {
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-xs);
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--ss-fg-faint);
    }
    .zone.tray {
      background: var(--ss-bg-inset);
    }

    .cell {
      display: block;
      list-style: none;
    }

    .tile {
      width: var(--ss-tier-tile-w);
      height: var(--ss-tier-tile-h);
      display: flex;
      align-items: flex-end;
      padding: 0;
      margin: 0;
      border: 1px solid var(--ss-line);
      border-radius: 0;
      background: var(--ss-bg-inset);
      color: inherit;
      font: inherit;
      text-align: left;
      overflow: hidden;
      cursor: grab;
      // Pointer Events drive the drag; the browser must not turn a touch into a scroll.
      touch-action: none;
      user-select: none;
      -webkit-user-select: none;
      transition:
        border-color var(--ss-dur-fast) var(--ss-ease),
        box-shadow var(--ss-dur-fast) var(--ss-ease);

      &:hover {
        border-color: var(--ss-line-strong);
      }
    }
    // Tile media (posters, avatars) fills the frame edge to edge.
    .tile :global(img),
    .tile :global(svg),
    .tile :global(video) {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .name {
      padding: var(--ss-s-1);
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-xs);
      line-height: 1.3;
      color: var(--ss-fg-muted);
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 4;
      line-clamp: 4;
      word-break: break-word;
    }

    // Keyboard pick-up: the tile lifts; pointer drag: the origin dims to a dashed slot.
    .cell.grabbed .tile {
      border-color: var(--ss-accent);
      box-shadow: var(--ss-shadow-pop);
    }
    .cell.shadow {
      opacity: 0.4;
      .tile {
        border-style: dashed;
        border-color: var(--ss-accent);
      }
    }

    // The ghost under the pointer (Svelte renders it; vanilla clones the tile into it).
    .ghost {
      position: fixed;
      left: 0;
      top: 0;
      z-index: 50;
      pointer-events: none;
      border-color: var(--ss-accent);
      box-shadow: var(--ss-shadow-pop);
      opacity: 0.92;
      cursor: grabbing;
    }

    &.dragging {
      user-select: none;
      .tile {
        cursor: grabbing;
      }
    }
    &[data-ss-readonly] .tile {
      cursor: default;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
      border: 0;
    }
  }
</style>
