<script lang="ts">
  // ─────────────────────────────────────────────────────────────────────────
  // SCAFFOLD STUB — DS-0052 (Link component).
  // Implement: animated underline (pseudo-element, --ss-ease + glow box-shadow),
  // `variant` inline|button (button = solid primary, no underline; do NOT
  // duplicate Button), `external` → target=_blank + rel=noopener noreferrer +
  // external icon, hover/:focus-visible/visited states, reduced-motion safe.
  // ─────────────────────────────────────────────────────────────────────────
  import type { Snippet } from 'svelte'
  import type { HTMLAnchorAttributes } from 'svelte/elements'
  import { resolveComponentSize, type Size } from '../config.js'

  interface Props extends HTMLAnchorAttributes {
    /** Destination URL. */
    href: string
    /** Visual treatment — underlined inline link, or styled as a button. */
    variant?: 'inline' | 'button'
    /** Open in a new tab with safe rel; auto-appends an external-link icon. */
    external?: boolean
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
    children?: Snippet
  }

  let {
    href,
    variant = 'inline',
    external = false,
    size,
    children,
    ...rest
  }: Props = $props()

  const targetAttrs = $derived(
    external ? { target: '_blank', rel: 'noopener noreferrer' } : {},
  )
</script>

<a
  class="ss-link"
  class:button={variant === 'button'}
  data-size-variant={resolveComponentSize('Link', size)}
  {href}
  {...targetAttrs}
  {...rest}
>
  {@render children?.()}
</a>

<style lang="scss">
  // TODO(DS-0052): animated underline + button variant.
  .ss-link { color: var(--ss-primary); text-decoration: none; }
</style>
