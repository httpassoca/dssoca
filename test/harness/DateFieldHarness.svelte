<script lang="ts">
  import { untrack } from 'svelte'
  import DateField from '$lib/components/DateField.svelte'

  interface Props {
    label?: string
    id?: string
    name?: string
    initial?: string
    min?: string
    max?: string
    required?: boolean
    disabled?: boolean
    readonly?: boolean
    invalid?: boolean
    describedby?: string
    hint?: string
    error?: string
    [key: string]: unknown
  }
  let {
    label,
    id,
    name,
    initial = '',
    min,
    max,
    required,
    disabled,
    readonly,
    invalid,
    describedby,
    hint,
    error,
    ...rest
  }: Props = $props()

  let value = $state(untrack(() => initial))
</script>

<DateField
  {label}
  {id}
  {name}
  bind:value
  {min}
  {max}
  {required}
  {disabled}
  {readonly}
  {invalid}
  {describedby}
  {hint}
  {error}
  {...rest}
/>
<output data-testid="bound-value">{value}</output>
