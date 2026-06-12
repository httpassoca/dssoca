<script lang="ts">
  import type { Snippet } from 'svelte'
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props {
    variant?: 'empty' | 'error' | 'no-results'
    title: string
    message?: string
    /** Decorative glyph fallback when no `visual` snippet is given. */
    icon?: string
    /** Visual slot — drop in an <Icon>, illustration or <img>; rendered aria-hidden. */
    visual?: Snippet
    action?: Snippet
    /** Secondary, lower-emphasis action rendered beside the primary one. */
    secondaryAction?: Snippet
    /** Low-emphasis footer (tertiary links) rendered below everything. */
    footer?: Snippet
    /**
     * Accessible name for the live region (DS-0078) — distinguishes multiple
     * status/alert regions on one page. Optional; the visible `title` already
     * provides the content.
     */
    ariaLabel?: string
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
    /** Heading level for the title (aria-level). `false` renders a plain <p> with no heading role. */
    headingLevel?: number | false
    /** Compact density — drops padding and shrinks the title for inline/cell use. */
    compact?: boolean
    /** Remove the centered max-width cap and span the container. */
    fullWidth?: boolean
  }
  let {
    variant = 'empty',
    title,
    message,
    icon,
    visual,
    action,
    secondaryAction,
    footer,
    ariaLabel,
    size,
    headingLevel = 2,
    compact = false,
    fullWidth = false,
  }: Props = $props()

  // error → assertive alert; everything else announces politely without moving focus (WCAG 4.1.3).
  const role = $derived(variant === 'error' ? 'alert' : 'status')
</script>

<div
  class="ss-empty {variant}"
  class:compact
  class:full-width={fullWidth}
  data-size-variant={resolveComponentSize('EmptyState', size)}
  {role}
  aria-label={ariaLabel}
  aria-atomic="true"
>
  {#if visual}
    <div class="ic" aria-hidden="true">{@render visual()}</div>
  {:else if icon}
    <div class="ic glyph" aria-hidden="true">{icon}</div>
  {/if}
  {#if headingLevel === false}
    <p class="title">{title}</p>
  {:else}
    <p class="title" role="heading" aria-level={headingLevel}>{title}</p>
  {/if}
  {#if message}<p class="msg">{message}</p>{/if}
  {#if action || secondaryAction}
    <div class="act">
      {#if action}{@render action()}{/if}
      {#if secondaryAction}{@render secondaryAction()}{/if}
    </div>
  {/if}
  {#if footer}<div class="foot">{@render footer()}</div>{/if}
</div>

<style lang="scss">
  .ss-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--ss-s-3);
    text-align: center;
    padding: var(--ss-s-12) var(--ss-s-4);
    max-width: var(--ss-empty-max-w);
    margin-inline: auto;

    &.full-width {
      max-width: none;
    }

    .ic {
      line-height: 1;
      margin-bottom: var(--ss-s-1);
    }
    .ic.glyph {
      font-size: var(--ss-empty-glyph);
    }
    .title {
      margin: 0;
      font-family: var(--ss-font-display);
      font-size: var(--ss-size-h2);
      color: var(--ss-fg);
    }
    &.error .title {
      color: var(--ss-red);
    }
    .msg {
      margin: 0;
      color: var(--ss-fg-muted);
      font-size: var(--ss-ui-md);
      max-width: 40ch;
      line-height: var(--ss-leading);
    }
    .act {
      margin-top: var(--ss-s-4);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--ss-s-3);
      flex-wrap: wrap;
    }
    .foot {
      margin-top: var(--ss-s-2);
      color: var(--ss-fg-faint);
      font-size: var(--ss-ui-sm);
    }

    // Compact / inline density — fits inside Card / table cells.
    &.compact {
      gap: var(--ss-s-2);
      padding: var(--ss-s-6) var(--ss-s-3);

      .title {
        font-size: var(--ss-size-h3);
      }
      .ic.glyph {
        font-size: var(--ss-empty-glyph-compact);
      }
      .act {
        margin-top: var(--ss-s-3);
      }
    }
  }
</style>
