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
    /**
     * Render the link inert (DS-0078): the `href` is dropped (no navigation,
     * out of the tab order), link semantics are kept via `role="link"`, and
     * the state is communicated to AT with `aria-disabled="true"`. Forwarded
     * `onclick` handlers do not fire while disabled.
     */
    disabled?: boolean
    children?: Snippet
    /** Bound reference to the underlying <a>. */
    el?: HTMLAnchorElement
  }

  let {
    variant = 'inline',
    external,
    size,
    href,
    disabled = false,
    children,
    el = $bindable(),
    target,
    rel,
    onclick,
    ...rest
  }: Props = $props()

  // Off-site detection: absolute http(s) URL, or a protocol-relative one.
  // Honoured only when `external` is left undefined (explicit wins).
  const looksExternal = $derived(typeof href === 'string' && /^(https?:)?\/\//i.test(href))
  // A disabled link gets no external affordances (it cannot navigate).
  const isExternal = $derived(!disabled && (external ?? looksExternal))

  // External links default to a new tab; an explicit `target` always wins.
  const resolvedTarget = $derived(target ?? (isExternal ? '_blank' : undefined))
  // The new-tab safeguards follow the RESOLVED target, not `isExternal`: any
  // link that opens a new tab (auto-detected or an explicit target="_blank")
  // gets `noopener noreferrer` and the "opens in a new tab" hint.
  const opensNewTab = $derived(!disabled && resolvedTarget?.toLowerCase() === '_blank')
  // Merge rather than replace: a caller's `rel` tokens are kept and the
  // security tokens are appended when missing.
  const resolvedRel = $derived.by(() => {
    const tokens = (rel ?? '').split(/\s+/).filter(Boolean)
    if (opensNewTab) {
      for (const t of ['noopener', 'noreferrer']) {
        if (!tokens.some((x) => x.toLowerCase() === t)) tokens.push(t)
      }
    }
    return tokens.length ? tokens.join(' ') : undefined
  })

  // Swallow activation while disabled; otherwise defer to a forwarded onclick.
  function handleClick(e: MouseEvent) {
    if (disabled) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    onclick?.(e as MouseEvent & { currentTarget: EventTarget & HTMLAnchorElement })
  }
</script>

<a
  bind:this={el}
  href={disabled ? undefined : href}
  class="ss-link {variant}"
  class:external={isExternal}
  class:disabled
  role={disabled ? 'link' : undefined}
  aria-disabled={disabled ? 'true' : undefined}
  tabindex={disabled ? -1 : undefined}
  data-size-variant={resolveComponentSize('Link', size)}
  target={disabled ? undefined : resolvedTarget}
  rel={disabled ? undefined : resolvedRel}
  onclick={handleClick}
  {...rest}
>
  {#if children}<span class="label">{@render children()}</span>{/if}
  {#if isExternal}<Icon name="external" {size} class="ss-link-ext" />{/if}
  {#if opensNewTab}<span class="sr-only"> (opens in a new tab)</span>{/if}
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

    // Cancel theme.css's global `a::before` underline: the component draws its
    // own (inline variant) so it looks the same with or without theme.css.
    &::before {
      content: none;
    }

    &:focus-visible {
      outline: 2px solid var(--ss-primary);
      outline-offset: 2px;
    }

    // Disabled (DS-0078): inert — same dimming treatment as other controls.
    &.disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }
  }

  /* ── inline: always-underlined, thickening with a glow on hover/focus ── */
  .ss-link.inline {
    .label {
      position: relative;

      // The underline. A pseudo-element (not text-decoration) so it can grow in
      // weight and cast a primary-tinted glow on hover/focus. It is visible at
      // rest (1px) so inline links are never told apart by colour alone
      // (WCAG 1.4.1), even on the tokens.css-only path.
      &::after {
        content: '';
        position: absolute;
        inset-inline: 0;
        bottom: -1px;
        height: 1px;
        background: var(--ss-primary);
        transform: scaleX(1);
        transition:
          height var(--ss-dur-fast) var(--ss-ease),
          box-shadow var(--ss-dur-slow) var(--ss-ease);
      }
    }

    &:hover .label::after,
    &:focus-visible .label::after {
      height: 2px;
      box-shadow: var(--ss-shadow-glow);
    }

    // No underline reveal while disabled.
    &.disabled .label::after {
      display: none;
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
    // Disabled button-variant links keep the idle fill (no hover feedback).
    &.disabled:hover {
      background: var(--ss-primary);
      border-color: var(--ss-primary);
      box-shadow: none;
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
