<script lang="ts">
  import { untrack } from 'svelte'
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
  }: Props = $props()

  let value = $state(untrack(() => initial))
</script>

<Input {label} {id} {name} {type} bind:value {placeholder} {required} {disabled} />
<output data-testid="bound-value">{value}</output>
