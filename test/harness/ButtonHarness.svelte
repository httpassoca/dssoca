<script lang="ts">
  import Button from '$lib/components/Button.svelte'

  interface Props {
    variant?: 'primary' | 'secondary' | 'ghost'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    onclick?: (e: MouseEvent) => void
    text?: string
  }
  let { variant, type, disabled, onclick, text = 'Click me' }: Props = $props()
</script>

<Button {variant} {type} {disabled} {onclick}>{text}</Button>
