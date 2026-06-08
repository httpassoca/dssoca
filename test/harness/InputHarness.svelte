<script lang="ts">
  import { untrack, type Snippet } from 'svelte'
  import Input from '$lib/components/Input.svelte'

  interface Props {
    label?: string
    id?: string
    name?: string
    type?: string
    initial?: string
    placeholder?: string
    required?: boolean
    disabled?: boolean
    invalid?: boolean
    describedby?: string
    hint?: string
    error?: string
    clearable?: boolean
    readonly?: boolean
    autocomplete?: string
    inputmode?: string
    maxlength?: number
    prefix?: Snippet
    suffix?: Snippet
    [key: string]: unknown
  }
  let {
    label,
    id,
    name,
    type,
    initial = '',
    placeholder,
    required,
    disabled,
    invalid,
    describedby,
    hint,
    error,
    clearable,
    readonly,
    autocomplete,
    inputmode,
    maxlength,
    prefix,
    suffix,
    ...rest
  }: Props = $props()

  let value = $state(untrack(() => initial))
</script>

<Input
  {label}
  {id}
  {name}
  {type}
  bind:value
  {placeholder}
  {required}
  {disabled}
  {invalid}
  {describedby}
  {hint}
  {error}
  {clearable}
  {readonly}
  {autocomplete}
  {inputmode}
  {maxlength}
  {prefix}
  {suffix}
  {...rest}
/>
<output data-testid="bound-value">{value}</output>
