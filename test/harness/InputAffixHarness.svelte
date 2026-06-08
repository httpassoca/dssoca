<script lang="ts">
  import Input from '$lib/components/Input.svelte'

  interface Props {
    label?: string
  }
  let { label }: Props = $props()

  let value = $state('')
</script>

<Input {label} bind:value>
  {#snippet prefix()}<span data-testid="prefix-icon">$</span>{/snippet}
  {#snippet suffix()}<span data-testid="suffix-icon">USD</span>{/snippet}
</Input>
