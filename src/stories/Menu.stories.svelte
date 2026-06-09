<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Menu from '$lib/components/Menu.svelte';
  import type { MenuItem } from '$lib/components/Menu.svelte';

  const actionItems: MenuItem[] = [
    { id: 'edit', label: 'Edit', icon: 'note' },
    { id: 'dup', label: 'Duplicate', icon: 'grid' },
    { id: 'archive', label: 'Archive', icon: 'database', disabled: true },
    { id: 'delete', label: 'Delete', icon: 'logs' },
  ];

  const themeItems: MenuItem[] = [
    { id: 'dark', label: 'Dark', icon: 'grid', selected: true },
    { id: 'light', label: 'Light', icon: 'grid', selected: false },
  ];

  const { Story } = defineMeta({
    title: 'Components/Menu',
    component: Menu,
    tags: ['autodocs'],
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
    },
    args: {
      items: actionItems,
      align: 'start',
      side: 'bottom',
      label: 'Actions',
    },
  });
</script>

{#snippet trigger(args: Record<string, unknown>)}
  <Menu
    items={args.items as MenuItem[]}
    align={args.align as 'start' | 'end'}
    side={args.side as 'bottom' | 'top'}
    label={args.label as string}
  >
    Actions
  </Menu>
{/snippet}

<Story name="Default" args={{ items: actionItems, label: 'Actions' }}>
  {#snippet template(args)}{@render trigger(args)}{/snippet}
</Story>

<Story name="Selectable (radio)" args={{ items: themeItems, label: 'Theme' }}>
  {#snippet template(args)}
    <Menu
      items={args.items as MenuItem[]}
      align={args.align as 'start' | 'end'}
      side={args.side as 'bottom' | 'top'}
      label={args.label as string}
    >
      Theme
    </Menu>
  {/snippet}
</Story>

<Story name="Align end" args={{ items: actionItems, align: 'end', label: 'Actions' }}>
  {#snippet template(args)}{@render trigger(args)}{/snippet}
</Story>
