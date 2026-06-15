<script lang="ts">
  import { untrack } from 'svelte'
  import NumberField from '$lib/components/NumberField.svelte'

  interface Props {
    label?: string
    id?: string
    name?: string
    initial?: number | null
    min?: number
    max?: number
    step?: number
    required?: boolean
    disabled?: boolean
    readonly?: boolean
    invalid?: boolean
    hint?: string
    error?: string
    describedby?: string
    placeholder?: string
    [key: string]: unknown
  }
  let {
    label,
    id,
    name,
    initial = null,
    min,
    max,
    step,
    required,
    disabled,
    readonly,
    invalid,
    hint,
    error,
    describedby,
    placeholder,
    ...rest
  }: Props = $props()

  let value = $state<number | null>(untrack(() => initial))
</script>

<NumberField
  {label}
  {id}
  {name}
  bind:value
  {min}
  {max}
  {step}
  {required}
  {disabled}
  {readonly}
  {invalid}
  {hint}
  {error}
  {describedby}
  {placeholder}
  {...rest}
/>
<output data-testid="bound-value">{value === null ? 'null' : value}</output>
