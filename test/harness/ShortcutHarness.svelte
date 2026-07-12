<script lang="ts">
  // DS-0136 — shortcut() attachment harness. Attaches a registration to the
  // <section> so tests can exercise the attachment lifecycle: register on
  // mount, clean up on unmount, re-register reactively when `keys` changes,
  // and `scope: 'focus'` (the inside button is within the attached element,
  // the outside button is not).
  import { shortcut, type ShortcutScope } from '$lib/shortcuts.svelte'

  interface Props {
    id?: string
    label?: string
    keys?: string
    scope?: ShortcutScope
    onPress: (event: KeyboardEvent) => void
  }
  let {
    id = 'test:harness',
    label = 'Harness action',
    keys = 'mod+k',
    scope = 'global',
    onPress,
  }: Props = $props()
</script>

<section data-testid="scope" {@attach shortcut(() => ({ id, label, keys, scope, onPress }))}>
  <button type="button" data-testid="inside">inside</button>
</section>
<button type="button" data-testid="outside">outside</button>
