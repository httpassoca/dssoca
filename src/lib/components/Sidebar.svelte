<script lang="ts">
  import Icon, { type IconName } from './Icon.svelte'
  import { resolveComponentSize, type Size } from '../config.js'

  type Status = 'up' | 'deg' | 'down'
  interface SideItem { id: string; label: string; icon: IconName; status?: Status }
  interface SideGroup { section: string; items: SideItem[] }

  interface Props {
    active?: string
    onSelect?: (id: string) => void
    groups?: SideGroup[]
    /** Token size (sm|md|lg); inherits the global size when unset. */
    size?: Size
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

  let { active = 'hub', onSelect, groups = DEFAULT_GROUPS, size }: Props = $props()
</script>

<aside class="ss-side" aria-label="Sidebar" data-size-variant={resolveComponentSize('Sidebar', size)}>
  {#each groups as g}
    <div class="section">{g.section}</div>
    {#each g.items as item}
      <div
        class="item {item.id === active ? 'active' : ''}"
        role="button"
        tabindex="0"
        aria-current={item.id === active ? 'page' : undefined}
        onclick={() => onSelect?.(item.id)}
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(item.id) }
        }}
      >
        <Icon name={item.icon} px={13} />
        <span>{item.label}</span>
        {#if item.status}
          <span class="dot {item.status === 'deg' ? 'warn' : item.status === 'down' ? 'err' : ''}" aria-hidden="true"></span>
        {/if}
      </div>
    {/each}
  {/each}
</aside>

<style lang="scss">
  .ss-side {
    border-right: 1px solid var(--ss-line);
    padding: var(--ss-gap) var(--ss-s-1);
    display: flex; flex-direction: column; gap: 1px;
    background: var(--ss-bg);

    .section {
      font-family: var(--ss-font-mono); font-size: var(--ss-ui-xs);
      color: var(--ss-fg-faint); text-transform: uppercase; letter-spacing: 0.12em;
      padding: var(--ss-row-px) var(--ss-row-px) var(--ss-s-1);
    }
    .item {
      display: flex; align-items: center; gap: 8px;
      padding: var(--ss-row-py) var(--ss-row-px); cursor: pointer; color: var(--ss-fg-muted);
      font: 500 var(--ss-ui-md) var(--ss-font-mono);
      border-left: 2px solid transparent;
      transition: all var(--ss-dur-fast) var(--ss-ease);

      &:hover { color: var(--ss-fg); background: rgba(255,255,255,.03); }
      &.active { color: var(--ss-fg); background: rgba(102,239,115,.06); border-left-color: var(--ss-primary); }
      .dot {
        width: 5px; height: 5px; margin-left: auto; background: var(--ss-primary);
        &.warn { background: var(--ss-yellow); }
        &.err  { background: var(--ss-red); }
      }
    }
  }
</style>
