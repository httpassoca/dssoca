<script lang="ts">
  import type { Snippet } from 'svelte'
  import { resolveComponentSize, type Size } from '../config.js'

  /** Side the tooltip attaches to relative to the trigger. */
  type Placement = 'top' | 'bottom' | 'left' | 'right'

  interface Props {
    /** Tooltip text (the accessible description of the trigger). */
    text: string
    /** Where the tooltip attaches relative to the trigger. Default `top`. */
    placement?: Placement
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
    /** Trigger content (wrapped in an inline-block container). */
    children: Snippet
  }

  let { text, placement = 'top', size, children }: Props = $props()

  const tipId = $props.id()

  let open = $state(false)

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
</script>

<!--
  Inline-block wrapper around the trigger snippet. Hover (mouseenter/leave) and
  focus (focusin/out — bubbling, so a focusable child trigger counts) toggle the
  tooltip; Escape dismisses it. While open the wrapper carries aria-describedby
  pointing at the tooltip; the tip itself is kept in the DOM but hidden (and
  given `hidden`) when closed so it is never announced.
-->
<!-- svelte-ignore a11y_no_static_element_interactions -- the wrapper is a passive
  container; the real interactive element is the trigger snippet inside it, and the
  hover/focus/keydown handlers only react to that child's bubbling events. -->
<span
  class="ss-tooltip"
  data-size-variant={sizeAttr}
  data-placement={placement}
  aria-describedby={open ? tipId : undefined}
  onmouseenter={show}
  onmouseleave={hide}
  onfocusin={show}
  onfocusout={hide}
  onkeydown={onKeydown}
>
  <span class="trigger">{@render children()}</span>
  <span id={tipId} class="tip" class:open role="tooltip" hidden={!open}>{text}</span>
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
    position: absolute;
    z-index: 60;
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
    transform: translateX(-50%) scale(0.98);
    transform-origin: bottom center;
  }
  .ss-tooltip[data-placement='top'] .tip.open {
    transform: translateX(-50%) scale(1);
  }
  .ss-tooltip[data-placement='bottom'] .tip {
    top: calc(100% + var(--ss-tooltip-offset, 6px));
    left: 50%;
    transform: translateX(-50%) scale(0.98);
    transform-origin: top center;
  }
  .ss-tooltip[data-placement='bottom'] .tip.open {
    transform: translateX(-50%) scale(1);
  }
  .ss-tooltip[data-placement='left'] .tip {
    right: calc(100% + var(--ss-tooltip-offset, 6px));
    top: 50%;
    transform: translateY(-50%) scale(0.98);
    transform-origin: right center;
  }
  .ss-tooltip[data-placement='left'] .tip.open {
    transform: translateY(-50%) scale(1);
  }
  .ss-tooltip[data-placement='right'] .tip {
    left: calc(100% + var(--ss-tooltip-offset, 6px));
    top: 50%;
    transform: translateY(-50%) scale(0.98);
    transform-origin: left center;
  }
  .ss-tooltip[data-placement='right'] .tip.open {
    transform: translateY(-50%) scale(1);
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
      transform: translateX(-50%);
    }
    .ss-tooltip[data-placement='left'] .tip,
    .ss-tooltip[data-placement='left'] .tip.open,
    .ss-tooltip[data-placement='right'] .tip,
    .ss-tooltip[data-placement='right'] .tip.open {
      transform: translateY(-50%);
    }
  }
</style>
