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

<style lang="scss">
  .ss-svc {
    display: grid; grid-template-columns: 1fr auto;
    gap: var(--ss-gap); padding: var(--ss-card-py) var(--ss-card-px);
    border: 1px solid var(--ss-line);
    background: var(--ss-bg-elev);
    cursor: pointer;
    transition: all var(--ss-dur-fast) var(--ss-ease);

    &:hover { border-color: var(--ss-line-strong); background: #232323; }
    .head {
      display: flex; align-items: center; gap: 10px;
      .name { font-family: var(--ss-font-display); font-size: var(--ss-ui-lg); letter-spacing: -0.005em; }
      .host { font-family: var(--ss-font-mono); font-size: var(--ss-ui-sm); color: var(--ss-fg-muted); }
    }
    .status { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
    .footer { grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; margin-top: 2px; }
    .latency { font-family: var(--ss-font-mono); font-size: var(--ss-ui-sm); color: var(--ss-fg-muted); }
  }
</style>
