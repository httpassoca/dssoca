<script lang="ts">
  import type { Snippet } from 'svelte'
  import Link from '$lib/components/Link.svelte'
  import type { Size } from '$lib/config.js'

  interface Props {
    variant?: 'inline' | 'button'
    external?: boolean
    size?: Size
    href?: string
    target?: string
    rel?: string
    text?: string
    children?: Snippet
    /** Forwarded rest prop, used to assert spread onto <a>. */
    'data-testid'?: string
  }
  let {
    variant,
    external,
    size,
    href,
    target,
    rel,
    text = 'go home',
    children,
    ...rest
  }: Props = $props()
</script>

<Link {variant} {external} {size} {href} {target} {rel} {...rest}>
  {#if children}{@render children()}{:else}{text}{/if}
</Link>
