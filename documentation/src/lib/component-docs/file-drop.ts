import { type ComponentDoc, SIZE_PROP } from './types'

export const fileDrop: ComponentDoc = {
  name: 'FileDrop',
  slug: 'file-drop',
  tagline: 'Drag-and-drop file upload with click-to-browse.',
  description:
    'A focusable drop zone that wraps a visually-hidden file input. Drag files in, or activate it with click / Enter / Space to open the native picker. Selections honour `accept` and `multiple`, render each file name with a human-readable size, and expose per-file remove plus a Clear control. Two-way `bind:files` and an `onfiles` callback keep callers in sync; `hint`/`error` provide field chrome and the error is announced to assistive tech.',
  storyId: 'components-filedrop--default',
  usage: `<script>
  import { FileDrop } from 'dssoca';
  let files = $state([]);
</script>

<FileDrop label="Attachments" bind:files onfiles={(f) => console.log(f)} />
<FileDrop label="Config" accept="application/json,.json" hint="JSON only" />`,
  props: [
    { name: 'label', type: 'string', desc: "Field label; folded into the zone's accessible name." },
    {
      name: 'accept',
      type: 'string',
      desc: "Native accept filter (e.g. 'application/json,.json'); also enforced on drop.",
    },
    {
      name: 'multiple',
      type: 'boolean',
      default: 'false',
      desc: 'Allow selecting/dropping more than one file.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      desc: 'Disables pointer + keyboard activation and mutes the chrome.',
    },
    { name: 'hint', type: 'string', desc: 'Supplementary helper text rendered under the zone.' },
    {
      name: 'error',
      type: 'string',
      desc: 'Error text rendered under the zone; announced to AT via role="alert".',
    },
    {
      name: 'files',
      type: 'File[]',
      default: '[]',
      desc: 'Selected files. Bindable (`bind:files`).',
    },
    {
      name: 'onfiles',
      type: '(files: File[]) => void',
      desc: 'Fired with the resolved file list whenever the selection changes.',
    },
    SIZE_PROP,
  ],
  notes:
    'The drop zone is `role="button"` + `tabindex=0` with an `aria-label` derived from the label/hint; the native `<input type="file">` is visually hidden and activated programmatically. WCAG 2.2 AA; vitest-axe clean.',
}
