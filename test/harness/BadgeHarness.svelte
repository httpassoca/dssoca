<script lang="ts">
  import Badge from '$lib/components/Badge.svelte'

  interface Props {
    tone?: 'up' | 'deg' | 'down' | 'maint' | 'info'
    text?: string
  }
  let { tone = 'info', text = 'label' }: Props = $props()
</script>

<Badge {tone}>{text}</Badge>
