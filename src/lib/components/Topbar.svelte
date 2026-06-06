<script lang="ts">
  import PassocaMark from './PassocaMark.svelte'

  interface Props {
    active?: string
    user?: string
    tabs?: string[]
    onTab?: (tab: string) => void
  }
  let {
    active = 'overview',
    user = 'rafael@hub.home',
    tabs = ['overview', 'services', 'logs', 'shell'],
    onTab,
  }: Props = $props()

  function pad(n: number) { return String(n).padStart(2, '0') }
  function nowStr() {
    const d = new Date()
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  }

  let clock = $state(nowStr())
  $effect(() => {
    const t = setInterval(() => { clock = nowStr() }, 1000)
    return () => clearInterval(t)
  })

  const [h, m, s] = $derived(clock.split(':'))
</script>

<div class="ss-topbar">
  <div class="seg logo">
    <PassocaMark size={14} />
    <span class="nm">hubssoca</span>
  </div>
  <div class="ws">
    {#each tabs as tab, i}
      <button
        class="tab {tab === active ? 'active' : ''}"
        onclick={() => onTab?.(tab)}
      >
        <span class="n">{i + 1}</span>{tab}
      </button>
    {/each}
  </div>
  <div class="grow"></div>
  <div class="seg right" title="services">
    <span class="dot"></span>
    <span class="stat"><span class="v">6</span><span class="k">/7 up</span></span>
  </div>
  <div class="seg right stat" title="cpu"><span class="k">cpu</span><span class="v">62%</span></div>
  <div class="seg right stat" title="memory"><span class="k">mem</span><span class="v">3.8G</span></div>
  <div class="seg right stat" title="network"><span class="k">net</span><span class="v">↓1.2 ↑0.3</span></div>
  <div class="seg right click"><span class="kbd">⌘K</span></div>
  <div class="seg right click">{user}</div>
  <div class="seg right clock">
    <span>{h}</span><span class="sep">:</span><span>{m}</span><span class="sep">:</span><span>{s}</span>
  </div>
</div>
