<script lang="ts">
  import '@dssoca/styles/theme.scss'
  import '$lib/styles/code.css'
  import { onMount, untrack } from 'svelte'
  import { browser } from '$app/environment'
  import { page } from '$app/state'
  import { goto } from '$app/navigation'
  import {
    Sidebar,
    Icon,
    Topbar,
    SearchPalette,
    ShortcutsHelp,
    Toaster,
    shortcuts,
    toast,
  } from 'dssoca'
  import { NAV } from '$lib/docs.config'
  import { buildSearchItems, INSTALL_COMMAND, type DocsSearchItem } from '$lib/search'
  import { axes } from '$lib/axes.svelte'
  import { restoreShortcutOverrides, saveShortcutOverrides } from '$lib/shortcut-persistence'
  import ThemeControls from '$lib/components/ThemeControls.svelte'

  let { children } = $props()

  // Map the docs nav into the dssoca Sidebar's group shape — the item `id` is
  // the route, so `active` / `onSelect` drive real navigation (dogfooding).
  const groups = NAV.map((g) => ({
    section: g.section,
    items: g.items.map((it) => ({ id: it.href, label: it.label, icon: it.icon as never })),
  }))

  // Normalise trailing slash so the active item matches (trailingSlash: always).
  const current = $derived(page.url.pathname.replace(/\/$/, '') || '/')

  // The landing route ('/') is a full-screen branded hero — render it WITHOUT the
  // docs shell (no top bar / sidebar). The palette + shortcuts below still work there.
  const isLanding = $derived(current === '/')

  function navigate(id: string) {
    goto(id)
  }

  // --- keyboard: site search + shortcuts (DS-0147) ---------------------------
  // The site dogfoods the library's own keyboard layer: Topbar owns mod+k and
  // opens the SearchPalette (so the palette's built-in mod+k is off on shell
  // routes — the landing has no Topbar, so there the palette registers it
  // itself); ShortcutsHelp lists everything the registry holds and is
  // editable, with overrides persisted in localStorage.
  const searchItems = buildSearchItems()
  let paletteOpen = $state(false)
  let helpOpen = $state(false)

  function runAction(item: DocsSearchItem): boolean | void {
    if (item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer')
      return
    }
    switch (item.action) {
      case 'toggle-theme':
        axes.nextTheme()
        break
      case 'cycle-size':
        axes.nextSize()
        break
      case 'open-help':
        helpOpen = true
        break
      case 'copy-install':
        navigator.clipboard
          ?.writeText(INSTALL_COMMAND)
          .then(() => toast.success(`Copied "${INSTALL_COMMAND}"`))
          .catch(() => toast.error('Clipboard unavailable'))
        break
    }
    // `href` items navigate through their own anchor; nothing to do here.
  }

  onMount(() => {
    axes.sync()
    const disposers = [
      shortcuts.add({
        id: 'docs:search',
        label: 'Open search',
        keys: '/',
        group: 'General',
        onPress: () => (paletteOpen = true),
      }),
      shortcuts.add({
        id: 'docs:toggle-theme',
        label: 'Toggle theme (dark / light)',
        keys: 'shift+d',
        group: 'Appearance',
        onPress: () => axes.nextTheme(),
      }),
      shortcuts.add({
        id: 'docs:cycle-size',
        label: 'Cycle size (sm / md / lg)',
        keys: 'shift+s',
        group: 'Appearance',
        onPress: () => axes.nextSize(),
      }),
    ]
    return () => disposers.forEach((d) => d())
  })

  // Persist after any change the editable overlay makes (remap, per-id toggle,
  // the global switches) — `items` is derived from those, so reading it here
  // tracks all of them. The first run restores instead of saving: restoring
  // anywhere else (e.g. onMount) races this effect, which would clobber the
  // stored snapshot with the empty default before it was read. Overrides for
  // ids registered later are kept pending by the registry, so order vs. the
  // `shortcuts.add` calls above does not matter.
  let restored = false
  $effect(() => {
    if (!browser) return
    void shortcuts.items
    void shortcuts.characterKeys
    void shortcuts.enabled
    if (!restored) {
      restored = true
      untrack(() => restoreShortcutOverrides())
      return
    }
    saveShortcutOverrides()
  })
</script>

{#snippet brand()}
  <a class="brand" href="/">
    <img class="logo" src="/dssoca-logo.svg" alt="" width="22" height="22" />
    <span class="name">dssoca</span>
    <span class="tag">docs</span>
  </a>
{/snippet}

{#snippet tools()}
  <div class="tools">
    <ThemeControls />
    <a
      class="ext"
      href="https://github.com/httpassoca/dssoca"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GitHub repository"
    >
      <Icon name="external" px={16} title="GitHub repository" />
    </a>
  </div>
{/snippet}

{#if isLanding}
  {@render children?.()}
{:else}
  <div class="docs">
    <Topbar
      {brand}
      userMenu={tools}
      tabs={[]}
      stats={[]}
      services={false}
      clock={false}
      skipTarget="#main"
      onCommand={() => (paletteOpen = true)}
    />

    <div class="body">
      <nav class="nav" aria-label="Documentation">
        <Sidebar active={current} {groups} onSelect={navigate} />
      </nav>
      <main id="main" class="main" tabindex="-1">
        {@render children?.()}
      </main>
    </div>
  </div>
{/if}

<!-- Mounted on every route (landing included) so mod+k / "/" / "?" work anywhere. -->
<SearchPalette
  bind:open={paletteOpen}
  items={searchItems}
  shortcut={isLanding ? 'mod+k' : false}
  placeholder="Search pages, components, actions…"
  aria-label="Search the docs"
  onselect={runAction}
/>
<ShortcutsHelp bind:open={helpOpen} editable groupOrder={['Appearance']} />
<Toaster />

<style lang="scss">
  // Docs-only polish: a plain, always-on transition so flipping the theme
  // (data-theme) or size (data-size-variant) eases instead of snapping. Token
  // values change → these properties recompute → they animate. No !important,
  // so a component's own hover/focus transitions still win where they set one;
  // this just covers the page surfaces (background, text, borders) and the
  // size-driven box metrics.
  //
  // NOTE: deliberately NOT gated on prefers-reduced-motion. The design tokens
  // collapse --ss-dur* to 0ms under "reduce motion", and a media query here did
  // the same — which made this flip instant on machines with that OS setting.
  // This is a mild ~250ms color/size crossfade (no large motion), so we keep it
  // on for everyone; revisit if it needs to honour reduced-motion later.
  :global(html),
  :global(html *),
  :global(html *::before),
  :global(html *::after) {
    transition:
      background-color 0.25s ease,
      color 0.25s ease,
      border-color 0.25s ease,
      outline-color 0.25s ease,
      fill 0.25s ease,
      stroke 0.25s ease,
      padding 0.25s ease,
      gap 0.25s ease,
      font-size 0.25s ease;
  }

  .docs {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--ss-bg);
    color: var(--ss-fg);
  }
  // Rendered inside the dssoca Topbar's `brand` / `userMenu` slots.
  .brand {
    display: inline-flex;
    align-items: center;
    gap: var(--ss-s-2);
    text-decoration: none;

    .logo {
      display: block;
    }
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
  .tools {
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
    outline: none;
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
