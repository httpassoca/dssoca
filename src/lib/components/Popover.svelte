<script lang="ts">
  // ─────────────────────────────────────────────────────────────────────────
  // Popover — DS-0197. A non-modal floating panel anchored to a trigger button:
  // Menu's sibling for arbitrary content (filters, a short form, details).
  // Opening moves focus into the panel; Escape, an outside press or tabbing out
  // dismiss it. Every decision is made in `core/popover.ts`, shared with
  // vanilla/popover.ts. Placement is CSS-only (side / align), like Menu.
  // ─────────────────────────────────────────────────────────────────────────
  import { untrack, type Snippet } from 'svelte'
  import { resolveComponentSize, type Size } from '../config.js'
  import { focusPopoverPanel } from '../vanilla/popover.js'
  import {
    popoverFocusOut,
    popoverKey,
    popoverOutsidePress,
    popoverPanelAttrs,
    popoverTriggerAttrs,
    popoverTriggerPress,
    type PopoverAction,
    type PopoverOpenChangeDetails,
    type PopoverState,
  } from '../core/popover.js'

  /** Where the panel attaches relative to the trigger. */
  type Align = 'start' | 'end'
  type Side = 'bottom' | 'top'

  interface Props {
    /**
     * Open state. `bindable` so callers can control it; left alone it behaves
     * as an uncontrolled popover (toggled by the trigger / dismissal).
     */
    open?: boolean
    /**
     * Fired when the popover opens or closes itself, with the new state and why
     * (`details.reason`: trigger · escape · outside · tab).
     */
    onOpenChange?: (open: boolean, details: PopoverOpenChangeDetails) => void
    /** Vertical side the panel opens toward. */
    side?: Side
    /** Horizontal edge the panel aligns to. */
    align?: Align
    /**
     * Accessible label for the panel (`role="dialog"`). When omitted the
     * panel is named by the trigger's text via `aria-labelledby`.
     */
    label?: string
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
    /** Trigger content (rendered inside the toggle button). */
    trigger?: Snippet
    /** Panel content. */
    children?: Snippet
  }

  let {
    open = $bindable(false),
    onOpenChange,
    side = 'bottom',
    align = 'start',
    label,
    size,
    trigger,
    children,
  }: Props = $props()

  const uid = $props.id()
  const panelId = `${uid}-panel`
  const triggerId = `${uid}-trigger`

  let rootEl = $state<HTMLElement>()
  let triggerEl = $state<HTMLButtonElement>()
  let panelEl = $state<HTMLElement>()

  // Behaviour lives in `core/popover.ts` (shared with vanilla/popover.ts): events go in,
  // a PopoverAction comes out, and `run` applies it to this component's state.
  const popover = $derived<PopoverState>({ open })

  function run(action: PopoverAction | null) {
    if (!action) return
    if (action.type === 'open') {
      open = true
      onOpenChange?.(true, { reason: action.reason })
    } else {
      open = false
      onOpenChange?.(false, { reason: action.reason })
      if (action.returnFocus) triggerEl?.focus()
    }
  }

  // Opening moves focus into the panel: its first focusable element, else the panel itself
  // (`focusPopoverPanel`, shared with the vanilla path, which also covers content that is not
  // focusable on the first frame). Runs after the DOM reflects `open` (the closed panel is inert), for an open the component
  // made and for one the parent made through `bind:open` — but not for a popover that is
  // rendered open, which must not grab focus on page load.
  let wasOpen = untrack(() => open)
  $effect(() => {
    const isOpen = open
    if (isOpen && !wasOpen && panelEl) focusPopoverPanel(panelEl)
    wasOpen = isOpen
  })

  function onKeydown(e: KeyboardEvent) {
    // Something inside (a nested Menu, say) already used this key.
    if (e.defaultPrevented) return
    const result = popoverKey(popover, e.key)
    if (!result) return
    if (result.preventDefault) e.preventDefault()
    run(result.action)
  }

  function onFocusOut(e: FocusEvent) {
    const to = e.relatedTarget as Node | null
    run(popoverFocusOut(popover, !to ? 'nowhere' : rootEl?.contains(to) ? 'inside' : 'outside'))
  }

  // Pointer-down outside the root closes the popover (same model as Menu).
  function onDocPointerDown(e: PointerEvent) {
    if (rootEl && rootEl.contains(e.target as Node)) return
    run(popoverOutsidePress(popover))
  }

  // SSR safety: same guard pattern as Menu.
  const hasDocument = typeof document !== 'undefined'

  $effect(() => {
    if (!open || !hasDocument) return
    document.addEventListener('pointerdown', onDocPointerDown, true)
    return () => document.removeEventListener('pointerdown', onDocPointerDown, true)
  })

  const sizeAttr = $derived(resolveComponentSize('Popover', size))
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  bind:this={rootEl}
  class="ss-popover"
  data-size-variant={sizeAttr}
  data-align={align}
  data-side={side}
  onkeydown={onKeydown}
  onfocusout={onFocusOut}
