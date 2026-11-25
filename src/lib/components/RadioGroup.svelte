<script module lang="ts">
  /** One option in a {@link RadioGroup}. */
  export interface RadioOption {
    value: string
    label: string
    disabled?: boolean
  }
</script>

<script lang="ts">
  // ─────────────────────────────────────────────────────────────────────────
  // RadioGroup — DS-0197. Native `<input type="radio">` elements sharing a
  // `name` inside a `role="radiogroup"` named by its visible label. Arrow keys
  // (wrapping, skipping disabled, mirrored under RTL), Space and form
  // submission come from the platform, so this file handles no key at all.
  // House rule: square radios (zero radius) — a filled inner square marks the
  // selected one. Each input IS its box (`appearance: none`), so the base focus
  // ring lands on it.
  // ─────────────────────────────────────────────────────────────────────────
  import { resolveComponentSize, type Size } from '../config.js'
  import {
    radioEnabled,
    radioGroupAttrs,
    radioInputAttrs,
    radioPress,
    radioTabStop,
    type RadioState,
  } from '../core/radio.js'

  interface Props {
    /** Mutually-exclusive options: { value, label, disabled? }. */
    options?: RadioOption[]
    /** Selected option value (bindable); unset = nothing selected. */
    value?: string
    /**
     * Form field name shared by the radios (the selected value is submitted
     * with the form). Defaults to a generated per-instance name, which is what
     * makes the inputs one native group.
     */
    name?: string
    /**
     * Visible group label; names the radiogroup. Required (WCAG 2.2 AA): a
     * radiogroup with no name leaves AT users without context for the choice.
     */
    label: string
    /** Stack the options (`vertical`, default) or lay them out in a row. */
    orientation?: 'vertical' | 'horizontal'
    /**
     * Disable the whole group: every radio is `disabled` and the group carries
     * `aria-disabled="true"`. Per-option `disabled` still works on its own.
     */
    disabled?: boolean
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
    /**
     * Fired when the selection changes (after `value` updates), with the new
     * value. There is no `details.reason`: the native inputs report a press and
     * an arrow key as the same event.
     */
    onChange?: (value: string) => void
  }

  let {
    options = [],
    value = $bindable(),
    name,
    label,
    orientation = 'vertical',
    disabled = false,
    size,
    onChange,
  }: Props = $props()

  const uid = $props.id()
  const labelId = `${uid}-label`
  // Radios only form a native group (one selection, arrow keys) when they share a name.
  const groupName = $derived(name ?? `${uid}-radio`)

  let inputs = $state<(HTMLInputElement | undefined)[]>([])

  // The group's state as `core/radio.ts` sees it. Every decision that is ours
  // (enabled options, what a pick selects, the tab stop) is made there, shared
  // with vanilla/radio.ts.
  const group = $derived<RadioState>({
    selected: options.findIndex((o) => o.value === value),
    enabled: radioEnabled(
      options.map((o) => Boolean(o.disabled)),
      disabled,
    ),
  })
  const tabStop = $derived(radioTabStop(group))

  // The browser has already checked the input (press, Space or arrow key); the
  // core confirms the pick and the result is written back.
  function onPick(index: number) {
    const action = radioPress(group, index)
    const opt = options[index]
    if (!action || !opt) {
      // Not ours to select: put the DOM back on the current selection.
      inputs.forEach((el, i) => {
        if (el) el.checked = i === group.selected
      })
      return
    }
    if (action.changed) {
      value = opt.value
      onChange?.(opt.value)
    }
  }

  const sizeAttr = $derived(resolveComponentSize('RadioGroup', size))
</script>

<div
  class="ss-radio-group"
  aria-labelledby={labelId}
  data-orientation={orientation}
  data-size-variant={sizeAttr}
  {...radioGroupAttrs(disabled)}
>
  <span id={labelId} class="legend">{label}</span>
  <div class="options">
    {#each options as opt, i (opt.value)}
      <label class="option">
        <span class="control">
          <input
            bind:this={inputs[i]}
            class="input"
            type="radio"
            name={groupName}
            value={opt.value}
            checked={i === group.selected}
            disabled={disabled || Boolean(opt.disabled)}
            {...radioInputAttrs(i, tabStop)}
            onchange={() => onPick(i)}
          />
          <span class="dot" aria-hidden="true"></span>
        </span>
        <span class="label">{opt.label}</span>
      </label>
    {/each}
  </div>
</div>

<style lang="scss">
  // Box edge: scales with the size axis through the control font. Component-scoped
  // override hook, no global token.
  $box: var(--ss-radio-size, calc(var(--ss-control-font) + 4px));

  .ss-radio-group {
    display: inline-flex;
    flex-direction: column;
    gap: var(--ss-gap-xs);
    max-inline-size: 100%;

    .legend {
      font: 500 var(--ss-ui-sm) / 1.3 var(--ss-font-body);
      color: var(--ss-fg-muted);
    }

    .options {
      display: flex;
      flex-direction: column;
      gap: var(--ss-radio-gap, var(--ss-gap-xs));
    }

    &[data-orientation='horizontal'] .options {
      flex-flow: row wrap;
      column-gap: var(--ss-gap);
    }

    .option {
      display: inline-flex;
      align-items: center;
      gap: var(--ss-gap-sm);
      // The whole label is the pointer target: at least 24×24 without growing the box.
      min-inline-size: var(--ss-s-6);
      min-block-size: var(--ss-s-6);
      cursor: pointer;
    }

    .control {
      position: relative;
      flex: 0 0 auto;
      display: inline-grid;
      inline-size: $box;
      block-size: $box;
    }

    .input {
      grid-area: 1 / 1;
      appearance: none;
      box-sizing: border-box;
      inline-size: 100%;
      block-size: 100%;
      margin: 0;
      // House rule: square radio — zero radius.
      border-radius: 0;
      // --ss-fg-faint, not --ss-line: the box edge is what identifies the control,
      // so it needs ≥3:1 against the surface.
      border: 1px solid var(--ss-fg-faint);
      background: var(--ss-bg);
      cursor: inherit;
      transition: border-color var(--ss-dur-fast) var(--ss-ease);

      &:not(:disabled):hover {
        border-color: var(--ss-fg);
      }

      &:checked {
        border-color: var(--ss-primary);
      }

      // No :focus-visible override: the input is the box, so the global base ring
      // (2px solid --ss-primary, offset 2px — _base.scss) is drawn around it.
    }

    // Selection is a shape, not a colour: the inner square exists only when checked.
    .dot {
      grid-area: 1 / 1;
      place-self: center;
      display: none;
      inline-size: calc(#{$box} - 8px);
      block-size: calc(#{$box} - 8px);
      background: var(--ss-primary);
      // Decoration over the input: presses fall through to it.
      pointer-events: none;
    }

    .input:checked + .dot {
      display: block;
    }

    .label {
      font: 500 var(--ss-control-font) / 1.3 var(--ss-font-body);
      color: var(--ss-fg);
      user-select: none;
    }

    .option:has(.input:disabled) {
      cursor: not-allowed;

      .control,
      .label {
        opacity: 0.45;
      }
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ss-radio-group .input {
      transition: none;
    }
  }
</style>
