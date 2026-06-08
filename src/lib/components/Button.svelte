<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props extends HTMLButtonAttributes {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    /** Loading state: shows a spinner, blocks clicks, sets aria-busy; stays focusable. */
    loading?: boolean
    /** Accessible name while loading (keeps the name stable when the label is hidden). */
    loadingLabel?: string
    onclick?: (e: MouseEvent) => void
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
    /** Icon-only square button — `label` is required and becomes the aria-label. */
    iconOnly?: boolean
    /** Accessible name; required for icon-only buttons (→ aria-label). */
    label?: string
    /** Block-level: stretch to fill the inline axis and center the content. */
    fullWidth?: boolean
    /** Leading icon snippet, rendered before children. */
    leading?: Snippet
    /** Trailing icon snippet, rendered after children. */
    trailing?: Snippet
    children?: Snippet
    /** Bound reference to the underlying <button>. */
    el?: HTMLButtonElement
  }
  let {
    variant = 'secondary',
    type = 'button',
    disabled = false,
    loading = false,
    loadingLabel,
    onclick,
    size,
    iconOnly = false,
    label,
    fullWidth = false,
    leading,
    trailing,
    children,
    el = $bindable(),
    ...rest
  }: Props = $props()

  // Soft-disable: keep the control focusable/announceable via aria-disabled while
  // loading, but still emit native `disabled` so forms don't submit it.
  let busy = $derived(loading)
  let ariaLabel = $derived(iconOnly ? label : rest['aria-label'])
  let accessibleName = $derived(loading ? (loadingLabel ?? ariaLabel) : ariaLabel)

  function handleClick(e: MouseEvent) {
    if (loading || disabled) {
      e.preventDefault()
      e.stopImmediatePropagation()
      return
    }
    onclick?.(e)
  }
</script>

<button
  bind:this={el}
  class="ss-btn {variant}"
  class:icon-only={iconOnly}
  class:full-width={fullWidth}
  class:loading
  {type}
  {disabled}
  aria-busy={busy ? 'true' : undefined}
  aria-disabled={loading ? 'true' : undefined}
  aria-label={accessibleName}
  data-size-variant={resolveComponentSize('Button', size)}
  {...rest}
  onclick={handleClick}
>
  {#if loading}
    <span class="spinner" aria-hidden="true"></span>
  {/if}
  {#if leading}<span class="affix" aria-hidden="true">{@render leading()}</span>{/if}
  {#if children}<span class="label">{@render children()}</span>{/if}
  {#if trailing}<span class="affix" aria-hidden="true">{@render trailing()}</span>{/if}
</button>

<style lang="scss">
  .ss-btn {
    font-family: var(--ss-font-body); font-size: var(--ss-control-font); line-height: 1; font-weight: 500;
    padding: var(--ss-control-py) var(--ss-control-px);
    border: 1px solid var(--ss-line);
    background: transparent; color: var(--ss-fg);
    cursor: pointer; display: inline-flex; align-items: center; gap: var(--ss-gap-sm);
    transition: all var(--ss-dur-fast) var(--ss-ease);

    &:hover { background: var(--ss-hover); border-color: var(--ss-line-strong); }
    &.primary {
      background: var(--ss-primary); color: var(--ss-fg-on-primary); border-color: var(--ss-primary); font-weight: 600;
      &:hover { background: var(--ss-primary-hover); border-color: var(--ss-primary-hover); box-shadow: var(--ss-shadow-glow); }
    }
    &.danger {
      background: var(--ss-danger); color: var(--ss-fg-on-danger); border-color: var(--ss-danger); font-weight: 600;
      &:hover { background: var(--ss-danger-hover); border-color: var(--ss-danger-hover); }
    }
    &.ghost {
      border-color: transparent; color: var(--ss-fg-muted); padding: var(--ss-control-py) var(--ss-gap-sm);
      &:hover { color: var(--ss-fg); background: var(--ss-hover); border-color: transparent; }
    }

    /* Icon-only: square padding derived from the vertical control token. */
    &.icon-only {
      padding: var(--ss-control-py);
      gap: 0;
    }

    /* Block-level: fill the inline axis, center the content. */
    &.full-width {
      width: 100%;
      justify-content: center;
    }

    /* Soft-disabled while loading: keep focusable, dim, block the pointer. */
    &.loading {
      cursor: progress;
      opacity: 0.8;
    }
    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  .label { display: inline-flex; align-items: center; }

  .affix {
    display: inline-flex; align-items: center; justify-content: center;
    line-height: 0;
  }

  /* em-sized spinner so it tracks the button font; reduced-motion safe. */
  .spinner {
    display: inline-block;
    width: 1em; height: 1em;
    border: 2px solid currentColor;
    border-top-color: transparent;
    box-sizing: border-box;
    animation: ss-btn-spin var(--ss-dur-xslow) linear infinite;
  }

  @keyframes ss-btn-spin {
    to { transform: rotate(360deg); }
  }

  @media (prefers-reduced-motion: reduce) {
    .spinner { animation: none; }
  }
</style>
