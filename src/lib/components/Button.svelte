<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import { resolveComponentSize, resolveSpinnerVariant, type Size } from '../config.js'
  import type { SpinnerVariant } from '../config.js'
  import Spinner from './Spinner.svelte'

  interface Props extends HTMLButtonAttributes {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    /**
     * Loading state: shows a {@link Spinner}, blocks clicks, sets aria-busy;
     * stays focusable. `true` uses the configured default spinner variant; pass
     * a {@link SpinnerVariant} string to pick a specific glyph; `false`/omitted
     * is not loading.
     */
    loading?: boolean | SpinnerVariant
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

  // `loading` is a discriminated union: `true` → configured default variant; a
  // SpinnerVariant string → that variant; `false`/undefined → not loading.
  let isLoading = $derived(loading !== false && loading != null)
  // The size Button paints on its root, threaded down to nested Icon/Spinner so
  // the loading glyph tracks the button's tier (coordinated inner sizes).
  let resolvedSize = $derived(resolveComponentSize('Button', size))
  // An explicit variant string wins; `true` falls back to the house default.
  let spinnerVariant = $derived(
    typeof loading === 'string' ? loading : resolveSpinnerVariant(undefined),
  )

  // Soft-disable: keep the control focusable/announceable via aria-disabled while
  // loading, but still emit native `disabled` so forms don't submit it.
  let busy = $derived(isLoading)
  let ariaLabel = $derived(iconOnly ? label : rest['aria-label'])
  let accessibleName = $derived(isLoading ? (loadingLabel ?? ariaLabel) : ariaLabel)

  function handleClick(e: MouseEvent) {
    if (isLoading || disabled) {
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
  class:loading={isLoading}
  {type}
  {disabled}
  aria-busy={busy ? 'true' : undefined}
  aria-disabled={isLoading ? 'true' : undefined}
  aria-label={accessibleName}
  data-size-variant={resolvedSize}
  {...rest}
  onclick={handleClick}
>
  {#if isLoading}
    <!-- Shared Spinner, sized to the button's tier. Its own role="status" is
         suppressed (role/aria-hidden) so the button's name is the single
         announcement — no double live-region. -->
    <span class="affix" aria-hidden="true">
      <Spinner variant={spinnerVariant} size={resolvedSize} role={undefined} aria-hidden="true" />
    </span>
  {/if}
  {#if leading}<span class="affix" aria-hidden="true">{@render leading()}</span>{/if}
  {#if children}<span class="label">{@render children()}</span>{/if}
  {#if trailing}<span class="affix" aria-hidden="true">{@render trailing()}</span>{/if}
</button>

<style lang="scss">
  .ss-btn {
    font-family: var(--ss-font-body);
    font-size: var(--ss-control-font);
    // Own the line-box: the control height is padding + this line-box only, so it
    // stays invariant to the presence of icons (DS-0112). The text line-box is
    // 1em of the control font; pin it explicitly so the deterministic
    // min-height below matches the text-only case exactly.
    line-height: 1;
    // Deterministic control height = top+bottom padding + the text line-box.
    // A leading/trailing icon (sized to --ss-icon, which exceeds 1em of the
    // control font) is clamped to this line-box by `.affix` below, so it can
    // never make align-items:center grow the control taller than this.
    min-height: calc(var(--ss-control-font) + var(--ss-control-py) * 2);
    box-sizing: border-box;
    font-weight: 500;
    padding: var(--ss-control-py) var(--ss-control-px);
    border: 1px solid var(--ss-line);
    background: transparent;
    color: var(--ss-fg);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: var(--ss-gap-sm);
    transition: all var(--ss-dur-fast) var(--ss-ease);

    // Hover affordances are gated on :not(:disabled) so a disabled button never
    // brightens or glows on hover — disabled stays inert (dim, no lift). Browsers
    // still match :hover on a disabled <button>, so without this guard the
    // primary glow / fill would fire under the pointer even though the control
    // is non-interactive.
    &:not(:disabled):hover {
      background: var(--ss-hover);
      border-color: var(--ss-line-strong);
    }
    &.primary {
      background: var(--ss-primary);
      color: var(--ss-fg-on-primary);
      border-color: var(--ss-primary);
      font-weight: 600;
      &:not(:disabled):hover {
        background: var(--ss-primary-hover);
        border-color: var(--ss-primary-hover);
        box-shadow: var(--ss-shadow-glow);
      }
    }
    &.danger {
      background: var(--ss-danger);
      color: var(--ss-fg-on-danger);
      border-color: var(--ss-danger);
      font-weight: 600;
      &:not(:disabled):hover {
        background: var(--ss-danger-hover);
        border-color: var(--ss-danger-hover);
      }
    }
    &.ghost {
      border-color: transparent;
      color: var(--ss-fg-muted);
      padding: var(--ss-control-py) var(--ss-gap-sm);
      &:not(:disabled):hover {
        color: var(--ss-fg);
        background: var(--ss-hover);
        border-color: transparent;
      }
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
      box-shadow: none;
    }
  }

  .label {
    display: inline-flex;
    align-items: center;
  }

  /* Clamp the icon/spinner to the text line-box (1em of the control font) and
     centre it, so a glyph sized to --ss-icon (taller than 1em) never enlarges
     the line-box and grows the control (DS-0112). The icon stays visually
     centred; overflow stays visible so a slightly-taller glyph is not cropped,
     while the box's own height — what align-items:center measures — is the
     line-box. `min-height: 0` / `min-width: 0` defang the flex auto-min-size: as
     a flex ITEM of `.ss-btn`, `.affix` would otherwise take a content-based
     automatic minimum from the (taller) icon, which could override the explicit
     `height: 1em` and grow the control past its `min-height` floor. */
  .affix {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 1em;
    min-height: 0;
    min-width: 0;
    line-height: 0;
  }
</style>
