<script lang="ts">
  import { untrack } from 'svelte'
  import Select, { type SelectOption, type SelectOptGroup } from '$lib/components/Select.svelte'

  interface Props {
    label?: string
    id?: string
    name?: string
    initial?: string
    options?: SelectOption[] | SelectOptGroup[]
    placeholder?: string
    required?: boolean
    disabled?: boolean
    invalid?: boolean
    hint?: string
    error?: string
    describedby?: string
    [key: string]: unknown
  }
  let {
    label,
    id,
    name,
    initial = '',
    options,
    placeholder,
    required,
    disabled,
    invalid,
    hint,
    error,
    describedby,
    ...rest
  }: Props = $props()

  let value = $state(untrack(() => initial))
</script>

<Select
  {label}
  {id}
  {name}
  bind:value
  {options}
  {placeholder}
  {required}
  {disabled}
  {invalid}
  {hint}
  {error}
  {describedby}
  {...rest}
/>
<output data-testid="bound-value">{value}</output>
