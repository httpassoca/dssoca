<script lang="ts">
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
  }: Props = $props()
</script>

{#if label}
  <label class="ss-field" for={id}>
    <span class="lbl">{label}</span>
    <input
      class="ss-input"
      {id}
      {name}
      {type}
      bind:value
      {placeholder}
      {required}
      {disabled}
      {oninput}
    />
  </label>
{:else}
  <input
    class="ss-input"
    {id}
    {name}
    {type}
    bind:value
    {placeholder}
    {required}
    {disabled}
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
