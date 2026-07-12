import { type ComponentDoc, SIZE_PROP } from './types'

export const kbd: ComponentDoc = {
  name: 'Kbd',
  slug: 'kbd',
  tagline: 'Display-only key-cap chip for shortcut hints.',
  description:
    'Renders a key combo from the shortcut grammar (`mod+k`, `?, mod+/`) as nested `<kbd>` key caps — correct per-platform glyphs (⌘K on Apple, Ctrl+K elsewhere), mono font, zero radius. Purely visual: it registers nothing and handles no events. Register the actual binding through `shortcuts.add()` / the `shortcut()` attachment, and use `<Kbd>` for the hint in buttons, menus, tooltips, and help overlays.',
  storyId: 'components-kbd--glyph',
  usage: `<script>
  import { Kbd, ariaKeyshortcuts } from 'dssoca';
</script>

<button aria-keyshortcuts={ariaKeyshortcuts('mod+k')}>
  Search <Kbd keys="mod+k" />
</button>

<Kbd keys="?, mod+/" />
<Kbd keys="mod+shift+k" format="label" />
<Kbd>F12</Kbd>`,
  props: [
    {
      name: 'keys',
      type: 'string',
      desc: 'Combo in the shortcut grammar (`mod+k`, `?, mod+/`). `mod` renders per platform; comma alternatives are joined by a muted "or". Malformed input throws (same parser as registration).',
    },
    {
      name: 'format',
      type: "'glyph' | 'label'",
      default: "'glyph'",
      desc: 'glyph = ⌘⇧↵/arrow symbols on Apple (words elsewhere); label = always full words. Glyph roots carry a full-word `aria-label` (⌘ reads poorly in AT).',
    },
    {
      name: 'platform',
      type: "'apple' | 'other'",
      desc: "Override platform auto-detection. Defaults to `'other'` on the server and first client render, corrected in an effect (no hydration mismatch); SSR apps can pass it explicitly for a stable first paint.",
    },
    SIZE_PROP,
    {
      name: 'children',
      type: 'Snippet',
      desc: 'Raw-content escape hatch for keys the grammar cannot express (`<Kbd>F12</Kbd>`). Ignored when `keys` is set.',
    },
  ],
  notes:
    'Kbd is purely visual — assistive tech gets the combo as one full-word name (`aria-label="Command K"` via `role="img"` in glyph format), but the chip alone is not an affordance: never show a key without explanatory text next to it ("Search ⌘K", not a bare chip). The real binding belongs on the owning control — register it through the shortcut registry and set `aria-keyshortcuts` there with the `ariaKeyshortcuts()` helper so AT users learn the shortcut from the control itself.',
  guide: { href: '/keyboard', label: 'Making your site keyboard-friendly' },
}
