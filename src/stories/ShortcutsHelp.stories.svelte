<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import ShortcutsHelp from '$lib/components/ShortcutsHelp.svelte'
  import Button from '$lib/components/Button.svelte'
  import Kbd from '$lib/components/Kbd.svelte'
  import { shortcuts } from '$lib/shortcuts.svelte'

  const { Story } = defineMeta({
    title: 'Components/ShortcutsHelp',
    component: ShortcutsHelp,
    tags: ['autodocs'],
    render: template,
    argTypes: {
      title: { control: 'text', description: 'Dialog title (wires the accessible name).' },
      hotkey: {
        control: 'text',
        description:
          'Self-registered opener combo(s) — id `ss:shortcuts-help`, listed in its own overlay. `null` registers nothing.',
      },
      editable: {
        control: 'boolean',
        description:
          'Built-in WCAG 2.1.4 settings UI: per-row enable Switch + keydown-recording remap + reset, global single-key kill switch, restore defaults.',
      },
    },
  })

  // Seed the registry with a sample app's shortcuts so the overlay has live
  // rows to render. Guarded by id so Storybook HMR re-runs don't stack
  // duplicate registrations.
  const SEED = [
    { id: 'sb:search', label: 'Open search', keys: 'mod+k', group: 'Navigation' },
    { id: 'sb:home', label: 'Go to dashboard', keys: 'g', group: 'Navigation' },
    { id: 'sb:save', label: 'Save draft', keys: 'mod+s', group: 'Editing' },
    { id: 'sb:bold', label: 'Bold selection', keys: 'mod+b', group: 'Editing' },
  ]
  for (const s of SEED) {
    if (!shortcuts.items.some((i) => i.id === s.id)) {
      shortcuts.add({ ...s, onPress: () => console.log(`[story] ${s.id}`) })
    }
  }
  // One user-disabled row: the overlay must show the WCAG 2.1.4 truth —
  // struck-through with a visible "(off)", never silently dropped.
  shortcuts.setEnabled('sb:bold', false)

  // Module-scoped $state keeps `open` reactive for the shared `render:
  // template` (mirrors the Modal/SearchPalette story pattern).
  let open = $state(false)
  let openLight = $state(false)
  let openEditable = $state(false)
</script>

<!-- Discovery must never be shortcut-only: the docs pattern is a visible
     trigger wired to `open`, with the hotkey as the power-user path. -->
{#snippet template(args: Record<string, unknown>)}
  <Button variant="secondary" onclick={() => (open = true)}>
    Keyboard shortcuts&nbsp;<Kbd keys="?" />
  </Button>
  <ShortcutsHelp
    bind:open
    title={args.title as string | undefined}
    hotkey={args.hotkey as string | null | undefined}
    editable={args.editable as boolean | undefined}
  />
{/snippet}

<Story name="Default" />

<!-- Explicit section ordering: `groupOrder` names lead, unlisted groups keep
     registration order (default puts "General" last). -->
<Story name="Group order">
  {#snippet template()}
    <Button variant="secondary" onclick={() => (open = true)}>
      Keyboard shortcuts&nbsp;<Kbd keys="?" />
    </Button>
    <ShortcutsHelp bind:open groupOrder={['General', 'Editing', 'Navigation']} />
  {/snippet}
</Story>

<!-- editable (DS-0141): the overlay doubles as the WCAG 2.1.4 settings UI —
     per-row enable Switch (setEnabled) + a Change button that records the next
     keydown as the new binding (Esc cancels; reserved combos rejected) + Reset
     once remapped, plus the global single-key kill switch (characterKeys) and
     Restore defaults (resetOverrides). Persistence stays app-side:
     getOverrides() → storage, applyOverrides() at startup. -->
<Story name="Editable">
  {#snippet template()}
    <Button variant="secondary" onclick={() => (openEditable = true)}>
      Shortcut settings&nbsp;<Kbd keys="?" />
    </Button>
    <ShortcutsHelp bind:open={openEditable} editable>
      Changes live in this registry only — wire getOverrides() to storage to persist them.
    </ShortcutsHelp>
  {/snippet}
</Story>

<!-- Extra content below the list via the children snippet. -->
<Story name="With children">
  {#snippet template()}
    <Button variant="secondary" onclick={() => (open = true)}>
      Keyboard shortcuts&nbsp;<Kbd keys="?" />
    </Button>
    <ShortcutsHelp bind:open>
      Shortcuts can be turned off or remapped — settings persist per browser.
    </ShortcutsHelp>
  {/snippet}
</Story>

<!-- The <dialog> lives in the top layer but still inherits the --ss-* custom
     properties from its DOM ancestor, so a data-theme wrapper re-skins the
     overlay; flip the toolbar theme for the dark counterpart. -->
<Story name="Light theme">
  {#snippet template()}
    <div data-theme="light" style="background: var(--ss-bg); padding: var(--ss-s-4);">
      <Button variant="secondary" onclick={() => (openLight = true)}>
        Keyboard shortcuts&nbsp;<Kbd keys="?" />
      </Button>
      <ShortcutsHelp bind:open={openLight} hotkey={null} />
    </div>
  {/snippet}
</Story>
