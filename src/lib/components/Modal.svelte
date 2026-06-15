<script lang="ts">
  // ─────────────────────────────────────────────────────────────────────────
  // Modal (DS-0094). Built on the native <dialog> element so the platform
  // hands us a focus trap, Esc-to-close and an inert ::backdrop for free.
  //
  // `open` is $bindable; an $effect mirrors it onto the dialog via
  // showModal()/close(). The dialog's native `close` event syncs `open` back
  // to false and fires `onclose`. Esc is native; when `closeOnEsc` is false we
  // intercept the `cancel` event and preventDefault(). Backdrop click closes
  // when `closeOnBackdrop` by detecting a pointerdown whose target IS the
  // dialog itself (the inner .panel covers the dialog's content box, so any
  // hit on the dialog element is the surrounding backdrop area).
  //
  // Zero radius; surface = --ss-bg-elev, border = --ss-line; tinted ::backdrop.
  // Component metrics are inline var(--ss-modal-*, fallback) so no global SCSS
  // is touched (DS-0094).
  // ─────────────────────────────────────────────────────────────────────────
  import type { Snippet } from 'svelte'
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props {
    /** Whether the modal is shown. Bindable — sync it from caller state. */
    open?: boolean
    /** Title rendered in the header; also wires `aria-labelledby`. */
    title?: string
    /** Token size (sm|md|lg); controls max-width. Inherits the global size when unset. */
    size?: Size
    /** Clicking the backdrop (outside the panel) closes the modal. @default true */
    closeOnBackdrop?: boolean
    /** Esc closes the modal. When false, Esc is swallowed (cancel prevented). @default true */
    closeOnEsc?: boolean
    /** Styling hint for destructive dialogs (tints the accent rail/title). @default false */
    danger?: boolean
    /** Accessible name when no `title` is set (maps to aria-label on the dialog). */
    'aria-label'?: string
    /** Called after the dialog has closed (any reason: Esc, backdrop, button). */
    onclose?: () => void
    /** Header content; replaces the default title row when provided. */
    header?: Snippet
    /** Footer content (typically action buttons). */
    footer?: Snippet
    /** Body content. */
    children: Snippet
  }

  let {
    open = $bindable(false),
    title,
    size,
    closeOnBackdrop = true,
    closeOnEsc = true,
    danger = false,
    'aria-label': ariaLabel,
    onclose,
    header,
    footer,
    children,
  }: Props = $props()

  let dialog = $state<HTMLDialogElement | null>(null)

  // Stable id so the dialog's `aria-labelledby` can point at the title element.
  const uid = $props.id()
  const titleId = $derived(`${uid}-title`)

  // Mirror `open` onto the native dialog. showModal()/close() throw if called
  // in the wrong state, so guard on dialog.open before flipping it.
  $effect(() => {
    const el = dialog
    if (!el) return
    if (open && !el.open) el.showModal()
    else if (!open && el.open) el.close()
  })

  // Native `close` (Esc, form method=dialog, .close()) → sync state + notify.
  function onDialogClose() {
    if (open) open = false
    onclose?.()
  }

  // Esc dispatches `cancel` before `close`; swallow it when Esc is disabled.
  function onCancel(e: Event) {
    if (!closeOnEsc) e.preventDefault()
  }

  // A pointerdown landing on the <dialog> itself (not the inner .panel) is a
  // backdrop hit. Using pointerdown avoids closing on a drag that began inside
  // the panel and released on the backdrop.
  function onPointerDown(e: PointerEvent) {
    if (!closeOnBackdrop) return
    if (e.target === dialog) open = false
  }
</script>

<dialog
  bind:this={dialog}
  class="ss-modal"
  class:danger
  data-size-variant={resolveComponentSize('Modal', size)}
  aria-labelledby={title ? titleId : undefined}
  aria-label={title ? undefined : ariaLabel}
  onclose={onDialogClose}
  oncancel={onCancel}
  onpointerdown={onPointerDown}
>
  <div class="panel">
    <header class="head">
      {#if header}
        {@render header()}
      {:else if title}
        <h2 class="title" id={titleId}>{title}</h2>
      {/if}
      <button type="button" class="close" aria-label="Close" onclick={() => (open = false)}
        >×</button
      >
    </header>

    <div class="body">
      {@render children()}
    </div>

    {#if footer}
      <footer class="foot">
        {@render footer()}
      </footer>
    {/if}
  </div>
</dialog>

<style lang="scss">
  // Native <dialog> ships UA defaults (margin, padding, border, max sizing) —
  // reset them so the token-driven surface is the only chrome.
  .ss-modal {
    padding: 0;
    border: 1px solid var(--ss-line);
    background: var(--ss-bg-elev);
    color: var(--ss-fg);
    box-shadow: var(--ss-shadow-pop);
    // Centred, capped width per size variant; never overflow the viewport.
    width: var(--ss-modal-w, 32rem);
    max-width: var(--ss-modal-max, calc(100vw - var(--ss-s-8)));
    max-height: var(--ss-modal-max-h, calc(100vh - var(--ss-s-16)));
    margin: auto;
    overflow: hidden; // .body owns the scroll

    &::backdrop {
      background: var(--ss-modal-backdrop, rgba(0, 0, 0, 0.62));
    }

    // size axis → max-width only (chrome metrics stay constant).
    &[data-size-variant='sm'] {
      --ss-modal-w: 24rem;
    }
    &[data-size-variant='lg'] {
      --ss-modal-w: 48rem;
    }
  }

  .panel {
    display: flex;
    flex-direction: column;
    max-height: inherit;
  }

  .head {
    display: flex;
    align-items: center;
    gap: var(--ss-modal-head-gap, var(--ss-s-3));
    padding: var(--ss-modal-pad-y, var(--ss-s-4)) var(--ss-modal-pad-x, var(--ss-s-5));
    border-bottom: 1px solid var(--ss-line);
  }

  .title {
    flex: 1 1 auto;
    margin: 0;
    min-width: 0;
    font-family: var(--ss-font-display, var(--ss-font-body));
    font-size: var(--ss-modal-title, var(--ss-size-h3));
    line-height: 1.2;
    color: var(--ss-fg);
  }

  // The accent for destructive dialogs lives on the title (no extra chrome).
  .ss-modal.danger .title {
    color: var(--ss-danger);
  }

  .close {
    flex: none;
    margin-left: auto;
    appearance: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--ss-modal-close, var(--ss-s-8));
    height: var(--ss-modal-close, var(--ss-s-8));
    padding: 0;
    background: transparent;
    border: 1px solid transparent;
    color: var(--ss-fg-muted);
    font-size: var(--ss-size-h3);
    line-height: 1;
    cursor: pointer;
    transition:
      color var(--ss-dur-fast) var(--ss-ease),
      border-color var(--ss-dur-fast) var(--ss-ease);

    &:hover {
      color: var(--ss-fg);
      border-color: var(--ss-line-strong);
    }
    &:focus-visible {
      outline: 2px solid var(--ss-primary);
      outline-offset: 2px;
      color: var(--ss-fg);
    }
  }

  .body {
    padding: var(--ss-modal-pad-y, var(--ss-s-4)) var(--ss-modal-pad-x, var(--ss-s-5));
    overflow: auto;
    color: var(--ss-fg);
    font-family: var(--ss-font-body);
    line-height: var(--ss-leading, 1.5);
  }

  .foot {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--ss-modal-foot-gap, var(--ss-s-2));
    padding: var(--ss-modal-pad-y, var(--ss-s-4)) var(--ss-modal-pad-x, var(--ss-s-5));
    border-top: 1px solid var(--ss-line);
  }
</style>
