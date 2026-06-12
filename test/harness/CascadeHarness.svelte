<script lang="ts">
  // DS-0070 — size-cascade integration harness. Nests a Button + Badge under
  // an ancestor that can carry its own `data-size-variant`, so tests can
  // exercise every layer of the size resolution order:
  //   explicit `size` prop → componentsSize[Name] → ancestor attribute →
  //   global default on <html> (applyDesignConfig).
  import Button from '$lib/components/Button.svelte'
  import Badge from '$lib/components/Badge.svelte'
  import type { Size } from '$lib/config.js'

  interface Props {
    /** When set, the wrapping <section> carries data-size-variant. */
    ancestorSize?: Size
    /** Explicit `size` prop forwarded to the nested Button. */
    buttonSize?: Size
    /** Explicit `size` prop forwarded to the nested Badge. */
    badgeSize?: Size
  }
  let { ancestorSize, buttonSize, badgeSize }: Props = $props()
</script>

<section data-testid="ancestor" data-size-variant={ancestorSize}>
  <Button size={buttonSize}>Save</Button>
  <Badge size={badgeSize}>status</Badge>
</section>
