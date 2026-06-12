<script lang="ts">
  import type { Snippet } from 'svelte'
  import Button from '$lib/components/Button.svelte'

  interface Props {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    loading?: boolean
    loadingLabel?: string
    iconOnly?: boolean
    label?: string
    fullWidth?: boolean
    onclick?: (e: MouseEvent) => void
    text?: string
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

<Button
  {variant}
  {type}
  {disabled}
  {loading}
  {loadingLabel}
  {iconOnly}
  {label}
  {fullWidth}
  {onclick}
  {leading}
  {trailing}
  {...rest}>{text}</Button
>
