<script lang="ts">
  import { fly } from 'svelte/transition'
  import { prefersReducedMotion } from 'svelte/motion'
  import { toasts, type Toast, type ToastKind } from '../toast.svelte.js'
  import { resolveComponentSize, type Size } from '../config.js'

  type Position =
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center'

  interface Props {
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
    /** Where the stack anchors on screen. @default 'top-right' */
    position?: Position
  }

  let { size, position = 'top-right' }: Props = $props()

  const glyph: Record<ToastKind, string> = { success: '✓', error: '✕', info: 'i', loading: '' }
  // Honor prefers-reduced-motion: collapse the fly transition to an instant swap.
  const reduce = $derived(prefersReducedMotion.current)
  const flyDuration = $derived(reduce ? 0 : 180)
  // Bottom anchors slide in from below; centered ones come straight down/up.
  const flyX = $derived(position.endsWith('center') ? 0 : position.endsWith('left') ? -16 : 16)
  const flyY = $derived(position.endsWith('center') ? (position.startsWith('top') ? -16 : 16) : 0)

  // ── swipe-to-dismiss ──────────────────────────────────────────────
  let dragId = $state<number | null>(null)
  let dragDx = $state(0)
  let dragStartX = 0
  let dragPointer: number | null = null

  const SWIPE_THRESHOLD = 64

  function onPointerDown(e: PointerEvent, t: Toast) {
    if (reduce || e.button !== 0) return
    // Ignore drags that start on the controls (buttons own their clicks).
    if ((e.target as HTMLElement).closest('button')) return
    dragId = t.id
    dragDx = 0
    dragStartX = e.clientX
    dragPointer = e.pointerId
    toasts.pause(t.id)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: PointerEvent, t: Toast) {
    if (dragId !== t.id || e.pointerId !== dragPointer) return
    dragDx = e.clientX - dragStartX
  }

  function endDrag(e: PointerEvent, t: Toast) {
    if (dragId !== t.id || e.pointerId !== dragPointer) return
    const passed = Math.abs(dragDx) >= SWIPE_THRESHOLD
    dragId = null
    dragPointer = null
    if (passed) toasts.dismiss(t.id)
    else {
      dragDx = 0
      toasts.resume(t.id)
    }
  }

  function runAction(t: Toast) {
    const keep = t.action?.onClick() === false
    if (!keep) toasts.dismiss(t.id)
  }

  function onKeydown(e: KeyboardEvent, t: Toast) {
    if (e.key === 'Escape') {
      e.stopPropagation()
      toasts.dismiss(t.id)
    }
  }
</script>

<div
  class="ss-toaster"
  aria-label="Notifications"
  data-position={position}
  data-size-variant={resolveComponentSize('Toaster', size)}
