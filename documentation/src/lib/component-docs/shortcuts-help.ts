import { type ComponentDoc } from './types'

export const shortcutsHelp: ComponentDoc = {
  name: 'ShortcutsHelp',
  slug: 'shortcuts-help',
  tagline: 'Registry-backed "?" keyboard-shortcuts overlay.',
  description:
    'The GitHub/Slack/Linear-style shortcuts dialog, always in sync with the live shortcut registry: a section per group, `<Kbd>` key caps per binding, remaps shown as their effective combo, and disabled shortcuts struck through with a visible "(off)". Composes `Modal`, so the native `<dialog>` provides the focus trap, Esc-to-close, backdrop, and focus return. Its own hotkey (default `?, mod+/`) is registered through the registry under `ss:shortcuts-help` — it lists itself and can be disabled or remapped like any other shortcut.',
  storyId: 'components-shortcutshelp--default',
  usage: `<script>
  import { ShortcutsHelp, Kbd, shortcuts } from 'dssoca';

  let open = $state(false);

  shortcuts.add({
    id: 'app:save',
    label: 'Save draft',
    keys: 'mod+s',
    group: 'Editing',
    onPress: save,
  });
</script>

<!-- discovery must not be shortcut-only: give it a visible trigger -->
<button onclick={() => (open = true)}>
  Keyboard shortcuts <Kbd keys="?" />
</button>

<ShortcutsHelp bind:open />`,
  props: [
    {
      name: 'open',
      type: 'boolean',
      default: 'false',
      desc: 'Whether the overlay is shown. Bindable — control it yourself, or let the self-registered hotkey manage it.',
    },
    {
      name: 'title',
      type: 'string',
      default: "'Keyboard shortcuts'",
      desc: "Dialog title; wires the dialog's accessible name via Modal's `aria-labelledby`.",
    },
    {
      name: 'hotkey',
      type: 'string | null',
      default: "'?, mod+/'",
      desc: 'Combo(s) that open the overlay, self-registered through the registry (id `ss:shortcuts-help`, group "General") — it appears in its own list and is itself disable-able/remappable. `null` registers nothing (wire your own trigger).',
    },
    {
      name: 'groupOrder',
      type: 'string[]',
      desc: 'Explicit section order by group name. Unlisted groups follow in registration order; by default "General" (also the bucket for ungrouped shortcuts) comes last.',
    },
    {
      name: 'editable',
      type: 'boolean',
      default: 'false',
      desc: 'Built-in WCAG 2.1.4 settings UI: every row gains an enable Switch (`setEnabled`), a Change button that records the next keydown as the new binding (`remap` — Escape cancels, reserved browser combos rejected with feedback), and a Reset once remapped (`remap(id, null)`); a footer adds the global single-key kill switch (`characterKeys`) and a Restore defaults button (`resetOverrides`). Recording suppresses all other shortcuts and every change is announced through a live region.',
    },
    {
      name: 'children',
      type: 'Snippet',
      desc: 'Extra content rendered below the shortcut list (e.g. a note about where remaps persist).',
    },
  ],
  notes:
    'ShortcutsHelp renders whatever the registry holds at that moment — register shortcuts with `shortcuts.add()` / the `shortcut()` attachment and the overlay needs no configuration. Because it composes Modal, the dialog semantics are native: focus trap, Esc-close, backdrop click, and focus return all come from `<dialog>`/`showModal()`. Disabled shortcuts stay visible (struck through, "(off)") so users can see what `setEnabled` turned off — WCAG 2.1.4 state must be discoverable, not silent. The default `?, mod+/` hotkey pairs GitHub\'s `?` with Slack\'s `mod+/` so discovery survives both the `characterKeys` kill switch and screen-reader browse mode; still, always provide a visible trigger (a button wired to `open`) — discovery must never be shortcut-only. An empty registry renders an EmptyState instead of a blank dialog. With `editable`, the overlay doubles as the user-facing remap/disable surface — mounting `<ShortcutsHelp editable />` is the whole WCAG 2.1.4 compliance story; pair it with the localStorage recipe from the keyboard guide (`getOverrides()` on change, `applyOverrides()` at startup) so settings survive the visit.',
  guide: { href: '/keyboard', label: 'Making your site keyboard-friendly' },
}
