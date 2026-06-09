import { type ComponentDoc, SIZE_PROP } from './types';

export const input: ComponentDoc = {
    name: 'Input',
    slug: 'input',
    tagline: 'Labelled text input with validation affordances.',
    description:
      'A text input with an optional label and auto-wired id. Supports `hint` and `error` helper text (error implies aria-invalid and is announced), prefix/suffix snippets inside the field, a `clearable` button, readonly/disabled styling, and native attribute forwarding (`autocomplete`, `inputmode`, `maxlength`, …).',
    storyId: 'components-input--with-label',
    usage: `<script>
  import { Input } from 'dssoca';
  let email = $state('');
</script>

<Input
  label="email"
  type="email"
  bind:value={email}
  placeholder="admin@hub.home"
  hint="we never share it"
  clearable
/>`,
    props: [
      { name: 'label', type: 'string', desc: 'Visible label (associated via generated id).' },
      { name: 'value', type: 'string', default: "''", desc: 'Bindable value.' },
      { name: 'type', type: 'string', default: "'text'", desc: 'Native input type.' },
      { name: 'placeholder', type: 'string', desc: 'Placeholder text.' },
      { name: 'required', type: 'boolean', default: 'false', desc: 'Marks the field required (adds a marker).' },
      { name: 'disabled', type: 'boolean', default: 'false', desc: 'Disable the field.' },
      { name: 'readonly', type: 'boolean', default: 'false', desc: 'Native readonly — value visible but not editable; rendered muted.' },
      { name: 'invalid', type: 'boolean', desc: 'Apply invalid styling + aria-invalid (also implied by `error`).' },
      { name: 'hint', type: 'string', desc: 'Helper text rendered under the input and wired via aria-describedby.' },
      { name: 'error', type: 'string', desc: 'Error text under the input; implies aria-invalid and is announced to AT.' },
      { name: 'describedby', type: 'string', desc: 'id(s) of additional describing element(s) (aria-describedby).' },
      { name: 'prefix', type: 'Snippet', desc: 'Decorative leading content inside the field, before the input.' },
      { name: 'suffix', type: 'Snippet', desc: 'Decorative trailing content inside the field, after the input.' },
      { name: 'clearable', type: 'boolean', default: 'false', desc: 'Renders a clear button; hidden when empty/readonly/disabled.' },
      { name: 'autocomplete', type: 'FullAutoFill', desc: 'Native autocomplete hint.' },
      { name: 'inputmode', type: "HTMLInputAttributes['inputmode']", desc: 'Native inputmode hint for on-screen keyboards.' },
      { name: 'maxlength', type: 'number', desc: 'Native maxlength.' },
      { name: 'oninput', type: '(e) => void', desc: 'Input handler.' },
      SIZE_PROP,
      { name: '...rest', type: 'HTMLInputAttributes', desc: 'Any remaining native input attributes / handlers are forwarded.' },
    ],
  };
