<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import TierList, { type TierListItem, type TierListTier } from '$lib/components/TierList.svelte'
  import Avatar from '$lib/components/Avatar.svelte'

  const GAMES: TierListItem[] = [
    { id: 'chrono', label: 'Chrono Trigger' },
    { id: 'tetris', label: 'Tetris' },
    { id: 'doom', label: 'Doom' },
    { id: 'sonic', label: 'Sonic the Hedgehog' },
    { id: 'zelda', label: 'A Link to the Past' },
    { id: 'mario', label: 'Super Mario World' },
    { id: 'metroid', label: 'Super Metroid' },
    { id: 'ff6', label: 'Final Fantasy VI' },
  ]

  const FILLED = {
    S: ['chrono', 'zelda'],
    A: ['metroid', 'mario'],
    B: ['tetris'],
    D: ['sonic'],
  }

  const PEOPLE: TierListItem[] = [
    { id: 'ana', label: 'Ana' },
    { id: 'bo', label: 'Bo' },
    { id: 'cy', label: 'Cy' },
    { id: 'di', label: 'Di' },
    { id: 'ed', label: 'Ed' },
  ]

  const THREE: TierListTier[] = [
    { id: 'now', label: 'Now', color: 'var(--ss-blue)' },
    { id: 'next', label: 'Next' },
    { id: 'later', label: 'Later' },
  ]

  const { Story } = defineMeta({
    title: 'Components/TierList',
    component: TierList,
    tags: ['autodocs'],
    render: template,
    parameters: {
      a11y: { test: 'error' },
    },
    argTypes: {
      tray: {
        control: 'text',
        description: "Tray label; the docs' `false` hides the tray.",
      },
      label: { control: 'text', description: 'Accessible name of the whole list.' },
      readonly: {
        control: 'boolean',
        description: 'Display only — no drag, no keyboard sorting.',
      },
      size: {
        control: { type: 'inline-radio' },
        options: [undefined, 'sm', 'md', 'lg'],
        description: 'Per-instance size; inherits the global size when unset.',
      },
    },
    args: {
      tray: 'Unranked',
      label: 'Games',
      readonly: false,
      size: undefined,
    },
  })

  let placements = $state<Record<string, string[]>>({ ...FILLED })
  let log = $state<string[]>([])
</script>

{#snippet template(args: Record<string, unknown>)}
  <div style="max-width: 900px;">
    <TierList
      items={GAMES}
      bind:placements
      tray={args.tray as string}
      label={args.label as string}
      readonly={args.readonly as boolean}
      size={args.size as 'sm' | 'md' | 'lg' | undefined}
      onchange={(p) => (log = [JSON.stringify(p), ...log].slice(0, 3))}
    />
    <p
      style="margin: var(--ss-s-3) 0 0; font-family: var(--ss-font-mono); font-size: var(--ss-ui-xs); color: var(--ss-fg-faint);"
    >
      Drag a tile, or focus one and press Space, arrows, Space. Last onchange:
      {log[0] ?? '—'}
    </p>
  </div>
{/snippet}

<!-- Filled rows + tray, bound placements, onchange log -->
<Story name="Default" />

<!-- Nothing ranked yet: every item waits in the tray -->
{#snippet emptyTemplate()}
  <div style="max-width: 900px;">
    <TierList items={GAMES} label="Games" />
  </div>
{/snippet}
<Story name="Empty" template={emptyTemplate} />

<!-- Custom tiles (an Avatar per person), custom tiers with one explicit colour, no tray -->
{#snippet customTemplate()}
  <div style="max-width: 720px;">
    <TierList
      items={PEOPLE}
      tiers={THREE}
      placements={{ now: ['ana', 'bo'], next: ['cy'], later: ['di', 'ed'] }}
      tray={false}
      label="Who's on call"
      size="sm"
    >
      {#snippet tile(item)}
        <div
          style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--ss-s-1); width: 100%; height: 100%;"
        >
          <Avatar name={item.label} size="sm" />
          <span style="font-family: var(--ss-font-mono); font-size: var(--ss-ui-xs);">
            {item.label}
          </span>
        </div>
      {/snippet}
    </TierList>
  </div>
{/snippet}
<Story name="CustomTiles" template={customTemplate} />

<!-- Display only: someone else's ranking, nothing moves -->
{#snippet readonlyTemplate()}
  <div style="max-width: 900px;">
    <TierList items={GAMES} placements={FILLED} readonly label="Their ranking" />
  </div>
{/snippet}
<Story name="ReadOnly" template={readonlyTemplate} />

<!-- Poster-shaped tiles: override the tile height token on the root -->
{#snippet postersTemplate()}
  <div style="max-width: 900px; --ss-tier-tile-h: 162px;">
    <TierList items={GAMES} placements={FILLED} label="Posters" />
  </div>
{/snippet}
<Story name="PosterTiles" template={postersTemplate} />

<!-- The three sizes side by side -->
{#snippet sizesTemplate()}
  <div style="display: grid; gap: var(--ss-block-gap);">
    {#each ['sm', 'md', 'lg'] as const as size (size)}
      <TierList
        items={PEOPLE}
        tiers={THREE.slice(0, 2)}
        placements={{ now: ['ana', 'bo'], next: ['cy'] }}
        {size}
        label="Size {size}"
      />
    {/each}
  </div>
{/snippet}
<Story name="Sizes" template={sizesTemplate} />

<!-- Both colour themes side by side (the toolbar flips the whole canvas) -->
{#snippet themesTemplate()}
  <div style="display: grid; gap: var(--ss-gap); grid-template-columns: 1fr 1fr;">
    {#each ['dark', 'light'] as const as theme (theme)}
      <div data-theme={theme} style="background: var(--ss-bg); padding: var(--ss-s-4);">
        <TierList
          items={PEOPLE}
          tiers={THREE}
          placements={{ now: ['ana'], next: ['bo', 'cy'], later: ['di'] }}
          size="sm"
          label="Theme {theme}"
        />
      </div>
    {/each}
  </div>
{/snippet}
<Story name="Themes" template={themesTemplate} />
