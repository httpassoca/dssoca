<script lang="ts">
  import { fly } from 'svelte/transition'
  import { toasts, type ToastKind } from '../toast.svelte.js'

  const glyph: Record<ToastKind, string> = { success: '✓', error: '✕', info: 'i' }
</script>

<div class="hub-toaster" role="region" aria-live="polite" aria-label="Notifications">
  {#each toasts.items as t (t.id)}
    <output class="hub-toast {t.kind}" transition:fly={{ x: 16, duration: 180 }}>
      <span class="ic">{glyph[t.kind]}</span>
      <span class="msg">{t.message}</span>
      <button class="x" type="button" aria-label="Dismiss" onclick={() => toasts.dismiss(t.id)}>×</button>
    </output>
  {/each}
</div>

<style>
  .hub-toaster {
    position: fixed;
    top: var(--hs-s-4);
    right: var(--hs-s-4);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: var(--hs-s-2);
    max-width: min(360px, calc(100vw - var(--hs-s-8)));
    pointer-events: none;
  }
  .hub-toast {
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: var(--hs-s-3);
    padding: var(--hs-s-3) var(--hs-s-4);
    background: var(--hs-bg-elev);
    border: 1px solid var(--hs-line);
    border-left: 3px solid var(--hs-fg-faint);
    box-shadow: var(--hs-shadow-pop);
    font-family: var(--hs-font-mono);
    font-size: var(--hs-ui-md);
    color: var(--hs-fg);
  }
  .hub-toast.success { border-left-color: var(--hs-primary); }
  .hub-toast.error   { border-left-color: var(--hs-red); }
  .hub-toast.info    { border-left-color: var(--hs-cyan); }
  .ic {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    font-size: var(--hs-ui-sm);
    color: var(--hs-fg-on-primary);
    flex: none;
  }
  .success .ic { background: var(--hs-primary); }
  .error .ic   { background: var(--hs-red); }
  .info .ic    { background: var(--hs-cyan); }
  .msg { flex: 1; line-height: 1.3; }
  .x {
    flex: none;
    background: none;
    border: none;
    color: var(--hs-fg-faint);
    cursor: pointer;
    font-size: var(--hs-size-h3);
    line-height: 1;
    padding: 0;
  }
  .x:hover { color: var(--hs-fg); }
</style>
