<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    variant?: 'primary' | 'secondary' | 'ghost'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    onclick?: (e: MouseEvent) => void
    children: Snippet
  }
  let { variant = 'secondary', type = 'button', disabled = false, onclick, children }: Props = $props()
</script>

<button class="ss-btn {variant}" {type} {disabled} {onclick}>
  {@render children()}
</button>
