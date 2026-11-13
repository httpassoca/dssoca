<script lang="ts">
  import { fly } from 'svelte/transition'
  import { prefersReducedMotion } from 'svelte/motion'
  import { untrack } from 'svelte'
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
  const uid = $props.id()

  const glyph: Record<ToastKind, string> = { success: '✓', error: '✕', info: 'i', loading: '' }
  // Honor prefers-reduced-motion: collapse the fly transition to an instant swap.
  const reduce = $derived(prefersReducedMotion.current)

  // Fly duration reads the motion token (DS-0068) — the JS transition tracks
  // `--ss-dur-fast` so theme/motion overrides apply, instead of a hardcoded
  // 180ms. Falls back to 180ms (the previous value) when the stylesheet isn't
  // present (e.g. jsdom, or the token entry not loaded).
  let rootEl = $state<HTMLElement>()
  function parseMs(raw: string): number | undefined {
    const v = raw.trim()
    if (!v) return undefined
    const n = parseFloat(v)
    if (!Number.isFinite(n) || n < 0) return undefined
    return v.endsWith('ms') ? n : v.endsWith('s') ? n * 1000 : n
  }
  const tokenDuration = $derived.by(() => {
    if (!rootEl || typeof getComputedStyle !== 'function') return 180
    return parseMs(getComputedStyle(rootEl).getPropertyValue('--ss-dur-fast')) ?? 180
  })
  const flyDuration = $derived(reduce ? 0 : tokenDuration)
  // Bottom anchors slide in from below; centered ones come straight down/up.
  // `left`/`right` positions are logical (inline start/end), so in RTL the
  // horizontal slide mirrors with them.
  const rtl = $derived(
    !!rootEl &&
      typeof getComputedStyle === 'function' &&
      getComputedStyle(rootEl).direction === 'rtl',
  )
  const flyX = $derived(
    position.endsWith('center') ? 0 : (position.endsWith('left') ? -16 : 16) * (rtl ? -1 : 1),
  )
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
      const el = e.currentTarget as HTMLElement
      if (hoverId !== t.id && !el.contains(document.activeElement)) toasts.resume(t.id)
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

  // ── pause / resume ────────────────────────────────────────────────
  // Hover OR keyboard focus holds the timer; it only runs again once the
  // pointer has left AND focus is outside the toast (a pointerleave must not
  // restart the clock under a keyboard user, and vice versa).
  let hoverId: number | null = null

  function onPointerEnter(t: Toast) {
    hoverId = t.id
    toasts.pause(t.id)
  }

  function onPointerLeave(e: PointerEvent, t: Toast) {
    if (hoverId === t.id) hoverId = null
    if (dragId === t.id) return
    const el = e.currentTarget as HTMLElement
    if (el.contains(document.activeElement)) return
    toasts.resume(t.id)
  }

  function onFocusOut(e: FocusEvent, t: Toast) {
    const el = e.currentTarget as HTMLElement
    if (el.contains(e.relatedTarget as Node | null)) return
    if (hoverId === t.id || dragId === t.id) return
    toasts.resume(t.id)
  }

  // ── focus management ──────────────────────────────────────────────
  // Dismissing the toast that holds focus would drop focus to <body>. Before
  // the node goes, move focus to a neighbouring toast, or back to where focus
  // came from before it entered the stack.
  // Plain (non-reactive) bookkeeping: read only inside the pre-effect below.
  // eslint-disable-next-line svelte/prefer-svelte-reactivity
  const toastEls = new Map<number, HTMLElement>()
  let order: number[] = []
  let returnFocus: HTMLElement | null = null

  function track(id: number) {
    return (el: HTMLElement) => {
      toastEls.set(id, el)
      return () => {
        if (toastEls.get(id) === el) toastEls.delete(id)
      }
    }
  }

  function onRootFocusIn(e: FocusEvent) {
    const from = e.relatedTarget as HTMLElement | null
    if (from && rootEl && !rootEl.contains(from)) returnFocus = from
  }

  $effect.pre(() => {
    const ids = toasts.items.map((t) => t.id)
    untrack(() => {
      const alive = new Set(ids)
      const active = typeof document === 'undefined' ? null : document.activeElement
      if (active && rootEl?.contains(active)) {
        const holder = order.find((id) => !alive.has(id) && toastEls.get(id)?.contains(active))
        if (holder !== undefined) moveFocusFrom(holder, alive)
      }
      order = ids
    })
  })

  function moveFocusFrom(id: number, alive: Set<number>) {
    const i = order.indexOf(id)
    const after = order.slice(i + 1).find((n) => alive.has(n) && toastEls.has(n))
    const before = order
      .slice(0, i)
      .reverse()
      .find((n) => alive.has(n) && toastEls.has(n))
    const next = after ?? before
    if (next !== undefined) {
      toastEls.get(next)!.focus()
    } else if (returnFocus?.isConnected) {
      returnFocus.focus()
      returnFocus = null
    }
  }

  // Screen-reader announcements go through two live regions that are always
  // rendered (a node inserted already carrying role=status/alert is often
  // skipped by NVDA/JAWS). Each visible toast mirrors its message into the
  // polite (status) or assertive (alert, errors) region; the visual toasts
  // themselves carry no live semantics, so nothing is announced twice.
  const politeItems = $derived(toasts.items.filter((t) => t.kind !== 'error'))
  const assertiveItems = $derived(toasts.items.filter((t) => t.kind === 'error'))
