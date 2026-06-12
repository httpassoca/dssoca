import { type ComponentDoc, SIZE_PROP } from './types'

export const textarea: ComponentDoc = {
  name: 'Textarea',
  slug: 'textarea',
  tagline: 'Multiline twin of Input with an autosize option.',
  description:
    'A multiline text field that mirrors `Input`’s anatomy — label with auto-wired id, `hint`/`error` helper text (error implies aria-invalid and is announced), readonly/disabled styling, and native attribute forwarding — so the two sit side by side in a form without visual drift. Adds `rows` for the minimum height and an `autosize` mode that grows with content (`field-sizing: content` where supported, a scrollHeight fallback elsewhere) capped by `maxRows`.',
  storyId: 'components-textarea--with-label',
  usage: `<script>
  import { Textarea } from 'dssoca';
  let message = $state('');
</script>

<Textarea
  label="message"
  bind:value={message}
  placeholder="Say something nice…"
  hint="Markdown is fine."
  autosize
  maxRows={8}
/>`,
  props: [
    { name: 'label', type: 'string', desc: 'Visible label (associated via generated id).' },
    { name: 'value', type: 'string', default: "''", desc: 'Bindable value.' },
    { name: 'placeholder', type: 'string', desc: 'Placeholder text.' },
    {
      name: 'rows',
      type: 'number',
      default: '3',
      desc: 'Visible rows; the minimum height (also while autosizing).',
    },
    {
      name: 'autosize',
      type: 'boolean',
      default: 'false',
      desc: 'Grow with content (`field-sizing: content`, JS fallback); disables manual resize.',
    },
    {
      name: 'maxRows',
      type: 'number',
      default: '10',
      desc: 'Row cap while autosizing — the field scrolls beyond it.',
    },
    {
      name: 'required',
      type: 'boolean',
      default: 'false',
      desc: 'Marks the field required (adds a marker).',
    },
    { name: 'disabled', type: 'boolean', default: 'false', desc: 'Disable the field.' },
    {
      name: 'readonly',
      type: 'boolean',
      default: 'false',
      desc: 'Native readonly — value visible but not editable; rendered muted.',
    },
    {
      name: 'invalid',
      type: 'boolean',
      desc: 'Apply invalid styling + aria-invalid (also implied by `error`).',
    },
    {
      name: 'hint',
      type: 'string',
      desc: 'Helper text rendered under the textarea and wired via aria-describedby.',
    },
    {
      name: 'error',
      type: 'string',
      desc: 'Error text under the textarea; implies aria-invalid and is announced to AT.',
    },
    {
      name: 'describedby',
      type: 'string',
      desc: 'id(s) of additional describing element(s) (aria-describedby).',
    },
    { name: 'maxlength', type: 'number', desc: 'Native maxlength.' },
    { name: 'oninput', type: '(e) => void', desc: 'Input handler.' },
    SIZE_PROP,
    {
      name: '...rest',
      type: 'HTMLTextareaAttributes',
      desc: 'Any remaining native textarea attributes / handlers are forwarded.',
    },
  ],
  notes:
    'Shares `Input`’s field tokens (`--ss-input-*`) and focus/error treatment. The label is auto-associated even without an explicit `id`; `aria-describedby` orders error, then hint, then any caller-supplied ids, and the error is announced via `role="alert"`. Without `autosize` the field is manually resizable (vertical only); with it, resizing is handled by the content.',
}
