import { type ComponentDoc, SIZE_PROP } from './types'

export const modal: ComponentDoc = {
  name: 'Modal',
  slug: 'modal',
  tagline: 'Accessible overlay dialog built on native <dialog>.',
  description:
    'A modal dialog built on the native `<dialog>` element, so the platform supplies the focus trap, Esc-to-close and an inert backdrop. Bind `open` to your state; the dialog opens/closes in lock-step. Optional `header`/`footer` snippets frame the body, `closeOnBackdrop`/`closeOnEsc` tune dismissal, and `danger` flags destructive dialogs. Sets `aria-labelledby` to the `title` automatically, or accepts an `aria-label` when untitled.',
  storyId: 'components-modal--default',
  usage: `<script>
  import { Modal, Button } from 'dssoca';
  let open = $state(false);
</script>

<Button onclick={() => (open = true)}>Open</Button>
<Modal bind:open title="Confirm action">
  {#snippet footer()}
    <Button variant="ghost" onclick={() => (open = false)}>Cancel</Button>
    <Button onclick={() => (open = false)}>Confirm</Button>
  {/snippet}
  <p>Are you sure you want to continue?</p>
</Modal>`,
  props: [
    {
      name: 'open',
      type: 'boolean',
      default: 'false',
      desc: 'Bindable. Whether the modal is shown; syncs to the native dialog.',
    },
    {
      name: 'title',
      type: 'string',
      desc: 'Header title; wires `aria-labelledby`. Omit and pass `aria-label` for an untitled dialog.',
    },
    {
      name: 'closeOnBackdrop',
      type: 'boolean',
      default: 'true',
      desc: 'Clicking outside the panel (on the backdrop) closes the modal.',
    },
    {
      name: 'closeOnEsc',
      type: 'boolean',
      default: 'true',
      desc: 'Esc closes the modal. When false the cancel event is prevented.',
    },
    {
      name: 'danger',
      type: 'boolean',
      default: 'false',
      desc: 'Styling hint for destructive dialogs (tints the title).',
    },
    {
      name: 'aria-label',
      type: 'string',
      desc: 'Accessible name used when no `title` is set.',
    },
    {
      name: 'onclose',
      type: '() => void',
      desc: 'Called after the dialog closes (Esc, backdrop, or button).',
    },
    {
      name: 'header',
      type: 'Snippet',
      desc: 'Replaces the default title row in the header.',
    },
    {
      name: 'footer',
      type: 'Snippet',
      desc: 'Footer content, typically a trailing cancel→confirm action pair (the affirmative `Button` trails the dismissive `ghost` one, per dialog convention).',
    },
    {
      name: 'children',
      type: 'Snippet',
      desc: 'Required. The modal body content.',
    },
    SIZE_PROP,
  ],
  notes:
    'Uses the native `<dialog>` element: the browser provides the focus trap, Esc handling and an inert `::backdrop`. `aria-labelledby` points at the title when set; otherwise pass `aria-label`. The close button carries `aria-label="Close"`. Size controls the dialog max-width only. Zero border-radius.',
}
