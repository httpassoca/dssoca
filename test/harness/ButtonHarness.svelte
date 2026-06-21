<script lang="ts">
  import type { Snippet } from 'svelte'
  import Button from '$lib/components/Button.svelte'
  import type { SpinnerVariant } from '$lib/config.js'

  interface Props {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    loading?: boolean | SpinnerVariant
    loadingLabel?: string
    size?: 'sm' | 'md' | 'lg'
    iconOnly?: boolean
    label?: string
    fullWidth?: boolean
    onclick?: (e: MouseEvent) => void
    /** When false/absent, no children snippet is passed (no `.label` span). */
    text?: string | false
    leading?: Snippet
    trailing?: Snippet
    /** Forwarded rest prop, used to assert spread onto <button>. */
    'data-testid'?: string
  }
  let {
    variant,
    type,
    disabled,
    loading,
    loadingLabel,
    size,
    iconOnly,
    label,
    fullWidth,
    onclick,
    text = 'Click me',
    leading,
    trailing,
    ...rest
  }: Props = $props()
</script>

{#if text === false}
  <Button
    {variant}
    {type}
    {disabled}
    {loading}
    {loadingLabel}
    {size}
    {iconOnly}
    {label}
    {fullWidth}
    {onclick}
    {leading}
    {trailing}
    {...rest}
  />
{:else}
  <Button
    {variant}
    {type}
    {disabled}
    {loading}
    {loadingLabel}
    {size}
    {iconOnly}
    {label}
    {fullWidth}
    {onclick}
    {leading}
    {trailing}
    {...rest}>{text}</Button
  >
{/if}
