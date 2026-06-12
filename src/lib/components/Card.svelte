<script lang="ts">
  import type { Snippet } from 'svelte'
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props {
    /** Heading text, or a Snippet for inline icons/badges in the title. */
    title?: string | Snippet
    /** Secondary label rendered to the right of the title. */
    meta?: string
    /** Muted description rendered under the heading. */
    description?: string
    /** Header controls (buttons, menus) rendered to the right. */
    action?: Snippet
    /** Full-bleed visual rendered above the head (zero side padding). */
    media?: Snippet
    /** Footer band mirroring the head, rendered only when provided. */
    footer?: Snippet
    children: Snippet
    /** Makes the whole card a primary link to this href. */
    href?: string
    /** Makes the whole card clickable; pairs with keyboard activation. */
    onclick?: (e: MouseEvent | KeyboardEvent) => void
    /** Surface style: outlined (default) or elevated (shadow tokens). */
    variant?: 'outlined' | 'elevated'
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
    /** Heading level for the title (aria-level), for correct document outline. */
    titleLevel?: number
  }
  let {
    title,
    meta,
    description,
    action,
    media,
    footer,
    children,
    href,
    onclick,
    variant = 'outlined',
    size,
    titleLevel = 3,
  }: Props = $props()

  // A stable id so the region can be labelled by its title for assistive tech.
  const titleId = $props.id()

  const isTitleSnippet = $derived(typeof title === 'function')
  const interactive = $derived(Boolean(href || onclick))

  function onKeydown(e: KeyboardEvent) {
    if (onclick && !href && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      onclick(e)
    }
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -- role is set to "button" in the same condition -->
<div
  class="ss-card"
  class:elevated={variant === 'elevated'}
  class:interactive
  data-size-variant={resolveComponentSize('Card', size)}
  role={interactive && !href ? 'button' : undefined}
  tabindex={interactive && !href ? 0 : undefined}
  aria-labelledby={title ? titleId : undefined}
  onclick={!href ? onclick : undefined}
  onkeydown={!href ? onKeydown : undefined}
>
  {#if media}
    <div class="media">{@render media()}</div>
  {/if}
  {#if title || meta || description || action}
    <div class="head">
      <div class="heading">
        <div class="title" id={titleId} role="heading" aria-level={titleLevel}>
          {#if isTitleSnippet}
            {@render (title as Snippet)()}
          {:else}
            {title}
          {/if}
        </div>
        {#if description}<div class="desc">{description}</div>{/if}
      </div>
      <div class="actions">
        {#if meta}<div class="meta">{meta}</div>{/if}
        {#if action}{@render action()}{/if}
      </div>
    </div>
  {/if}
  <div class="body">
    {@render children()}
  </div>
  {#if footer}
    <div class="foot">{@render footer()}</div>
  {/if}
  {#if href}
    <a
      class="overlay"
      {href}
      {onclick}
      onkeydown={onKeydown}
      aria-labelledby={title ? titleId : undefined}
    >
      <span class="sr-only">{typeof title === 'string' ? title : 'Open'}</span>
    </a>
  {/if}
</div>

<style lang="scss">
  .ss-card {
    position: relative;
    border: 1px solid var(--ss-line);
    background: var(--ss-bg-elev);
    border-radius: 0;

    &.elevated {
      border-color: transparent;
      box-shadow: var(--ss-shadow-1);
    }

    &.interactive {
      cursor: pointer;
      transition:
        box-shadow var(--ss-dur-fast) var(--ss-ease),
        border-color var(--ss-dur-fast) var(--ss-ease);

      &:hover {
        border-color: var(--ss-line-strong);
      }
      &.elevated:hover {
        box-shadow: var(--ss-shadow-2);
      }
      &:focus-within {
        border-color: var(--ss-line-strong);
      }
    }
  }

  .media {
    // Full-bleed: zero side padding, sits above the head.
    display: block;
    line-height: 0;
    :global(img),
    :global(svg),
    :global(video) {
      display: block;
      width: 100%;
    }
  }

  .head {
    padding: var(--ss-panel-head-py) var(--ss-panel-head-px);
    border-bottom: 1px solid var(--ss-line);
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--ss-gap-sm);
    font-family: var(--ss-font-mono);
    font-size: var(--ss-ui-sm);
    color: var(--ss-fg-faint);
    text-transform: uppercase;
    letter-spacing: 0.06em;

    .heading {
      display: flex;
      flex-direction: column;
      gap: var(--ss-s-1);
      min-width: 0;
    }
    .title {
      color: var(--ss-fg);
      letter-spacing: 0.06em;
    }
    .desc {
      color: var(--ss-fg-muted);
      text-transform: none;
      letter-spacing: normal;
      font-family: var(--ss-font-body);
    }
    .meta {
      color: var(--ss-fg-faint);
      text-transform: lowercase;
      letter-spacing: 0.04em;
    }
  }

  // Header controls sit above the link overlay so nested controls stay clickable.
  .actions {
    position: relative;
    z-index: 1;
    display: flex;
    gap: var(--ss-gap);
    align-items: center;
  }

  .body {
    padding: var(--ss-panel-body-py) var(--ss-panel-body-px);
  }

  .foot {
    position: relative;
    z-index: 1;
    padding: var(--ss-panel-head-py) var(--ss-panel-head-px);
    border-top: 1px solid var(--ss-line);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ss-gap-sm);
    font-family: var(--ss-font-mono);
    font-size: var(--ss-ui-sm);
    color: var(--ss-fg-faint);
  }

  // Single primary link spanning the whole card via an ::after overlay.
  .overlay {
    position: static;
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      z-index: 0;
    }
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
  }
</style>
