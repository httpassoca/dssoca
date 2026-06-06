<script lang="ts">
  import Icon, { type IconName } from './Icon.svelte'

  type Status = 'up' | 'deg' | 'down'
  interface SideItem { id: string; label: string; icon: IconName; status?: Status }
  interface SideGroup { section: string; items: SideItem[] }

  interface Props {
    active?: string
    onSelect?: (id: string) => void
    groups?: SideGroup[]
  }

  const DEFAULT_GROUPS: SideGroup[] = [
    { section: 'platform', items: [
      { id: 'hub',   label: 'Hub',   icon: 'grid',     status: 'up' },
      { id: 'auth',  label: 'Auth',  icon: 'user',     status: 'up' },
      { id: 'caddy', label: 'Caddy', icon: 'settings', status: 'up' },
    ]},
    { section: 'services', items: [
      { id: 'movies',  label: 'Movies',  icon: 'film',     status: 'up' },
      { id: 'notes',   label: 'Notes',   icon: 'note',     status: 'up' },
      { id: 'tasks',   label: 'Tasks',   icon: 'check',    status: 'up' },
    ]},
  ]

  let { active = 'hub', onSelect, groups = DEFAULT_GROUPS }: Props = $props()
</script>

<aside class="hub-side">
  {#each groups as g}
    <div class="section">{g.section}</div>
    {#each g.items as item}
      <div
        class="item {item.id === active ? 'active' : ''}"
        role="button"
        tabindex="0"
        onclick={() => onSelect?.(item.id)}
        onkeydown={(e) => e.key === 'Enter' && onSelect?.(item.id)}
      >
        <Icon name={item.icon} size={13} />
        <span>{item.label}</span>
        {#if item.status}
          <span class="dot {item.status === 'deg' ? 'warn' : item.status === 'down' ? 'err' : ''}"></span>
        {/if}
      </div>
    {/each}
  {/each}
</aside>
