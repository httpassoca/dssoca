<script lang="ts">
  import type { Snippet } from 'svelte'
  import { resolveComponentSize, type Size } from '../config.js'

  type Tone = 'up' | 'deg' | 'down' | 'maint' | 'info' | 'neutral'

  interface Props {
    /** Semantic tone; `neutral` is the safe baseline for non-status labels. */
    tone?: Tone
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
    /** Render the leading status dot. Off by default — opt in per badge. */
    dot?: boolean
    /**
     * Optional numeric badge. When set, renders the count (clamped to `max`).
     * A `count` of 0 renders nothing.
     */
    count?: number
    /** Cap for `count`; values above render as `${max}+`. Defaults to 99. */
    max?: number
    /**
     * When set, treats the badge as a live status region
     * (`role="status"` + `aria-live="polite"`) so AT announces changes.
     * Static category tags stay plain spans.
     */
    live?: boolean
    /**
     * Accessible label. Required for dot-only / label-less badges so the
     * status isn't conveyed by colour alone (WCAG 1.4.1). Also names the
     * dismiss button's target.
     */
    label?: string
    /** When provided, renders a trailing, keyboard-focusable dismiss button. */
    ondismiss?: () => void
    /** Badge text. Optional: omit for a dot-only or count-only badge. */
    children?: Snippet
  }

  let {
    tone = 'info',
    size,
    dot = false,
    count,
    max = 99,
    live = false,
    label,
    ondismiss,
    children,
  }: Props = $props()

  // Numeric badge: clamp to max, hide entirely when zero.
  const showCount = $derived(count !== undefined && count !== 0)
  const countText = $derived(count === undefined ? '' : count > max ? `${max}+` : `${count}`)

  const hasLabel = $derived(children !== undefined)
  // Dot-only / count-only badges have no visible text → carry an aria-label so
  // the status isn't conveyed by colour alone (WCAG 1.4.1).
  const ariaLabel = $derived(!hasLabel ? label : undefined)
  // `live` wins (role=status). Otherwise a label-less badge needs a role for
  // its aria-label to be valid (a bare span + aria-label is prohibited); use
  // `img` so AT announces it as a single named status indicator.
  const role = $derived(live ? 'status' : !hasLabel ? 'img' : undefined)
</script>

<span
  class="ss-badge {tone}"
  class:label-less={!hasLabel}
  data-size-variant={resolveComponentSize('Badge', size)}
  {role}
  aria-live={live ? 'polite' : undefined}
  aria-label={ariaLabel}
>
  {#if dot}<span class="dot" aria-hidden="true"></span>{/if}
  {#if hasLabel}{@render children?.()}{/if}
  {#if showCount}<span class="count">{countText}</span>{/if}
  {#if ondismiss}
    <button
      class="x"
      type="button"
      aria-label={label ? `Remove ${label}` : 'Remove'}
      onclick={ondismiss}>×</button
    >
  {/if}
</span>

<style lang="scss">
  .ss-badge {
    font-family: var(--ss-font-mono);
    font-size: var(--ss-ui-xs);
    padding: var(--ss-badge-py) var(--ss-badge-px);
    letter-spacing: 0.05em;
    display: inline-flex;
    align-items: center;
    gap: var(--ss-badge-gap);
    text-transform: lowercase;
    border: 1px solid var(--ss-line);

    &.up {
      background: var(--ss-badge-up-bg);
      color: var(--ss-primary);
      border-color: var(--ss-badge-up-border);
    }
    &.deg {
      background: var(--ss-badge-deg-bg);
      color: var(--ss-yellow);
      border-color: var(--ss-badge-deg-border);
    }
    &.down {
      background: var(--ss-badge-down-bg);
      color: var(--ss-red);
      border-color: var(--ss-badge-down-border);
    }
    &.maint {
      background: var(--ss-badge-maint-bg);
      color: var(--ss-blue);
      border-color: var(--ss-badge-maint-border);
    }
    &.info {
      background: var(--ss-badge-info-bg);
      color: var(--ss-cyan);
      border-color: var(--ss-badge-info-border);
    }
    &.neutral {
      background: var(--ss-badge-neutral-bg);
      color: var(--ss-fg-muted);
      border-color: var(--ss-badge-neutral-border);
    }

    .dot {
      width: var(--ss-badge-dot);
      height: var(--ss-badge-dot);
      background: currentColor;
      flex: none;
    }

    // Numbers bypass the lowercase transform and align on tabular figures.
    .count {
      text-transform: none;
      font-variant-numeric: tabular-nums;
    }

    .x {
      flex: none;
      background: none;
      border: none;
      color: currentColor;
      cursor: pointer;
      font-size: var(--ss-size-sm);
      line-height: 1;
      padding: 0;
      margin-inline-start: calc(var(--ss-badge-gap) * -0.25);
      opacity: 0.8;

      &:hover,
      &:focus-visible {
        opacity: 1;
      }
    }
  }
</style>
