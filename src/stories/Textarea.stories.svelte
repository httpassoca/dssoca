<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Textarea from '$lib/components/Textarea.svelte';

  const { Story } = defineMeta({
    title: 'Components/Textarea',
    component: Textarea,
    tags: ['autodocs'],
    // `render` points at the shared `template` snippet below. `value` is a
    // $bindable prop; passed one-way here it still types freely (the binding
    // falls back to the child) and each story seeds a different initial value.
    render: template,
    argTypes: {
      label: {
        control: 'text',
        description: 'Label text. When set, renders a <label class="lbl"> inside the .ss-textarea root.',
      },
      placeholder: {
        control: 'text',
        description: 'Placeholder text shown when value is empty.',
      },
      value: {
        control: 'text',
        description: 'Bindable current value of the textarea.',
      },
      rows: {
        control: { type: 'number', min: 1, max: 20, step: 1 },
        description: 'Visible rows; the minimum height (also while autosizing).',
      },
      autosize: {
        control: 'boolean',
        description: 'Grow with content (field-sizing: content, JS fallback); capped by maxRows.',
      },
      maxRows: {
        control: { type: 'number', min: 1, max: 40, step: 1 },
        description: 'Row cap while autosizing — the field scrolls beyond it.',
      },
      hint: {
        control: 'text',
        description: 'Helper text under the field, wired via aria-describedby.',
      },
      error: {
        control: 'text',
        description: 'Error text under the field; implies aria-invalid and is announced to AT.',
      },
      disabled: {
        control: 'boolean',
        description: 'Renders the textarea non-interactive.',
      },
      readonly: {
        control: 'boolean',
        description: 'Value visible but not editable; rendered muted.',
      },
      required: {
        control: 'boolean',
        description: 'Marks the field as required for form validation (adds a marker).',
      },
    },
    args: {
      label: '',
      placeholder: '',
      value: '',
      rows: 3,
      autosize: false,
      maxRows: 10,
      hint: '',
      error: '',
      disabled: false,
      readonly: false,
      required: false,
    },
  });
</script>

{#snippet template(args: Record<string, unknown>)}
  <Textarea
    label={args.label as string}
    placeholder={args.placeholder as string}
    value={args.value as string}
    rows={args.rows as number}
    autosize={args.autosize as boolean}
    maxRows={args.maxRows as number}
    hint={(args.hint as string) || undefined}
    error={(args.error as string) || undefined}
    disabled={args.disabled as boolean}
    readonly={args.readonly as boolean}
    required={args.required as boolean}
  />
{/snippet}

<Story name="Bare" args={{ placeholder: 'Type something…' }} />

<Story name="With Label" args={{ label: 'Message', placeholder: 'Say something nice…' }} />

<Story
  name="With Hint"
  args={{ label: 'Message', placeholder: 'Markdown is fine.', hint: 'Shift+Enter for a new line.' }}
/>

<Story
  name="Error"
  args={{ label: 'Message', value: '', error: 'A message is required.', required: true }}
/>

<Story
  name="Autosize"
  args={{
    label: 'Notes',
    autosize: true,
    maxRows: 8,
    value: 'Starts at three rows\nand grows with content\nup to maxRows…',
  }}
/>

<Story
  name="Disabled"
  args={{ label: 'Message', value: 'Submissions are closed.', disabled: true }}
/>

<Story
  name="Readonly"
  args={{ label: 'Generated summary', value: 'Read-only content, selectable but not editable.', readonly: true }}
/>

<Story name="Required" args={{ label: 'Feedback', placeholder: 'Cannot be blank', required: true }} />
