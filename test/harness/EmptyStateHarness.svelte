<script lang="ts">
  import EmptyState from '$lib/components/EmptyState.svelte'

  interface Props {
    variant?: 'empty' | 'error' | 'no-results'
    title: string
    message?: string
    icon?: string
    headingLevel?: number | false
    compact?: boolean
    fullWidth?: boolean
    withAction?: boolean
    withSecondaryAction?: boolean
    withFooter?: boolean
    withVisual?: boolean
  }
  let {
    variant,
    title,
    message,
    icon,
    headingLevel,
    compact,
    fullWidth,
    withAction = false,
    withSecondaryAction = false,
    withFooter = false,
    withVisual = false
  }: Props = $props()
</script>

{#snippet visual()}<svg class="empty-visual" viewBox="0 0 10 10"></svg>{/snippet}
{#snippet action()}<button class="empty-action">retry</button>{/snippet}
{#snippet secondaryAction()}<button class="empty-secondary">cancel</button>{/snippet}
{#snippet footer()}<a class="empty-footer" href="/help">Need help?</a>{/snippet}

<EmptyState
  {variant}
  {title}
  {message}
  {icon}
  {headingLevel}
  {compact}
  {fullWidth}
  visual={withVisual ? visual : undefined}
  action={withAction ? action : undefined}
  secondaryAction={withSecondaryAction ? secondaryAction : undefined}
  footer={withFooter ? footer : undefined}
/>