</script>

<div
  class="ss-toaster"
  role="region"
  aria-label="Notifications"
  data-position={position}
  data-size-variant={resolveComponentSize('Toaster', size)}
  bind:this={rootEl}
  onfocusin={onRootFocusIn}
>
  <div class="live" role="status" aria-live="polite">
    {#each politeItems as t (t.id)}<p>{t.message}</p>{/each}
  </div>
  <div class="live" role="alert" aria-live="assertive">
    {#each assertiveItems as t (t.id)}<p>{t.message}</p>{/each}
  </div>
  {#each toasts.items as t (t.id)}
    <!-- The pointer/key handlers are progressive extras (pause, swipe, Escape); the buttons inside are the real controls. -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      class="ss-toast {t.kind}"
      class:dragging={dragId === t.id}
      role="group"
      aria-labelledby="{uid}-msg-{t.id}"
      tabindex="-1"
      {@attach track(t.id)}
      style:transform={dragId === t.id ? `translateX(${dragDx}px)` : undefined}
      style:opacity={dragId === t.id ? Math.max(0.3, 1 - Math.abs(dragDx) / 200) : undefined}
      transition:fly={{ x: flyX, y: flyY, duration: flyDuration }}
      onpointerenter={() => onPointerEnter(t)}
      onpointerleave={(e) => onPointerLeave(e, t)}
      onfocusin={() => toasts.pause(t.id)}
      onfocusout={(e) => onFocusOut(e, t)}
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
      <span class="msg" id="{uid}-msg-{t.id}">{t.message}</span>
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
    max-inline-size: min(360px, calc(100vw - var(--ss-s-8)));
    pointer-events: none;

    // ── position anchors (read the existing --ss-s-* tokens) ──────────
    // `left`/`right` are logical: they anchor to the inline start/end edge, so
    // the stack mirrors under dir="rtl". Centred stacks stay physically centred.
    top: var(--ss-s-4);
    inset-inline-end: var(--ss-s-4);

    &[data-position='top-left'] {
      inset-inline: var(--ss-s-4) auto;
    }
    &[data-position='bottom-right'] {
      top: auto;
      bottom: var(--ss-s-4);
      flex-direction: column-reverse;
    }
    &[data-position='bottom-left'] {
      top: auto;
      bottom: var(--ss-s-4);
      inset-inline: var(--ss-s-4) auto;
      flex-direction: column-reverse;
    }
    &[data-position='top-center'] {
      inset-inline: auto;
      left: 50%;
      transform: translateX(-50%);
    }
    &[data-position='bottom-center'] {
      top: auto;
      bottom: var(--ss-s-4);
      inset-inline: auto;
      left: 50%;
      transform: translateX(-50%);
      flex-direction: column-reverse;
    }

    // Persistent live regions — visually hidden, always in the DOM.
    .live {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
      border: 0;
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
    border-inline-start: 3px solid var(--ss-fg-faint);
    box-shadow: var(--ss-shadow-pop);
    font-family: var(--ss-font-mono);
    font-size: var(--ss-ui-md);
    color: var(--ss-fg);
    touch-action: pan-y;
    outline: none;

    &:focus-visible {
      border-color: var(--ss-line-strong);
      box-shadow:
        var(--ss-shadow-pop),
        0 0 0 2px var(--ss-primary);
    }
    &:not(.dragging) {
      transition: transform var(--ss-dur-fast) var(--ss-ease);
    }

    &.success {
      border-inline-start-color: var(--ss-primary);
    }
    &.error {
      border-inline-start-color: var(--ss-red);
    }
    &.info {
      border-inline-start-color: var(--ss-cyan);
    }
    &.loading {
      border-inline-start-color: var(--ss-fg-faint);
    }

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
    &.success .ic {
      background: var(--ss-primary);
    }
    &.error .ic {
      background: var(--ss-red);
    }
    &.info .ic {
      background: var(--ss-cyan);
    }

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

    .msg {
      flex: 1;
      line-height: 1.3;
    }

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

      &:hover {
        background: var(--ss-hover);
        border-color: var(--ss-fg-faint);
      }
      &:focus-visible {
        outline: 2px solid var(--ss-primary);
        outline-offset: 1px;
      }
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
      // 24×24 hit area (WCAG 2.5.8) without growing the glyph.
      display: inline-grid;
      place-items: center;
      min-inline-size: var(--ss-s-6);
      min-block-size: var(--ss-s-6);

      &:hover {
        color: var(--ss-fg);
      }
      &:focus-visible {
        outline: 2px solid var(--ss-primary);
        outline-offset: 1px;
      }
    }
  }

  @keyframes ss-toast-spin {
    to {
      transform: rotate(360deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .ss-toast .spinner {
      animation: none;
      border-color: var(--ss-cyan);
    }
  }
</style>
