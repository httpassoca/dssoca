<script lang="ts">
  import type { Snippet } from 'svelte'
  import { resolveComponentSize, type Size } from '../config.js'

  /** Side the tooltip attaches to relative to the trigger. */
  type Placement = 'top' | 'bottom' | 'left' | 'right'

  interface Props {
    /**
     * Tooltip content (the accessible description of the trigger): a plain string, or a
     * snippet for a small rendered template. Snippets must stay **phrasing content**
     * (`code`, `strong`, `kbd`, `br`, `Icon`, …) and must not contain interactive
     * elements — the tip is `pointer-events: none` and hidden while closed, per the
     * WAI-ARIA tooltip pattern.
     */
    text: string | Snippet
    /**
     * Preferred side the tooltip attaches to relative to the trigger. Default `top`.
     * With `avoidCollisions` (the default) this is only a preference — see below.
     */
    placement?: Placement
    /**
     * Keep the tip visible when the preferred side has no room (DS-0146): flip to the
     * opposite side, then to the perpendicular side with the most room, then shift along
     * the cross axis so the tip never overhangs the viewport or an `overflow`-clipping
     * ancestor. `false` pins the tip to `placement`. Default `true`.
     */
    avoidCollisions?: boolean
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
    /** Trigger content (wrapped in an inline-block container). */
    children: Snippet
  }

  let { text, placement = 'top', avoidCollisions = true, size, children }: Props = $props()

  const tipId = $props.id()

  let open = $state(false)
  let triggerEl = $state<HTMLElement | undefined>()
  let tipEl = $state<HTMLElement | undefined>()

  /** Side chosen by collision avoidance while open; `null` = use the preferred side. */
  let flipped = $state<Placement | null>(null)
  /** Side actually in use (the preferred side unless collision avoidance moved it). */
  const resolved = $derived(flipped ?? placement)
  /** Cross-axis nudge in px (x for top/bottom, y for left/right). */
  let shift = $state(0)

  function show() {
    open = true
  }
  function hide() {
    open = false
  }
  function onKeydown(e: KeyboardEvent) {
    // Escape dismisses the tooltip (WAI-ARIA tooltip pattern).
    if (e.key === 'Escape' && open) {
      open = false
    }
  }

  const sizeAttr = $derived(resolveComponentSize('Tooltip', size))

  // Snippets are functions, so a runtime typeof check narrows the union.
  const tipSnippet = $derived(typeof text === 'function' ? text : undefined)

  // --- collision avoidance ---------------------------------------------------
  // Manual measurement (what Floating UI's `flip` + `shift` do internally) rather
  // than a dependency or CSS anchor positioning: zero deps, every browser, and
  // exercisable in jsdom. The closed tip already has layout (its `display: block`
  // beats the UA `[hidden]` rule; hiding is visibility/opacity), so it can be
  // measured before it is revealed.

  type Rect = { top: number; right: number; bottom: number; left: number }

  const OPPOSITE: Record<Placement, Placement> = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
  }

  /** Viewport ∩ every ancestor that clips overflow (a scrolling Panel, Modal body…). */
  function clippingBoundary(from: HTMLElement): Rect {
    const r: Rect = { top: 0, left: 0, right: window.innerWidth, bottom: window.innerHeight }
    let el: HTMLElement | null = from.parentElement
    while (el && el !== document.body) {
      const cs = getComputedStyle(el)
      if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') {
        const b = el.getBoundingClientRect()
        r.top = Math.max(r.top, b.top)
        r.left = Math.max(r.left, b.left)
        r.right = Math.min(r.right, b.right)
        r.bottom = Math.min(r.bottom, b.bottom)
      }
      el = el.parentElement
    }
    return r
  }

  function position() {
    if (!avoidCollisions || !triggerEl || !tipEl) {
      flipped = null
      shift = 0
      return
    }
    const boundary = clippingBoundary(triggerEl)
    const t = triggerEl.getBoundingClientRect()
    const w = tipEl.offsetWidth
    const h = tipEl.offsetHeight
    const gap = parseFloat(getComputedStyle(tipEl).getPropertyValue('--ss-tooltip-offset')) || 6

    const space: Record<Placement, number> = {
      top: t.top - boundary.top,
      bottom: boundary.bottom - t.bottom,
      left: t.left - boundary.left,
      right: boundary.right - t.right,
    }
    const need = (p: Placement) => (p === 'top' || p === 'bottom' ? h : w) + gap

    // Preferred → opposite → perpendicular sides (roomier first) → most room overall.
    const perpendicular: Placement[] =
      placement === 'top' || placement === 'bottom' ? ['left', 'right'] : ['top', 'bottom']
    perpendicular.sort((a, b) => space[b] - space[a])
    const order: Placement[] = [placement, OPPOSITE[placement], ...perpendicular]
    const side =
      order.find((p) => space[p] >= need(p)) ??
      order.reduce((best, p) => (space[p] > space[best] ? p : best))
    flipped = side

    // Cross-axis shift: the tip is centred on the trigger; clamp its edges inside the
    // boundary (padded by the same gap it keeps from the trigger).
    if (side === 'top' || side === 'bottom') {
      const center = t.left + t.width / 2
      const left = center - w / 2
      const right = center + w / 2
      const min = boundary.left + gap
      const max = boundary.right - gap
      shift = left < min ? min - left : right > max ? max - right : 0
    } else {
      const center = t.top + t.height / 2
      const top = center - h / 2
      const bottom = center + h / 2
      const min = boundary.top + gap
      const max = boundary.bottom - gap
      shift = top < min ? min - top : bottom > max ? max - bottom : 0
    }
  }

  // Client-only: while open, (re)position on show / prop change and on any scroll
  // (capture catches nested scroll containers) or resize; on close, reset.
  $effect(() => {
    if (!open) {
      flipped = null
      shift = 0
      return
    }
    // Read the props here so a change while open re-runs the effect.
    void placement
    void avoidCollisions
    position()
    const onMove = () => position()
    window.addEventListener('scroll', onMove, { capture: true, passive: true })
    window.addEventListener('resize', onMove, { passive: true })
    return () => {
      window.removeEventListener('scroll', onMove, { capture: true })
      window.removeEventListener('resize', onMove)
    }
  })
