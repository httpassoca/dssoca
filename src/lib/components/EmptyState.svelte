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

<div class="ss-empty {variant}">
  {#if icon}<div class="ic">{icon}</div>{/if}
  <p class="title">{title}</p>
  {#if message}<p class="msg">{message}</p>{/if}
  {#if action}<div class="act">{@render action()}</div>{/if}
</div>

<style>
  .ss-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--ss-s-3);
    text-align: center;
    padding: var(--ss-s-12) var(--ss-s-4);
  }
  .ic {
    font-size: 40px;
    line-height: 1;
    margin-bottom: var(--ss-s-1);
  }
  .title {
    margin: 0;
    font-family: var(--ss-font-display);
    font-size: var(--ss-size-h2);
    color: var(--ss-fg);
  }
  .error .title { color: var(--ss-red); }
  .msg {
    margin: 0;
    color: var(--ss-fg-muted);
    font-size: var(--ss-ui-md);
    max-width: 40ch;
    line-height: var(--ss-leading);
  }
  .act { margin-top: var(--ss-s-4); }
</style>
