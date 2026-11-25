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
  import {
    segmentedGroupAttrs,
    segmentedItemAttrs,
    segmentedKey,
    segmentedPress,
    segmentedTabStop,
    type SegmentedAction,
    type SegmentedChangeDetails,
    type SegmentedState,
  } from '../core/segmented.js'

  interface Props {
    /** Mutually-exclusive options: { value, label, icon?, disabled? }. */
    options?: SegmentOption[]
    /** Selected option value (bindable). */
    value?: string
    /**
     * Fired when the selection changes (after `value` updates). `details.reason`
     * says what moved it: `'press'` (a segment was clicked) or `'key'` (arrows /
     * Home / End).
     */
    onChange?: (value: string, details: SegmentedChangeDetails) => void
    /** Stretch segments to equal widths and fill the container. */
    fullWidth?: boolean
    /**
     * Disable the whole control (DS-0078): every segment is rendered inert
     * (`disabled` + skipped by keyboard nav) and the group carries
     * `aria-disabled="true"`. Per-option `disabled` still works for
     * disabling individual segments.
     */
    disabled?: boolean
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
    disabled = false,
    size,
    label,
  }: Props = $props()

  // Component-wide `disabled` wins over (and combines with) per-option flags.
  const isOptionDisabled = (o: SegmentOption) => disabled || Boolean(o.disabled)

  // Bound references to each segment, indexed by option position, so keyboard
  // navigation can move focus across the roving-tabindex group.
  let segments = $state<(HTMLButtonElement | undefined)[]>([])

  const enabledIndexes = $derived(
    options.map((o, i) => (isOptionDisabled(o) ? -1 : i)).filter((i) => i >= 0),
  )

  // The group's state as `core/segmented.ts` sees it. Every decision (what a press
  // or a key selects, which segment owns the tab stop) is made there, shared with
  // vanilla/segmented.ts (DS-0197).
  const group = $derived<SegmentedState>({
    selected: options.findIndex((o) => o.value === value),
    enabled: enabledIndexes,
  })

  /** Index that owns the single tab stop (roving tabindex). The selected option
   *  when it's enabled; otherwise the first enabled option; -1 when none. */
  const tabbableIndex = $derived(segmentedTabStop(group))

  /** Apply a core action: move the selection (and focus, for the keyboard). */
  function run(action: SegmentedAction | null) {
    if (!action) return
    const opt = options[action.index]
    if (action.changed && opt) {
      value = opt.value
      onChange?.(opt.value, { reason: action.reason })
    }
    if (action.focus) segments[action.index]?.focus()
  }

  function onKeydown(e: KeyboardEvent, index: number) {
    // RTL: the row is laid out right-to-left, so ArrowLeft points at the NEXT
    // segment. Read the computed direction at keydown time (it inherits from
    // any ancestor `dir`) and hand it to the core, which stays DOM-free.
    const rtl = getComputedStyle(e.currentTarget as Element).direction === 'rtl'
    const result = segmentedKey(group, index, e.key, rtl)
    if (!result) return
    if (result.preventDefault) e.preventDefault()
    // radiogroup semantics: moving focus also moves the selection.
    run(result.action)
  }

  const sizeAttr = $derived(resolveComponentSize('SegmentedControl', size))
</script>

<div
  class="ss-segmented"
  class:full={fullWidth}
  aria-label={label}
  data-size-variant={sizeAttr}
  {...segmentedGroupAttrs(disabled)}
>
  {#each options as opt, i (opt.value)}
    {@const selected = i === group.selected}
    <button
      bind:this={segments[i]}
      type="button"
      class="segment"
      class:selected
      {...segmentedItemAttrs(i, group.selected, tabbableIndex)}
      disabled={isOptionDisabled(opt)}
      onclick={() => run(segmentedPress(group, i))}
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
      // Hairline divider between segments via the leading (inline-start)
      // border, so the dividers stay between segments in RTL too.
      border-inline-start: 1px solid var(--ss-line);
      padding: var(--ss-seg-py) var(--ss-seg-px);
      cursor: pointer;
      white-space: nowrap;
      text-align: center;
      transition:
        color var(--ss-dur-fast) var(--ss-ease),
        background var(--ss-dur-fast) var(--ss-ease);

      &:first-child {
        border-inline-start: 0;
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
        // Inset ring so the highlight reads inside the shared frame. Solid
        // --ss-primary (not the 18%/12%-alpha primary-soft wash) so the
        // indicator clears WCAG 1.4.11's 3:1 against the segment background.
        box-shadow: inset 0 0 0 2px var(--ss-primary);
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
