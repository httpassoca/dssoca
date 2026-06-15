<script lang="ts">
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props {
    label?: string
    id?: string
    name?: string
    /** Bindable current value; `null` when the input is empty. */
    value?: number | null
    min?: number
    max?: number
    /** Increment/decrement step for the steppers (and native arrows). */
    step?: number
    required?: boolean
    disabled?: boolean
    /** Native readonly — value visible but not editable; rendered muted. */
    readonly?: boolean
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
    /** Marks the field invalid for assistive tech (aria-invalid). */
    invalid?: boolean
    /** Supplementary helper text rendered under the input. */
    hint?: string
    /** Error text rendered under the input; its presence implies aria-invalid and is announced to AT. */
    error?: string
    /** id(s) of element(s) describing the field (aria-describedby) — e.g. hint/error text. */
    describedby?: string
    placeholder?: string
    onchange?: (e: Event & { currentTarget: HTMLInputElement }) => void
    /** Any remaining native input attributes / event handlers are forwarded. */
    [key: string]: unknown
  }
  let {
    label,
    id,
    name,
    value = $bindable(null),
    min,
    max,
    step = 1,
    required = false,
    disabled = false,
    readonly = false,
    size,
    invalid,
    hint,
    error,
    describedby,
    placeholder = '',
    onchange,
    ...rest
  }: Props = $props()

  // Guarantee a label↔input association even when no `id` is passed.
  const uid = $props.id()
  const inputId = $derived(id ?? uid)
  const hintId = $derived(`${inputId}-hint`)
  const errorId = $derived(`${inputId}-error`)

  // error wins, then hint, then any caller-supplied describedby — order matters for AT.
  const describedBy = $derived(
    [error ? errorId : null, hint ? hintId : null, describedby].filter(Boolean).join(' ') ||
      undefined,
  )
  const isInvalid = $derived(invalid || Boolean(error) || undefined)
  const resolvedSize = $derived(resolveComponentSize('NumberField', size))

  // Steppers are inert at the bounds (and when the field can't be edited).
  const atMin = $derived(value != null && min != null && value <= min)
  const atMax = $derived(value != null && max != null && value >= max)
  const decDisabled = $derived(disabled || readonly || atMin)
  const incDisabled = $derived(disabled || readonly || atMax)

  function clamp(n: number): number {
    if (min != null && n < min) return min
    if (max != null && n > max) return max
    return n
  }

  function onInput(e: Event & { currentTarget: HTMLInputElement }) {
    const raw = e.currentTarget.value
    value = raw === '' ? null : e.currentTarget.valueAsNumber
    if (value != null && Number.isNaN(value)) value = null
  }

  function nudge(dir: 1 | -1) {
    const base = value ?? (dir > 0 ? (min ?? 0) : (max ?? 0))
    value = clamp(base + dir * step)
  }
</script>

<div
  class="ss-numberfield"
  data-size-variant={resolvedSize}
  class:invalid={isInvalid}
  class:disabled
>
  {#if label}
    <label class="lbl" for={inputId}>
      {label}
      {#if required}<span class="req" aria-hidden="true">*</span>{/if}
    </label>
  {/if}

  <div class="control">
    <button
      type="button"
      class="step dec"
      aria-label="Decrease"
      disabled={decDisabled}
      onclick={() => nudge(-1)}
    >
      −
    </button>
    <input
      class="ss-input"
      id={inputId}
      {name}
      type="number"
      inputmode="decimal"
      value={value ?? ''}
      {min}
      {max}
      {step}
      {placeholder}
      {required}
      {disabled}
      {readonly}
      aria-invalid={isInvalid}
      aria-describedby={describedBy}
      oninput={onInput}
      {onchange}
      {...rest}
    />
    <button
      type="button"
      class="step inc"
      aria-label="Increase"
      disabled={incDisabled}
      onclick={() => nudge(1)}
    >
      +
    </button>
  </div>

  {#if error}<span class="msg error" id={errorId} role="alert">{error}</span>{/if}
  {#if hint}<span class="msg hint" id={hintId}>{hint}</span>{/if}
</div>

<style lang="scss">
  .ss-numberfield {
    // 6px label↔control↔message gap mirrors Input (DS-0068): between the
    // spacing-scale steps with no matching --ss-gap-* token, so it stays a
    // deliberate fixed micro-gap.
    display: flex;
    flex-direction: column;
    gap: 6px;

    .lbl {
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-xs);
      color: var(--ss-fg-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      .req {
        color: var(--ss-red);
        margin-left: 2px;
      }
    }

    // The border/focus ring lives on the wrapper so the steppers sit inside the field.
    .control {
      display: flex;
      align-items: stretch;
      background: transparent;
      color: var(--ss-fg);
      border: 1px solid var(--ss-line);
      transition:
        border-color var(--ss-dur-fast) var(--ss-ease),
        box-shadow var(--ss-dur-fast) var(--ss-ease);

      &:focus-within {
        border-color: var(--ss-primary);
        box-shadow: 0 0 0 3px var(--ss-primary-soft);
      }
    }

    &.invalid .control {
      border-color: var(--ss-red);
      &:focus-within {
        border-color: var(--ss-red);
        box-shadow: 0 0 0 3px rgba(var(--ss-red-rgb), 0.22);
      }
    }

    &.disabled .control {
      border-color: var(--ss-line);
    }

    .step {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: none;
      width: var(--ss-numberfield-step-w, 2.25em);
      font-family: var(--ss-font-mono);
      font-size: var(--ss-input-font);
      line-height: 1;
      background: transparent;
      border: none;
      color: var(--ss-fg-muted);
      cursor: pointer;
      transition: color var(--ss-dur-fast) var(--ss-ease);
      &:hover:not(:disabled) {
        color: var(--ss-fg);
      }
      &:focus-visible {
        outline: none;
        color: var(--ss-fg);
        box-shadow: 0 0 0 2px var(--ss-primary-soft);
      }
      &:disabled {
        color: var(--ss-fg-faint);
        cursor: not-allowed;
      }
    }

    .msg {
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-xs);
      letter-spacing: 0.02em;
      &.hint {
        color: var(--ss-fg-faint);
      }
      &.error {
        color: var(--ss-red);
      }
    }
  }

  .ss-input {
    font-family: var(--ss-font-mono);
    font-size: var(--ss-input-font);
    background: transparent;
    color: var(--ss-fg);
    border: none;
    padding: var(--ss-input-py) var(--ss-input-px);
    width: 100%;
    min-width: 0;
    text-align: center;
    transition: color var(--ss-dur-fast) var(--ss-ease);

    // Hide the native spinner — the component ships its own steppers.
    -moz-appearance: textfield;
    appearance: textfield;
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    &:focus {
      outline: none;
    }
    &::placeholder {
      font-style: italic;
      color: var(--ss-fg-faint);
    }
    &[readonly] {
      color: var(--ss-fg-muted);
      cursor: default;
    }
    &:disabled {
      color: var(--ss-fg-faint);
      cursor: not-allowed;
      -webkit-text-fill-color: var(--ss-fg-faint);
    }
  }
</style>
