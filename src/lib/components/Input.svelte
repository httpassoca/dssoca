<script lang="ts">
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
  }: Props = $props()

  // Guarantee a label↔input association even when no `id` is passed.
  const uid = $props.id()
  const inputId = $derived(id ?? uid)
</script>

{#if label}
  <label class="ss-field" for={inputId} data-size-variant={resolveComponentSize('Input', size)}>
    <span class="lbl">{label}</span>
    <input
      class="ss-input"
      id={inputId}
      {name}
      {type}
      bind:value
      {placeholder}
      {required}
      {disabled}
      aria-invalid={invalid || undefined}
      aria-describedby={describedby}
      {oninput}
    />
  </label>
{:else}
  <input
    class="ss-input"
    data-size-variant={resolveComponentSize('Input', size)}
    id={inputId}
    {name}
    {type}
    bind:value
    {placeholder}
    {required}
    {disabled}
    aria-invalid={invalid || undefined}
    aria-describedby={describedby}
    {oninput}
  />
{/if}

<style lang="scss">
  .ss-input {
    font-family: var(--ss-font-body); font-size: var(--ss-input-font);
    background: transparent; color: var(--ss-fg);
    border: 1px solid var(--ss-line); padding: var(--ss-input-py) var(--ss-input-px);
    width: 100%; transition: all .2s var(--ss-ease);

    &:focus { outline: none; border-color: var(--ss-primary); box-shadow: 0 0 0 3px var(--ss-primary-soft); }
    &::placeholder { font-style: italic; color: var(--ss-fg-faint); }
  }
  .ss-field {
    display: flex; flex-direction: column; gap: 6px;
    .lbl { font-family: var(--ss-font-mono); font-size: var(--ss-ui-xs); color: var(--ss-fg-muted); text-transform: uppercase; letter-spacing: 0.08em; }
  }
</style>
