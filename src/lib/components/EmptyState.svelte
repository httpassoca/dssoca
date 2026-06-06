<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    variant?: 'empty' | 'error'
    title: string
    message?: string
    icon?: string
    action?: Snippet
  }
  let { variant = 'empty', title, message, icon, action }: Props = $props()
</script>

<div class="hub-empty {variant}">
  {#if icon}<div class="ic">{icon}</div>{/if}
  <p class="title">{title}</p>
  {#if message}<p class="msg">{message}</p>{/if}
  {#if action}<div class="act">{@render action()}</div>{/if}
</div>

<style>
  .hub-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--hs-s-3);
    text-align: center;
    padding: var(--hs-s-12) var(--hs-s-4);
  }
  .ic {
    font-size: 40px;
    line-height: 1;
    margin-bottom: var(--hs-s-1);
  }
  .title {
    margin: 0;
    font-family: var(--hs-font-display);
    font-size: var(--hs-size-h2);
    color: var(--hs-fg);
  }
  .error .title { color: var(--hs-red); }
  .msg {
    margin: 0;
    color: var(--hs-fg-muted);
    font-size: var(--hs-ui-md);
    max-width: 40ch;
    line-height: var(--hs-leading);
  }
  .act { margin-top: var(--hs-s-4); }
</style>
