<script module lang="ts">
  import type { IconName } from './Icon.svelte'

  /** One option in a {@link SegmentedControl}. */
  export interface SegmentOption {
    value: string
    label: string
    /** Optional leading glyph. */
    icon?: IconName
    disabled?: boolean
  }
</script>

<script lang="ts">
  // ─────────────────────────────────────────────────────────────────────────
  // SegmentedControl — DS-0053. A compact row of mutually-exclusive options
  // (view / mode / locale). Generalizes the website's LanguageSwitcher to N
  // options. Highlighted selection (token fill, zero radius), bindable `value`,
  // `role="radiogroup"` with `role="radio"` segments, roving tabindex + arrow
  // / Home / End keyboard nav (skips disabled), size-token density.
  // ─────────────────────────────────────────────────────────────────────────
  import Icon from './Icon.svelte'
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props {
    /** Mutually-exclusive options: { value, label, icon?, disabled? }. */
    options?: SegmentOption[]
    /** Selected option value (bindable). */
    value?: string
    /** Fired when the selection changes (after `value` updates). */
    onChange?: (value: string) => void
    /** Stretch segments to equal widths and fill the container. */
    fullWidth?: boolean
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
    /**
     * Accessible name for the group. Required (WCAG 2.2 AA): a radiogroup with
     * no name leaves AT users without context for the choice.
     */
    label: string
  }

  let {
    options = [],
    value = $bindable(),
    onChange,
    fullWidth = false,
    size,
    label,
  }: Props = $props()

  // Bound references to each segment, indexed by option position, so keyboard
  // navigation can move focus across the roving-tabindex group.
  let segments = $state<(HTMLButtonElement | undefined)[]>([])

  const enabledIndexes = $derived(
    options.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0),
  )

  /** Index that owns the single tab stop (roving tabindex). The selected option
   *  when it's enabled; otherwise the first enabled option; -1 when none. */
  const tabbableIndex = $derived.by(() => {
    const sel = options.findIndex((o) => o.value === value && !o.disabled)
    if (sel >= 0) return sel
    return enabledIndexes[0] ?? -1
  })

  function select(index: number) {
    const opt = options[index]
    if (!opt || opt.disabled) return
    if (opt.value !== value) {
      value = opt.value
      onChange?.(opt.value)
    }
  }

  function focusIndex(index: number) {
    segments[index]?.focus()
  }

  /** Next/previous enabled option index, wrapping around the row. */
  function step(from: number, dir: 1 | -1): number {
    if (enabledIndexes.length === 0) return from
    const pos = enabledIndexes.indexOf(from)
    // `from` might be disabled (shouldn't be focusable) — fall back to an edge.
    const base = pos === -1 ? (dir === 1 ? -1 : 0) : pos
    const next = (base + dir + enabledIndexes.length) % enabledIndexes.length
    return enabledIndexes[next]
  }

  function onKeydown(e: KeyboardEvent, index: number) {
    let target = -1
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        target = step(index, 1)
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        target = step(index, -1)
        break
      case 'Home':
        target = enabledIndexes[0] ?? -1
        break
      case 'End':
        target = enabledIndexes[enabledIndexes.length - 1] ?? -1
        break
      default:
        return
    }
    if (target < 0) return
    e.preventDefault()
    // radiogroup semantics: moving focus also moves the selection.
    select(target)
    focusIndex(target)
  }

  const sizeAttr = $derived(resolveComponentSize('SegmentedControl', size))
</script>

<div
  class="ss-segmented"
  class:full={fullWidth}
  role="radiogroup"
  aria-label={label}
  data-size-variant={sizeAttr}
>
  {#each options as opt, i (opt.value)}
    {@const selected = opt.value === value}
    <button
      bind:this={segments[i]}
      type="button"
      class="segment"
      class:selected
      role="radio"
      aria-checked={selected}
      tabindex={i === tabbableIndex ? 0 : -1}
      disabled={opt.disabled}
      onclick={() => select(i)}
      onkeydown={(e) => onKeydown(e, i)}
    >
      {#if opt.icon}<Icon name={opt.icon} class="ic" />{/if}
      <span class="label">{opt.label}</span>
    </button>
  {/each}
</div>

<style lang="scss">
  .ss-segmented {
    display: inline-flex;
    // Collapse the shared 1px borders so adjacent segments read as one control.
    gap: 0;
    border: 1px solid var(--ss-line);
    background: var(--ss-bg);
    width: max-content;
    max-width: 100%;

    &.full {
      display: flex;
      width: 100%;
    }

    .segment {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--ss-seg-gap);
      font: 500 var(--ss-seg-font) / 1 var(--ss-font-body);
      color: var(--ss-fg-muted);
      background: transparent;
      border: 0;
      // Hairline divider between segments via the leading border.
      border-left: 1px solid var(--ss-line);
      padding: var(--ss-seg-py) var(--ss-seg-px);
      cursor: pointer;
      white-space: nowrap;
      text-align: center;
      transition:
        color var(--ss-dur-fast) var(--ss-ease),
        background var(--ss-dur-fast) var(--ss-ease);

      &:first-child {
        border-left: 0;
      }

      &:hover:not(.selected):not(:disabled) {
        color: var(--ss-fg);
        background: var(--ss-hover);
      }

      &.selected {
        color: var(--ss-fg-on-primary);
        background: var(--ss-primary);
      }

      &:focus-visible {
        outline: none;
        // Inset ring so the highlight reads inside the shared frame.
        box-shadow: inset 0 0 0 2px var(--ss-primary-soft);
        z-index: 1;
      }

      &.selected:focus-visible {
        box-shadow: inset 0 0 0 2px var(--ss-bg);
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.45;
      }

      .label {
        display: inline-block;
      }
    }

    &.full .segment {
      flex: 1 1 0;
      min-width: 0;
    }

    // Icon tracks the segment font (Icon honours an explicit px, but here we
    // let it inherit the size-axis --ss-icon for crispness).
    :global(.segment .ic) {
      flex: 0 0 auto;
    }
  }
</style>
