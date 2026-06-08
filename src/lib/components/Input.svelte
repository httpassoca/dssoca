<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLInputAttributes, FullAutoFill } from 'svelte/elements'
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props {
    label?: string
    id?: string
    name?: string
    type?: string
    value?: string
    placeholder?: string
    required?: boolean
    disabled?: boolean
    oninput?: (e: Event & { currentTarget: HTMLInputElement }) => void
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
    /** Marks the field invalid for assistive tech (aria-invalid). */
    invalid?: boolean
    /** id(s) of element(s) describing the field (aria-describedby) — e.g. hint/error text. */
    describedby?: string
    /** Supplementary helper text rendered under the input. */
    hint?: string
    /** Error text rendered under the input; its presence implies aria-invalid and is announced to AT. */
    error?: string
    /** Decorative leading content rendered inside the field, before the input. */
    prefix?: Snippet
    /** Decorative trailing content rendered inside the field, after the input. */
    suffix?: Snippet
    /** Renders a button to clear the value; hidden when empty/readonly/disabled. */
    clearable?: boolean
    /** Native readonly — value visible but not editable; rendered muted. */
    readonly?: boolean
    /** Native autocomplete hint. */
    autocomplete?: FullAutoFill
    /** Native inputmode hint for on-screen keyboards. */
    inputmode?: HTMLInputAttributes['inputmode']
    /** Native maxlength. */
    maxlength?: number
    /** Any remaining native input attributes / event handlers are forwarded. */
    [key: string]: unknown
  }
  let {
    label,
    id,
    name,
    type = 'text',
    value = $bindable(''),
    placeholder = '',
    required = false,
    disabled = false,
    oninput,
    size,
    invalid,
    describedby,
    hint,
    error,
    prefix,
    suffix,
    clearable = false,
    readonly = false,
    autocomplete,
    inputmode,
    maxlength,
    ...rest
  }: Props = $props()

  // Guarantee a label↔input association even when no `id` is passed.
  const uid = $props.id()
  const inputId = $derived(id ?? uid)
  const hintId = $derived(`${inputId}-hint`)
  const errorId = $derived(`${inputId}-error`)

  // error wins, then hint, then any caller-supplied describedby — order matters for AT.
  const describedBy = $derived(
    [error ? errorId : null, hint ? hintId : null, describedby]
      .filter(Boolean)
      .join(' ') || undefined,
  )
  const isInvalid = $derived(invalid || Boolean(error) || undefined)
  const resolvedSize = $derived(resolveComponentSize('Input', size))

  // The .ss-field wrapper carries the border/focus ring; show the clear button only when useful.
  const showClear = $derived(clearable && !!value && !readonly && !disabled)

  let inputEl = $state<HTMLInputElement>()
  function clear() {
    value = ''
    inputEl?.focus()
  }
</script>

<div class="ss-field" data-size-variant={resolvedSize} class:invalid={isInvalid} class:disabled>
  {#if label}
    <label class="lbl" for={inputId}>
      {label}
      {#if required}<span class="req" aria-hidden="true">*</span>{/if}
    </label>
  {/if}

  <div class="control">
    {#if prefix}<span class="affix prefix" aria-hidden="true">{@render prefix()}</span>{/if}
    <input
      bind:this={inputEl}
      class="ss-input"
      id={inputId}
      {name}
      {type}
      bind:value
      {placeholder}
      {required}
      {disabled}
      {readonly}
      {autocomplete}
      {inputmode}
      {maxlength}
      aria-invalid={isInvalid}
      aria-describedby={describedBy}
      {oninput}
      {...rest}
    />
    {#if showClear}
      <button type="button" class="clear" aria-label="Clear" onclick={clear}>×</button>
    {/if}
    {#if suffix}<span class="affix suffix" aria-hidden="true">{@render suffix()}</span>{/if}
  </div>

  {#if error}<span class="msg error" id={errorId} role="alert">{error}</span>{/if}
  {#if hint}<span class="msg hint" id={hintId}>{hint}</span>{/if}
</div>

<style lang="scss">
  .ss-field {
    display: flex; flex-direction: column; gap: 6px;

    .lbl {
      font-family: var(--ss-font-mono); font-size: var(--ss-ui-xs); color: var(--ss-fg-muted);
      text-transform: uppercase; letter-spacing: 0.08em;
      .req { color: var(--ss-red); margin-left: 2px; }
    }

    // The border/focus ring lives on the wrapper so prefix/suffix sit inside the field.
    .control {
      display: flex; align-items: center; gap: var(--ss-gap-sm);
      background: transparent; color: var(--ss-fg);
      border: 1px solid var(--ss-line);
      padding: 0 var(--ss-input-px);
      transition: border-color var(--ss-dur-fast) var(--ss-ease), box-shadow var(--ss-dur-fast) var(--ss-ease);

      &:focus-within { border-color: var(--ss-primary); box-shadow: 0 0 0 3px var(--ss-primary-soft); }
    }

    &.invalid .control {
      border-color: var(--ss-red);
      &:focus-within { border-color: var(--ss-red); box-shadow: 0 0 0 3px rgba(var(--ss-red-rgb), 0.22); }
    }

    &.disabled .control { border-color: var(--ss-line); }

    .affix {
      display: inline-flex; align-items: center; flex: none;
      color: var(--ss-fg-faint); font-size: var(--ss-input-font);
    }

    .clear {
      display: inline-flex; align-items: center; justify-content: center; flex: none;
      font-family: var(--ss-font-body); font-size: var(--ss-input-font); line-height: 1;
      background: transparent; border: none; color: var(--ss-fg-faint);
      padding: 0; margin: 0; cursor: pointer;
      transition: color var(--ss-dur-fast) var(--ss-ease);
      &:hover { color: var(--ss-fg); }
      &:focus-visible { outline: none; color: var(--ss-fg); box-shadow: 0 0 0 2px var(--ss-primary-soft); }
    }

    .msg {
      font-family: var(--ss-font-mono); font-size: var(--ss-ui-xs); letter-spacing: 0.02em;
      &.hint { color: var(--ss-fg-faint); }
      &.error { color: var(--ss-red); }
    }
  }

  .ss-input {
    font-family: var(--ss-font-body); font-size: var(--ss-input-font);
    background: transparent; color: var(--ss-fg);
    border: none; padding: var(--ss-input-py) 0;
    width: 100%; min-width: 0;
    transition: color var(--ss-dur-fast) var(--ss-ease);

    &:focus { outline: none; }
    &::placeholder { font-style: italic; color: var(--ss-fg-faint); }
    &[readonly] { color: var(--ss-fg-muted); cursor: default; }
    &:disabled { color: var(--ss-fg-faint); cursor: not-allowed; -webkit-text-fill-color: var(--ss-fg-faint); }
  }
</style>
