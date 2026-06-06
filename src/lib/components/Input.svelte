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