>
  <button
    bind:this={triggerEl}
    id={triggerId}
    type="button"
    class="trigger"
    {...popoverTriggerAttrs(open)}
    aria-controls={panelId}
    onclick={() => run(popoverTriggerPress(popover))}
  >
    {@render trigger?.()}
  </button>

  <div
    bind:this={panelEl}
    id={panelId}
    class="panel"
    class:open
    aria-label={label || undefined}
    aria-labelledby={label ? undefined : triggerId}
    {...popoverPanelAttrs()}
    inert={!open || undefined}
  >
    {@render children?.()}
  </div>
</div>

<style lang="scss">
  .ss-popover {
    position: relative;
    display: inline-block;
  }

  .trigger {
    display: inline-flex;
    align-items: center;
    gap: var(--ss-gap-sm);
    font: 500 var(--ss-control-font) var(--ss-font-mono);
    color: var(--ss-fg);
    background: transparent;
    border: 1px solid var(--ss-line);
    padding: var(--ss-control-py) var(--ss-control-px);
    cursor: pointer;
    transition:
      border-color var(--ss-dur-fast) var(--ss-ease),
      background var(--ss-dur-fast) var(--ss-ease),
      color var(--ss-dur-fast) var(--ss-ease);

    &:hover,
    &[aria-expanded='true'] {
      border-color: var(--ss-line-strong);
      background: var(--ss-hover);
    }
    // Focus: the base `outline: 2px solid var(--ss-primary)` ring (_base.scss)
    // applies; the border tint is an extra cue on top of it.
    &:focus-visible {
      border-color: var(--ss-primary);
    }
  }

  .panel {
    position: absolute;
    z-index: 50;
    box-sizing: border-box;
    width: max-content;
    min-width: var(--ss-popover-min-w);
    max-width: min(var(--ss-popover-max-w), 100vw - 2 * var(--ss-s-4));
    padding: var(--ss-popover-pad);
    font-size: var(--ss-ui-md);
    color: var(--ss-fg);
    text-align: start;
    background: var(--ss-bg-elev);
    border: 1px solid var(--ss-line);
    box-shadow: var(--ss-shadow-pop);

    // Closed → invisible and out of the tab order + a11y tree (the panel is also `inert`).
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transform: translateY(-6px) scale(0.98);
    transition:
      opacity var(--ss-dur) var(--ss-ease),
      transform var(--ss-dur) var(--ss-ease),
      visibility 0s linear var(--ss-dur);

    &.open {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
      transform: translateY(0) scale(1);
      transition:
        opacity var(--ss-dur) var(--ss-ease),
        transform var(--ss-dur) var(--ss-ease),
        visibility 0s linear 0s;
    }

    // The panel takes focus itself only when it holds nothing focusable; the ring sits inside
    // so the shadow does not swallow it.
    &:focus-visible {
      outline-offset: -2px;
    }
  }

  // --- placement (CSS-only, as Menu) -------------------------------------------
  .ss-popover[data-side='bottom'] .panel {
    top: calc(100% + var(--ss-popover-offset));
    transform-origin: top;
  }
  .ss-popover[data-side='top'] .panel {
    bottom: calc(100% + var(--ss-popover-offset));
    transform-origin: bottom;
  }
  .ss-popover[data-side='top'] .panel:not(.open) {
    transform: translateY(6px) scale(0.98);
  }
  .ss-popover[data-align='start'] .panel {
    inset-inline-start: 0;
  }
  .ss-popover[data-align='end'] .panel {
    inset-inline-end: 0;
  }
</style>
