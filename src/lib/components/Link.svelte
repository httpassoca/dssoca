<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAnchorAttributes } from 'svelte/elements'
  import { resolveComponentSize, type Size } from '../config.js'
  import Icon from './Icon.svelte'

  interface Props extends HTMLAnchorAttributes {
    /** Visual treatment: `inline` (animated underline) or `button` (solid primary). */
    variant?: 'inline' | 'button'
    /**
     * Open in a new tab with safe `rel`. Auto-detected for absolute http(s)
     * URLs when left undefined; pass `false` to force same-tab even off-site.
     */
    external?: boolean
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
    /** Destination URL. */
    href?: string
    children?: Snippet
    /** Bound reference to the underlying <a>. */
    el?: HTMLAnchorElement
  }

  let {
    variant = 'inline',
    external,
    size,
    href,
    children,
    el = $bindable(),
    target,
    rel,
    ...rest
  }: Props = $props()

  // Off-site detection: absolute http(s) URL, or a protocol-relative one.
  // Honoured only when `external` is left undefined (explicit wins).
  const looksExternal = $derived(
    typeof href === 'string' && /^(https?:)?\/\//i.test(href),
  )
  const isExternal = $derived(external ?? looksExternal)

  // External links open in a new tab and carry the security rel; callers can
  // still override target/rel explicitly via the forwarded attributes.
  const resolvedTarget = $derived(target ?? (isExternal ? '_blank' : undefined))
  const resolvedRel = $derived(rel ?? (isExternal ? 'noopener noreferrer' : undefined))
</script>

<a
  bind:this={el}
  {href}
  class="ss-link {variant}"
  class:external={isExternal}
  data-size-variant={resolveComponentSize('Link', size)}
  target={resolvedTarget}
  rel={resolvedRel}
  {...rest}
>
  {#if children}<span class="label">{@render children()}</span>{/if}
  {#if isExternal}
    <Icon name="external" {size} class="ss-link-ext" />
    <span class="sr-only"> (opens in a new tab)</span>
  {/if}
</a>

<style lang="scss">
  .ss-link {
    font-family: var(--ss-font-body);
    font-weight: 600;
    color: var(--ss-primary);
    text-decoration: none;
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: var(--ss-gap-sm);
    cursor: pointer;
    transition: color var(--ss-dur-fast) var(--ss-ease);

    &:focus-visible {
      outline: 2px solid var(--ss-primary);
      outline-offset: 2px;
    }
  }

  /* ── inline: animated underline that reveals on hover/focus, with a glow ── */
  .ss-link.inline {
    .label {
      position: relative;

      // The reveal/glow underline. A pseudo-element (not text-decoration) so it
      // can grow in weight and cast a primary-tinted glow on hover/focus.
      &::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: -1px;
        height: 1px;
        background: var(--ss-primary);
        // Reveal from the leading edge; collapse to 0 width when idle.
        transform: scaleX(0);
        transform-origin: left center;
        transition:
          transform var(--ss-dur-slow) var(--ss-ease),
          height var(--ss-dur-fast) var(--ss-ease),
          box-shadow var(--ss-dur-slow) var(--ss-ease);
      }
    }

    &:hover .label::after,
    &:focus-visible .label::after {
      transform: scaleX(1);
      height: 2px;
      box-shadow: var(--ss-shadow-glow);
    }

    &:visited {
      color: var(--ss-fg-muted);
    }
    &:visited .label::after {
      background: var(--ss-fg-muted);
    }
  }

  /* ── button: a link that looks like a solid primary button (no underline) ── */
  .ss-link.button {
    font-weight: 600;
    color: var(--ss-fg-on-primary);
    background: var(--ss-primary);
    border: 1px solid var(--ss-primary);
    padding: var(--ss-control-py) var(--ss-control-px);
    line-height: 1;
    transition:
      background var(--ss-dur-fast) var(--ss-ease),
      border-color var(--ss-dur-fast) var(--ss-ease),
      box-shadow var(--ss-dur-fast) var(--ss-ease);

    &:hover {
      background: var(--ss-primary-hover);
      border-color: var(--ss-primary-hover);
      box-shadow: var(--ss-shadow-glow);
    }
    // No underline treatment for the button variant.
    .label::after {
      display: none;
    }
    &:visited {
      color: var(--ss-fg-on-primary);
    }
  }

  // The trailing external-link glyph tracks the text colour.
  :global(.ss-link .ss-link-ext) {
    color: currentColor;
  }

  // Visually-hidden but announced — clarifies that the link opens a new tab.
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
