<script lang="ts">
  import '@dssoca/styles/theme.scss';
  import '$lib/styles/code.css';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { PassocaMark, Sidebar, Icon } from 'dssoca';
  import { NAV } from '$lib/docs.config';
  import ThemeControls from '$lib/components/ThemeControls.svelte';

  let { children } = $props();

  // Map the docs nav into the dssoca Sidebar's group shape — the item `id` is
  // the route, so `active` / `onSelect` drive real navigation (dogfooding).
  const groups = NAV.map((g) => ({
    section: g.section,
    items: g.items.map((it) => ({ id: it.href, label: it.label, icon: it.icon as never })),
  }));

  // Normalise trailing slash so the active item matches (trailingSlash: always).
  const current = $derived(page.url.pathname.replace(/\/$/, '') || '/');

  function navigate(id: string) {
    goto(id);
  }
</script>

<div class="docs">
  <header class="topbar">
    <a class="brand" href="/">
      <PassocaMark px={22} />
      <span class="name">dssoca</span>
      <span class="tag">docs</span>
    </a>
    <div class="right">
      <ThemeControls />
      <a class="ext" href="https://github.com/httpassoca/dssoca" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository">
        <Icon name="external" px={16} title="GitHub repository" />
      </a>
    </div>
  </header>

  <div class="body">
    <nav class="nav" aria-label="Documentation">
      <Sidebar active={current} groups={groups} onSelect={navigate} />
    </nav>
    <main class="main">
      {@render children?.()}
    </main>
  </div>
</div>

<style lang="scss">
  .docs {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--ss-bg);
    color: var(--ss-fg);
  }
  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--ss-shell-top-h);
    padding: 0 var(--ss-main-px);
    border-bottom: 1px solid var(--ss-line);
    position: sticky;
    top: 0;
    z-index: 10;
    background: var(--ss-bg);
  }
  .brand {
    display: inline-flex;
    align-items: center;
    gap: var(--ss-s-2);
    text-decoration: none;

    .name {
      font-family: var(--ss-font-display);
      font-size: var(--ss-ui-lg);
      color: var(--ss-fg-shine);
      letter-spacing: 0.02em;
    }
    .tag {
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-xs);
      color: var(--ss-fg-faint);
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }
  }
  .right {
    display: inline-flex;
    align-items: center;
    gap: var(--ss-gap);
  }
  .ext {
    display: inline-flex;
    color: var(--ss-fg-muted);

    &:hover {
      color: var(--ss-primary);
    }
  }
  .body {
    flex: 1;
    display: grid;
    grid-template-columns: var(--ss-shell-side-w) 1fr;
    align-items: start;
  }
  .nav {
    position: sticky;
    top: var(--ss-shell-top-h);
    height: calc(100vh - var(--ss-shell-top-h));
    overflow-y: auto;
  }
  .main {
    padding: var(--ss-main-py) var(--ss-main-px);
    min-width: 0;
  }
  @media (max-width: 720px) {
    .body {
      grid-template-columns: 1fr;
    }
    .nav {
      position: static;
      height: auto;
    }
  }
</style>
