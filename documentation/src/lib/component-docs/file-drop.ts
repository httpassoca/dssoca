import { type ComponentDoc, SIZE_PROP } from './types'

export const fileDrop: ComponentDoc = {
  name: 'FileDrop',
  slug: 'file-drop',
  htmlExample: {
    props: { label: 'Upload', hint: 'PNG or JPG, up to 5 MB', accept: 'image/*' },
    behaviour: 'css',
    note: 'Static zone + hidden input: wire drag/drop, the file list and rejection announcements yourself. Name the zone with aria-labelledby pointing at the label and title ids.',
  },
  tagline: 'Drag-and-drop file upload with click-to-browse.',
  description:
    'A focusable drop zone that wraps a visually-hidden file input. Drag files in, or activate it with click / Enter / Space to open the native picker. Selections honour `accept` and `multiple`, render each file name with a human-readable size, and expose per-file remove plus a Clear control; rejected files are reported via `onreject` and a live announcement. Two-way `bind:files` and an `onfiles` callback keep callers in sync; `hint`/`error` provide field chrome and the error is announced to assistive tech.',
  storyId: 'components-filedrop--default',
  usage: `<script>
  import { FileDrop } from 'dssoca';
  let files = $state([]);
</script>

<FileDrop label="Attachments" bind:files onfiles={(f) => console.log(f)} />
<FileDrop label="Config" accept="application/json,.json" hint="JSON only" />`,
  props: [
    {
      name: 'label',
      type: 'string',
      desc: 'Field label; with the visible "Drop files here" title it names the zone (aria-labelledby).',
    },
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
    {
      name: 'onreject',
      type: '(files: File[]) => void',
      desc: 'Fired with the files a selection/drop discarded (type not in `accept`, or extras when `multiple` is false). Rejections are also announced via a polite live region.',
    },
    SIZE_PROP,
  ],
  notes:
    'The drop zone is `role="button"` + `tabindex=0`, named by its visible text via `aria-labelledby` (label + "Drop files here", so speech input matches what is shown); `hint`/`error` are its description only. The native `<input type="file">` is visually hidden and activated programmatically. Files discarded by `accept` or `multiple={false}` fire `onreject` and are announced in an always-mounted polite live region. Removing a file moves focus to the next remove button (else the previous, else the zone); Clear returns focus to the zone. Remove/Clear have a 24×24 px minimum hit area. WCAG 2.2 AA; vitest-axe clean.',
}
