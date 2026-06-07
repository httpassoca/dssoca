<script lang="ts">
  import { fly } from 'svelte/transition'
  import { toasts, type ToastKind } from '../toast.svelte.js'
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props {
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
  }

  let { size }: Props = $props()

  const glyph: Record<ToastKind, string> = { success: '✓', error: '✕', info: 'i' }
</script>

<div class="ss-toaster" role="region" aria-live="polite" aria-label="Notifications" data-size-variant={resolveComponentSize('Toaster', size)}>
  {#each toasts.items as t (t.id)}
    <output class="ss-toast {t.kind}" transition:fly={{ x: 16, duration: 180 }}>
      <span class="ic">{glyph[t.kind]}</span>
      <span class="msg">{t.message}</span>
      <button class="x" type="button" aria-label="Dismiss" onclick={() => toasts.dismiss(t.id)}>×</button>
    </output>
  {/each}
</div>

<style lang="scss">
  .ss-toaster {
    position: fixed;
    top: var(--ss-s-4);
    right: var(--ss-s-4);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: var(--ss-s-2);
    max-width: min(360px, calc(100vw - var(--ss-s-8)));
    pointer-events: none;
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

    &.success { border-left-color: var(--ss-primary); }
    &.error   { border-left-color: var(--ss-red); }
    &.info    { border-left-color: var(--ss-cyan); }

    .ic {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      font-size: var(--ss-ui-sm);
      color: var(--ss-fg-on-primary);
      flex: none;
    }
    &.success .ic { background: var(--ss-primary); }
    &.error .ic   { background: var(--ss-red); }
    &.info .ic    { background: var(--ss-cyan); }
    .msg { flex: 1; line-height: 1.3; }
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
    }
  }
</style>
