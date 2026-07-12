<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import SearchPalette, { type SearchPaletteItem } from '$lib/components/SearchPalette.svelte'
  import Button from '$lib/components/Button.svelte'

  const { Story } = defineMeta({
    title: 'Components/SearchPalette',
    component: SearchPalette,
    tags: ['autodocs'],
    render: template,
    argTypes: {
      filter: {
        control: 'boolean',
        description: 'Internal substring filter over label+keywords; false = consumer filters.',
      },
      placeholder: { control: 'text' },
      emptyText: { control: 'text' },
      footerText: {
        control: 'text',
        description: 'Footer hint row; false hides it.',
      },
      size: {
        control: { type: 'inline-radio' },
        options: ['sm', 'md', 'lg'],
        description: 'Token size override; controls the panel width.',
      },
    },
    args: {
      filter: true,
      placeholder: 'Search…',
    },
  })

  // Grouped nav items + an ungrouped command, mirroring the docs-search use
  // case the component was extracted from. Groups render in first-appearance
  // order; ungrouped items lead.
  const navItems: SearchPaletteItem[] = [
    { id: 'toggle-theme', label: 'Toggle theme', hint: 'command' },
    { id: 'home', label: 'Home', href: '#home', group: 'Pages' },
    { id: 'tokens', label: 'Tokens', href: '#tokens', group: 'Pages', keywords: ['colors'] },
    { id: 'themes', label: 'Theming', href: '#themes', group: 'Pages' },
    { id: 'post-012', label: 'Release 0.12', href: '#0-12', group: 'Posts', hint: 'color rework' },
    { id: 'post-011', label: 'Release 0.11', href: '#0-11', group: 'Posts', hint: 'charts' },
    { id: 'wip', label: 'Drafts', group: 'Posts', disabled: true },
  ]

  // Module-scoped $state keeps it reactive for the shared `render: template`
  // (mirrors the Modal story pattern).
  let open = $state(false)

  // External-filter story: the consumer owns `query` and hands the palette a
  // pre-filtered list (stand-in for an async search engine).
  let extQuery = $state('')
  const extItems = $derived(
    extQuery.trim()
      ? navItems.filter((i) =>
          [i.label, ...(i.keywords ?? [])]
            .join(' ')
            .toLowerCase()
            .includes(extQuery.trim().toLowerCase()),
        )
      : navItems,
  )
</script>

{#snippet template(args: Record<string, unknown>)}
  <Button onclick={() => (open = true)}>Open palette (or press Ctrl/Cmd+K)</Button>
  <SearchPalette
    bind:open
    items={navItems}
    filter={args.filter as boolean}
    placeholder={args.placeholder as string}
    emptyText={args.emptyText as string | undefined}
    footerText={args.footerText as string | false | undefined}
    size={args.size as 'sm' | 'md' | 'lg' | undefined}
    onselect={(item) => console.log('selected', item.id)}
  />
{/snippet}

<Story name="Default" />

<!-- Custom row rendering: the `item` snippet receives the item and its active
     flag. Keep snippet content non-interactive — it renders inside
     role="option" and focus never leaves the input. -->
<Story name="Custom item snippet">
  {#snippet template()}
    <Button onclick={() => (open = true)}>Open palette</Button>
    <SearchPalette bind:open items={navItems} shortcut={false}>
      {#snippet item(it, { active })}
        <span style:font-weight={active ? '700' : '400'}>
          {active ? '▸ ' : ''}{it.label}
        </span>
      {/snippet}
    </SearchPalette>
  {/snippet}
</Story>

<!-- Consumer-owned filtering: `filter={false}` + bind:query — the palette
     renders exactly the items it is given (stand-in for async search). -->
<Story name="External filter">
  {#snippet template()}
    <Button onclick={() => (open = true)}>Open palette</Button>
    <SearchPalette
      bind:open
      bind:query={extQuery}
      items={extItems}
      filter={false}
      shortcut={false}
    />
  {/snippet}
</Story>

<Story name="No footer" args={{ footerText: false }} />

<Story name="Small" args={{ size: 'sm' }} />
