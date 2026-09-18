import { type ComponentDoc, SIZE_PROP } from './types'

export const tierList: ComponentDoc = {
  name: 'TierList',
  slug: 'tier-list',
  htmlExample: {
    props: {
      items: [
        { id: 'sonic', label: 'Sonic' },
        { id: 'chrono', label: 'Chrono Trigger' },
        { id: 'tetris', label: 'Tetris' },
        { id: 'doom', label: 'Doom' },
      ],
      placements: { S: ['chrono'], A: ['tetris'] },
      label: 'Games',
    },
    behaviour: 'js',
    note: 'vanilla.js adds pointer drag between and within rows (Pointer Events, so touch works) and the keyboard path — Space picks a tile up, arrows move it, Space drops, Escape cancels — announced through the `.live` region. Emits `ss:change` on the root with `{ placements }`; `data-ss-readonly` on the root makes it display-only.',
  },
  tagline: 'Ranked tier rows with drag-and-drop and keyboard sorting.',
  description:
    'Labelled tier rows (S / A / B / C / D by default, any list of `{ id, label, color? }`) plus an unranked tray, holding one tile per item. Tiles move by pointer drag — between rows and within one, live-reordering with a ghost under the pointer — and by keyboard (Space picks up, arrows move, Space drops, Escape cancels), with every step read out by a polite live region, so ranking never depends on dragging (WCAG 2.2 SC 2.5.7). The component is presentational: what a tile shows is your `tile` snippet (a poster, an Avatar, a Card), and the result comes back as `placements` — tier id → ordered item ids. Row accents are palette slots (accent, cyan, yellow, muted, red, …) rendered as Badge-style washes; sizes read the `--ss-tier-*` tokens.',
  storyId: 'components-tierlist--default',
  usage: `<script>
  import { TierList } from 'dssoca';

  const items = [
    { id: 'sonic', label: 'Sonic' },
    { id: 'chrono', label: 'Chrono Trigger' },
    { id: 'tetris', label: 'Tetris' },
  ];
  let placements = $state({ S: ['chrono'] });
</script>

<TierList {items} bind:placements onchange={(p) => save(p)} label="Games" />

<!-- custom tiles + a details action on Enter / click -->
<TierList {items} bind:placements onselect={(item) => open(item)}>
  {#snippet tile(item)}
    <img src={posters[item.id]} alt="" />
  {/snippet}
</TierList>

<!-- display only -->
<TierList {items} placements={theirs} readonly />`,
  props: [
    {
      name: 'tiers',
      type: 'TierListTier[]',
      default: 'S / A / B / C / D',
      desc: 'The rows, top to bottom: `{ id, label, color? }`. `color` is any CSS colour (prefer a token, `var(--ss-blue)`); by default rows take palette slots by index — accent, cyan, yellow, muted, red, blue, magenta, green — cycling for longer lists.',
    },
    {
      name: 'items',
      type: 'TierListItem[]',
      desc: "Every rankable item: `{ id, label }`. `label` is the tile's accessible name and the default tile text; items in no tier sit in the tray.",
    },
    {
      name: 'placements',
      type: 'Record<string, string[]>',
      desc: 'Tier id → ordered item ids (bindable). The tray is never part of it. Omit it to let the component keep its own order.',
    },
    {
      name: 'onchange',
      type: '(placements: Record<string, string[]>) => void',
      desc: 'Fired after every completed move (pointer drop or keyboard drop) with the new placements.',
    },
    {
      name: 'onselect',
      type: '(item: TierListItem) => void',
      desc: 'Activation — Enter, or a click that is not a drag (open a details view, say). When omitted, Enter picks the tile up like Space.',
    },
    {
      name: 'tile',
      type: 'Snippet<[TierListItem]>',
      desc: 'Tile content; defaults to the label. Images/SVG fill the tile frame edge to edge.',
    },
    {
      name: 'tray',
      type: 'string | false',
      default: "'Unranked'",
      desc: 'Label of the unranked tray, or `false` to hide it (then every item must appear in `placements`).',
    },
    {
      name: 'label',
      type: 'string',
      default: "'Tier list'",
      desc: 'Accessible name of the whole list (`role="group"`).',
    },
    {
      name: 'readonly',
      type: 'boolean',
      default: 'false',
      desc: 'Display only: tiles are plain boxes, nothing drags or sorts. Renders `data-ss-readonly` on the root (the plain-HTML switch).',
    },
    SIZE_PROP,
  ],
  notes:
    'Keyboard: every tile is a real `<button>` named after its item with `aria-describedby` instructions and `aria-pressed` while picked up; the live region (`role="status"`) reads "Picked up Alpha, S, position 1 of 3…", each move, the drop and a cancel. Left/Right step within the row (no wrap — the edges mean something), Home/End jump, Up/Down move to the neighbouring row keeping the position, and leaving the tile (Tab, a click elsewhere) cancels. Pointer: tiles set `touch-action: none` so a finger drags instead of scrolling the page; a drag starts after 4px, previews live and commits on release; `pointercancel` restores. Data: `placements` is the whole truth — keep it and re-render, or `bind:` it. Tile size is square by default (`--ss-tier-tile-w/h`); posters want `style="--ss-tier-tile-h: 162px"` on the root (1.5×). Zero radius; no colour literals — row washes are `color-mix()` of the slot.',
  guide: { href: '/vanilla', label: 'Plain HTML & CSS — the vanilla.js behaviours' },
}
