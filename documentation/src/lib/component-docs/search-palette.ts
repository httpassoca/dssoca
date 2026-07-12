import { type ComponentDoc, SIZE_PROP } from './types'

export const searchPalette: ComponentDoc = {
  name: 'SearchPalette',
  slug: 'search-palette',
  tagline: 'Cmd/Ctrl+K search & command palette.',
  description:
    'A keyboard-first search palette: a modal combobox over a grouped listbox, built on the native `<dialog>` like Modal. Bind `open` (the default `mod+k` shortcut toggles it globally), hand it `items`, and it filters, groups and keyboard-navigates them — focus stays on the input the whole time (`aria-activedescendant` pattern). Items with `href` render as real anchors, so Enter and click take the exact same native navigation path your router already intercepts. For async/external search, set `filter={false}` and bind `query`: the palette renders exactly the pre-filtered `items` you pass.',
  storyId: 'components-searchpalette--default',
  usage: `<script>
  import { SearchPalette } from 'dssoca';
  let open = $state(false);
</script>

<!-- opens with Ctrl/Cmd+K (or set bind:open yourself) -->
<SearchPalette
  bind:open
  items={[
    { id: 'home', label: 'Home', href: '/', group: 'Pages' },
    { id: 'tokens', label: 'Tokens', href: '/tokens', group: 'Pages', keywords: ['colors'] },
    { id: 'theme', label: 'Toggle theme' },
  ]}
  onselect={(item) => item.id === 'theme' && toggleTheme()}
/>`,
  props: [
    {
      name: 'open',
      type: 'boolean',
      default: 'false',
      desc: 'Bindable. Whether the palette is shown; syncs to the native dialog.',
    },
    {
      name: 'items',
      type: 'SearchPaletteItem[]',
      desc: 'Required. Entries: `{ id, label, hint?, href?, group?, keywords?, disabled? }`. `href` items render as real `<a>`s (native routing); `group` buckets render in first-appearance order, ungrouped items first.',
    },
    {
      name: 'query',
      type: 'string',
      default: "''",
      desc: 'Bindable. The search text — bind it when you own filtering (`filter={false}`).',
    },
    {
      name: 'filter',
      type: 'boolean',
      default: 'true',
      desc: 'Internal case/diacritic-insensitive substring filter over `label` + `keywords`. Set false and pass pre-filtered `items` for external/async search.',
    },
    {
      name: 'shortcut',
      type: "'mod+k' | false",
      default: "'mod+k'",
      desc: 'Global toggle chord (Cmd+K on macOS, Ctrl+K elsewhere). `false` disables it.',
    },
    {
      name: 'placeholder',
      type: 'string',
      default: "'Search…'",
      desc: 'Input placeholder.',
    },
    {
      name: 'emptyText',
      type: 'string',
      default: "'No results'",
      desc: 'No-results text (when the `empty` snippet is absent).',
    },
    {
      name: 'footerText',
      type: 'string | false',
      default: "'↑↓ navigate · ↵ open · esc close'",
      desc: 'Footer hint row; `false` hides it. A `footer` snippet replaces it entirely.',
    },
    {
      name: 'resetOnClose',
      type: 'boolean',
      default: 'true',
      desc: 'Clear the query and selection when the palette closes.',
    },
    {
      name: 'aria-label',
      type: 'string',
      default: "'Search'",
      desc: 'Accessible name for the dialog, input and listbox.',
    },
    {
      name: 'onselect',
      type: '(item: T) => void | boolean',
      desc: 'Called with the chosen item on Enter/click. Return `false` to keep the palette open.',
    },
    {
      name: 'onopen',
      type: '() => void',
      desc: 'Called after the palette opens.',
    },
    {
      name: 'onclose',
      type: '() => void',
      desc: 'Called after the palette closes (Esc, backdrop, or selection).',
    },
    {
      name: 'item',
      type: 'Snippet<[T, { active: boolean }]>',
      desc: 'Replaces the default row body (label + hint). Must render non-interactive content — it lives inside `role="option"` and focus never leaves the input.',
    },
    {
      name: 'empty',
      type: 'Snippet<[string]>',
      desc: 'Replaces the default no-results state; receives the current query.',
    },
    {
      name: 'footer',
      type: 'Snippet',
      desc: 'Replaces the footer text row.',
    },
    SIZE_PROP,
  ],
  notes:
    'Built on the native `<dialog>` (focus trap, Esc, top layer, `::backdrop`) with the ARIA APG combobox pattern: focus stays on the input and options are referenced via `aria-activedescendant` — never DOM-focused. ArrowUp/Down wrap, PageUp/PageDown jump to first/last (Home/End keep their native caret behavior), Tab is swallowed while open, disabled items are skipped. The component is generic (`T extends SearchPaletteItem`), so your extra item fields flow through `onselect` and the `item` snippet typed. With several palettes mounted, the last one mounted wins the `mod+k` chord. Size controls the panel width only. Zero border-radius.',
}
