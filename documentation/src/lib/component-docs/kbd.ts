import { type ComponentDoc, SIZE_PROP } from './types'

export const kbd: ComponentDoc = {
  name: 'Kbd',
  slug: 'kbd',
  htmlExample: {
    props: { keys: 'mod+k' },
    behaviour: 'css',
    note: "Rendered for the platform at build time; the Svelte component adapts to the visitor's OS.",
  },
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
      name: 'hideOnMobile',
      type: 'boolean',
      default: 'true',
      desc: 'Hide the chip on devices without a keyboard — a capability query, `(hover: none) and (pointer: coarse)` (phones, tablets), not a width. Pass `false` where the chip *is* the content (a shortcuts list, a keyboard guide); it then renders `data-hide-on-mobile="false"` on the root.',
    },
    {
      name: 'children',
      type: 'Snippet',
      desc: 'Raw-content escape hatch for keys the grammar cannot express (`<Kbd>F12</Kbd>`). Ignored when `keys` is set.',
    },
  ],
  notes:
    'Kbd is purely visual — assistive tech gets the combo as one full-word name (`aria-label="Command K"` via `role="img"` in glyph format), but the chip alone is not an affordance: never show a key without explanatory text next to it ("Search ⌘K", not a bare chip). The real binding belongs on the owning control — register it through the shortcut registry and set `aria-keyshortcuts` there with the `ariaKeyshortcuts()` helper so AT users learn the shortcut from the control itself. **Hidden on touch devices by default** (`hideOnMobile`): a key cap is noise where the only input is a finger, so on `(hover: none) and (pointer: coarse)` viewports the chip is `display: none` (out of the a11y tree too). That is a capability query, not a width — a narrow desktop window keeps its hints. Opt out with `hideOnMobile={false}` where the chip is the subject rather than a hint (ShortcutsHelp does this for its rows); the surrounding text is yours to hide ("Enter to send" should not degrade to "to send"). Plain HTML: `.ss-kbd` hides the same way, and `data-hide-on-mobile="false"` on the root opts out.',
  guide: { href: '/keyboard', label: 'Making your site keyboard-friendly' },
}