</script>

<!--
  Inline-block wrapper around the trigger snippet. Hover (mouseenter/leave) and
  focus (focusin/out — bubbling, so a focusable child trigger counts) toggle the
  tooltip; Escape dismisses it. While open the wrapper carries aria-describedby
  pointing at the tooltip; the tip itself is kept in the DOM but hidden (and
  given `hidden`) when closed so it is never announced.

  `text` is either a string or a snippet (DS-0144); a snippet renders inside the
  same tip element, so the accessible description stays whatever the tip contains.

  `data-placement` is the *resolved* side (DS-0146): the preferred `placement`
  unless collision avoidance flipped it. `--shift` nudges the tip along the cross
  axis so it stays inside the viewport / clipping ancestor.
-->
<!-- svelte-ignore a11y_no_static_element_interactions -- the wrapper is a passive
  container; the real interactive element is the trigger snippet inside it, and the
  hover/focus/keydown handlers only react to that child's bubbling events. -->
<span
  class="ss-tooltip"
  data-size-variant={sizeAttr}
  data-placement={resolved}
  aria-describedby={open ? tipId : undefined}
  onmouseenter={show}
  onmouseleave={hide}
  onfocusin={show}
  onfocusout={hide}
  onkeydown={onKeydown}
>
  <span class="trigger" bind:this={triggerEl}>{@render children()}</span>
  <span
    id={tipId}
    class="tip"
    class:open
    role="tooltip"
    hidden={!open}
    style:--shift="{shift}px"
    bind:this={tipEl}
  >
    {#if tipSnippet}{@render tipSnippet()}{:else}{text}{/if}
  </span>
</span>

<style lang="scss">
  .ss-tooltip {
    position: relative;
    display: inline-block;
  }

  .trigger {
    display: inline-flex;
  }

  .tip {
    // Cross-axis nudge set inline by collision avoidance (DS-0146).
    --shift: 0px;

    position: absolute;
    z-index: 60;
    // Block formatting so multi-line snippet content (wrapped text, `<br>`) lays
    // out sensibly — and so the template's own leading/trailing whitespace around
    // the content is trimmed instead of padding the box.
    display: block;
    // Keep on a single line until it grows; cap so long text wraps sensibly.
    width: max-content;
    max-width: var(--ss-tooltip-max-w, 240px);
    padding: var(--ss-tooltip-py, 4px) var(--ss-tooltip-px, 8px);
    font: 500 var(--ss-ui-xs) var(--ss-font-mono);
    color: var(--ss-fg);
    background: var(--ss-bg-elev);
    border: 1px solid var(--ss-line);
    box-shadow: var(--ss-shadow-pop);
    // House rule: zero radius.
    border-radius: 0;

    // Closed → invisible + inert. (The `hidden` attribute removes it from the
    // a11y tree entirely; this collapse drives the visible fade/scale.)
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transform: scale(0.98);
    transition:
      opacity var(--ss-dur) var(--ss-ease),
      transform var(--ss-dur) var(--ss-ease),
      visibility 0s linear var(--ss-dur);

    &.open {
      opacity: 1;
      visibility: visible;
      transform: scale(1);
      transition:
        opacity var(--ss-dur) var(--ss-ease),
        transform var(--ss-dur) var(--ss-ease),
        visibility 0s linear 0s;
    }
  }

  // --- placement ------------------------------------------------------------
  .ss-tooltip[data-placement='top'] .tip {
    bottom: calc(100% + var(--ss-tooltip-offset, 6px));
    left: 50%;
    transform: translateX(calc(-50% + var(--shift))) scale(0.98);
    transform-origin: bottom center;
  }
  .ss-tooltip[data-placement='top'] .tip.open {
    transform: translateX(calc(-50% + var(--shift))) scale(1);
  }
  .ss-tooltip[data-placement='bottom'] .tip {
    top: calc(100% + var(--ss-tooltip-offset, 6px));
    left: 50%;
    transform: translateX(calc(-50% + var(--shift))) scale(0.98);
    transform-origin: top center;
  }
  .ss-tooltip[data-placement='bottom'] .tip.open {
    transform: translateX(calc(-50% + var(--shift))) scale(1);
  }
  .ss-tooltip[data-placement='left'] .tip {
    right: calc(100% + var(--ss-tooltip-offset, 6px));
    top: 50%;
    transform: translateY(calc(-50% + var(--shift))) scale(0.98);
    transform-origin: right center;
  }
  .ss-tooltip[data-placement='left'] .tip.open {
    transform: translateY(calc(-50% + var(--shift))) scale(1);
  }
  .ss-tooltip[data-placement='right'] .tip {
    left: calc(100% + var(--ss-tooltip-offset, 6px));
    top: 50%;
    transform: translateY(calc(-50% + var(--shift))) scale(0.98);
    transform-origin: left center;
  }
  .ss-tooltip[data-placement='right'] .tip.open {
    transform: translateY(calc(-50% + var(--shift))) scale(1);
  }

  // Respect reduced motion: drop the transition/scale, just toggle visibility.
  @media (prefers-reduced-motion: reduce) {
    .tip,
    .tip.open {
      transition: none;
      transform: none;
    }
    .ss-tooltip[data-placement='top'] .tip,
    .ss-tooltip[data-placement='top'] .tip.open,
    .ss-tooltip[data-placement='bottom'] .tip,
    .ss-tooltip[data-placement='bottom'] .tip.open {
      transform: translateX(calc(-50% + var(--shift)));
    }
    .ss-tooltip[data-placement='left'] .tip,
    .ss-tooltip[data-placement='left'] .tip.open,
    .ss-tooltip[data-placement='right'] .tip,
    .ss-tooltip[data-placement='right'] .tip.open {
      transform: translateY(calc(-50% + var(--shift)));
    }
  }
</style>