>
  {#each toasts.items as t (t.id)}
    <div
      class="ss-toast {t.kind}"
      class:dragging={dragId === t.id}
      role={t.kind === 'error' ? 'alert' : 'status'}
      aria-live={t.kind === 'error' ? 'assertive' : 'polite'}
      tabindex="-1"
      style:transform={dragId === t.id ? `translateX(${dragDx}px)` : undefined}
      style:opacity={dragId === t.id
        ? Math.max(0.3, 1 - Math.abs(dragDx) / 200)
        : undefined}
      transition:fly={{ x: flyX, y: flyY, duration: flyDuration }}
      onpointerenter={() => toasts.pause(t.id)}
      onpointerleave={() => dragId !== t.id && toasts.resume(t.id)}
      onfocusin={() => toasts.pause(t.id)}
      onfocusout={() => toasts.resume(t.id)}
      onpointerdown={(e) => onPointerDown(e, t)}
      onpointermove={(e) => onPointerMove(e, t)}
      onpointerup={(e) => endDrag(e, t)}
      onpointercancel={(e) => endDrag(e, t)}
      onkeydown={(e) => onKeydown(e, t)}
    >
      {#if t.kind === 'loading'}
        <span class="ic spinner" class:still={reduce} aria-hidden="true"></span>
      {:else}
        <span class="ic" aria-hidden="true">{glyph[t.kind]}</span>
      {/if}
      <span class="msg">{t.message}</span>
      {#if t.action}
        <button class="action" type="button" onclick={() => runAction(t)}>
          {t.action.label}
        </button>
      {/if}
      <button class="x" type="button" aria-label="Dismiss" onclick={() => toasts.dismiss(t.id)}
        >×</button
      >
    </div>
  {/each}
</div>

<style lang="scss">
  .ss-toaster {
    position: fixed;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: var(--ss-s-2);
    max-width: min(360px, calc(100vw - var(--ss-s-8)));
    pointer-events: none;

    // ── position anchors (read the existing --ss-s-* tokens) ──────────
    top: var(--ss-s-4);
    right: var(--ss-s-4);

    &[data-position='top-left'] {
      right: auto;
      left: var(--ss-s-4);
    }
    &[data-position='bottom-right'] {
      top: auto;
      bottom: var(--ss-s-4);
      flex-direction: column-reverse;
    }
    &[data-position='bottom-left'] {
      top: auto;
      right: auto;
      bottom: var(--ss-s-4);
      left: var(--ss-s-4);
      flex-direction: column-reverse;
    }
    &[data-position='top-center'] {
      right: auto;
      left: 50%;
      transform: translateX(-50%);
    }
    &[data-position='bottom-center'] {
      top: auto;
      right: auto;
      bottom: var(--ss-s-4);
      left: 50%;
      transform: translateX(-50%);
      flex-direction: column-reverse;
    }
  }
  .ss-toast {
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: var(--ss-s-3);
    padding: var(--ss-s-3) var(--ss-s-4);
    background: var(--ss-bg-elev);
    border: 1px solid var(--ss-line);
    border-left: 3px solid var(--ss-fg-faint);
    box-shadow: var(--ss-shadow-pop);
    font-family: var(--ss-font-mono);
    font-size: var(--ss-ui-md);
    color: var(--ss-fg);
    touch-action: pan-y;
    outline: none;

    &:focus-visible {
      border-color: var(--ss-line-strong);
      box-shadow: var(--ss-shadow-pop), 0 0 0 2px var(--ss-primary);
    }
    &:not(.dragging) {
      transition: transform var(--ss-dur-fast) var(--ss-ease);
    }

    &.success { border-left-color: var(--ss-primary); }
    &.error   { border-left-color: var(--ss-red); }
    &.info    { border-left-color: var(--ss-cyan); }
    &.loading { border-left-color: var(--ss-fg-faint); }

    .ic {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--ss-toast-ic);
      height: var(--ss-toast-ic);
      font-size: var(--ss-ui-sm);
      color: var(--ss-fg-on-primary);
      flex: none;
    }
    &.success .ic { background: var(--ss-primary); }
    &.error .ic   { background: var(--ss-red); }
    &.info .ic    { background: var(--ss-cyan); }

    // Loading spinner — a square (zero-radius) ring that rotates; the
    // reduced-motion guard (.still) freezes it to a static accent box.
    .spinner {
      box-sizing: border-box;
      background: transparent;
      border: 2px solid var(--ss-line-strong);
      border-top-color: var(--ss-cyan);
      animation: ss-toast-spin 0.7s linear infinite;
    }
    .spinner.still {
      animation: none;
      border-color: var(--ss-cyan);
    }

    .msg { flex: 1; line-height: 1.3; }

    .action {
      flex: none;
      background: none;
      border: 1px solid var(--ss-line-strong);
      color: var(--ss-fg);
      cursor: pointer;
      font-family: inherit;
      font-size: var(--ss-ui-sm);
      line-height: 1;
      padding: var(--ss-s-1) var(--ss-s-2);

      &:hover { background: var(--ss-hover); border-color: var(--ss-fg-faint); }
      &:focus-visible { outline: 2px solid var(--ss-primary); outline-offset: 1px; }
    }

    .x {
      flex: none;
      background: none;
      border: none;
      color: var(--ss-fg-faint);
      cursor: pointer;
      font-size: var(--ss-size-h3);
      line-height: 1;
      padding: 0;

      &:hover { color: var(--ss-fg); }
      &:focus-visible { outline: 2px solid var(--ss-primary); outline-offset: 1px; }
    }
  }

  @keyframes ss-toast-spin {
    to { transform: rotate(360deg); }
  }
  @media (prefers-reduced-motion: reduce) {
    .ss-toast .spinner {
      animation: none;
      border-color: var(--ss-cyan);
    }
  }
</style>
