<script lang="ts">
  interface Props {
    label: string
    value: string | number
    suffix?: string
    delta?: string
    dir?: 'up' | 'down'
  }
  let { label, value, suffix, delta, dir = 'up' }: Props = $props()
</script>

<div class="hub-metric">
  <div class="label">{label}</div>
  <div class="val">
    {value}{#if suffix}<span class="small">{suffix}</span>{/if}
  </div>
  {#if delta}
    <div class="delta {dir}">{dir === 'up' ? '↑' : '↓'} {delta}</div>
  {/if}
</div>
