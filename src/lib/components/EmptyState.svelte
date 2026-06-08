<script lang="ts">
  import type { Snippet } from 'svelte'
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props {
    variant?: 'empty' | 'error'
    title: string
    message?: string
    icon?: string
    action?: Snippet
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
    /** Heading level for the title (aria-level), for correct document outline. */
    headingLevel?: number
  }
  let { variant = 'empty', title, message, icon, action, size, headingLevel = 2 }: Props = $props()
</script>

<div
  class="ss-empty {variant}"
  data-size-variant={resolveComponentSize('EmptyState', size)}
  role={variant === 'error' ? 'alert' : undefined}
>
  {#if icon}<div class="ic" aria-hidden="true">{icon}</div>{/if}
  <p class="title" role="heading" aria-level={headingLevel}>{title}</p>
  {#if message}<p class="msg">{message}</p>{/if}
  {#if action}<div class="act">{@render action()}</div>{/if}
</div>

<style lang="scss">
  .ss-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--ss-s-3);
    text-align: center;
    padding: var(--ss-s-12) var(--ss-s-4);

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
    &.error .title { color: var(--ss-red); }
    .msg {
      margin: 0;
      color: var(--ss-fg-muted);
      font-size: var(--ss-ui-md);
      max-width: 40ch;
      line-height: var(--ss-leading);
    }
    .act { margin-top: var(--ss-s-4); }
  }
</style>
