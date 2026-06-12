<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Menu from '$lib/components/Menu.svelte'
  import type { MenuItem } from '$lib/components/Menu.svelte'

  const actionItems: MenuItem[] = [
    { id: 'edit', label: 'Edit', icon: 'note' },
    { id: 'dup', label: 'Duplicate', icon: 'grid' },
    { id: 'archive', label: 'Archive', icon: 'database', disabled: true },
    { id: 'delete', label: 'Delete', icon: 'logs' },
  ]

  const themeItems: MenuItem[] = [
    { id: 'dark', label: 'Dark', icon: 'grid', selected: true },
    { id: 'light', label: 'Light', icon: 'grid', selected: false },
  ]

  // DS-0088 — per-item leading visuals beyond `icon`.
  const swatchItems: MenuItem[] = [
    { id: 'dark', label: 'Dark', swatch: '#0a0a0a', selected: true },
    { id: 'light', label: 'Light', swatch: '#fafafa', selected: false },
    { id: 'lime', label: 'Lime', swatch: '#bef264', selected: false },
    { id: 'cyan', label: 'Cyan', swatch: '#22d3ee', selected: false },
  ]

  const languageItems: MenuItem[] = [
    { id: 'en', label: 'English', emoji: '🇬🇧', selected: true },
    { id: 'pt', label: 'Português', emoji: '🇧🇷', selected: false },
    { id: 'de', label: 'Deutsch', emoji: '🇩🇪', selected: false },
  ]

  // Mixed leading visuals stay aligned (all sized from --ss-icon).
  const mixedItems: MenuItem[] = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'theme', label: 'Theme', swatch: '#bef264' },
    { id: 'lang', label: 'Language', emoji: '🌐' },
    { id: 'plain', label: 'No visual' },
  ]

  const { Story } = defineMeta({
    title: 'Components/Menu',
    component: Menu,
    tags: ['autodocs'],
    // Shared `render: template` — the trigger text reuses the accessible
    // `label` arg so one snippet serves every story and controls bind reliably.
    render: template,
    argTypes: {
      align: {
        control: { type: 'inline-radio' },
        options: ['start', 'end'],
        description: 'Horizontal edge the panel aligns to.',
      },
      side: {
        control: { type: 'inline-radio' },
        options: ['bottom', 'top'],
        description: 'Vertical side the panel opens toward.',
      },
      size: {
        control: { type: 'inline-radio' },
        options: ['sm', 'md', 'lg'],
        description: 'Token size override; inherits the ancestor data-size-variant when unset.',
      },
      label: {
        control: 'text',
        description:
          'Accessible label for the panel (role="menu"); falls back to the trigger text.',
      },
      onSelect: {
        action: 'onSelect',
        description: 'Fired when an item is activated, with its id.',
      },
    },
    args: {
      items: actionItems,
      align: 'start',
      side: 'bottom',
      label: 'Actions',
      onSelect: () => {},
    },
  })
</script>

{#snippet template(args: Record<string, unknown>)}
  <Menu
    items={args.items as MenuItem[]}
    align={args.align as 'start' | 'end'}
    side={args.side as 'bottom' | 'top'}
    size={args.size as 'sm' | 'md' | 'lg' | undefined}
    label={args.label as string}
    onSelect={args.onSelect as (id: string) => void}
  >
    {args.label}
  </Menu>
{/snippet}

<Story name="Default" args={{ items: actionItems, label: 'Actions' }} />

<Story name="Selectable (radio)" args={{ items: themeItems, label: 'Theme' }} />

<Story name="Align end" args={{ items: actionItems, align: 'end', label: 'Actions' }} />

<Story name="Swatch leading (theme picker)" args={{ items: swatchItems, label: 'Theme' }} />

<Story name="Emoji leading (language picker)" args={{ items: languageItems, label: 'Language' }} />

<Story name="Mixed leading visuals" args={{ items: mixedItems, label: 'Navigate' }} />

<!-- Explicit token size override, independent of the global size axis -->
<Story name="Compact (sm)" args={{ items: actionItems, label: 'Actions', size: 'sm' }} />
