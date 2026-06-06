<script lang="ts">
  import Badge from './Badge.svelte'
  import Sparkline from './Sparkline.svelte'

  interface Props {
    name: string
    host: string
    status?: 'up' | 'deg' | 'down'
    latency?: string
    spark?: number[]
    onclick?: () => void
  }
  let {
    name,
    host,
    status = 'up',
    latency = '',
    spark = [4, 8, 6, 10, 7, 12, 9, 14, 11, 16, 13, 10, 12],
    onclick,
  }: Props = $props()

  const sparkColor = $derived(
    status === 'deg' ? 'var(--ss-yellow)'
    : status === 'down' ? 'var(--ss-red)'
    : 'var(--ss-primary)'
  )
</script>

<div class="ss-svc" role="button" tabindex="0" {onclick} onkeydown={(e) => e.key === 'Enter' && onclick?.()}>
  <div class="head">
    <div>
      <div class="name">{name}</div>
      <div class="host">{host}</div>
    </div>
  </div>
  <div class="status">
    <Badge tone={status}>{status}</Badge>
    <div class="latency">{latency}</div>
  </div>
  <div class="footer">
    <Sparkline data={spark} color={sparkColor} />
    <div class="latency">▸ open</div>
  </div>
</div>
