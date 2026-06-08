<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Input from '$lib/components/Input.svelte';

  const { Story } = defineMeta({
    title: 'Components/Input',
    component: Input,
    tags: ['autodocs'],
    // `render` points at the shared `template` snippet below. `value` is a
    // $bindable prop; passed one-way here it still types freely (the binding
    // falls back to the child) and each story seeds a different initial value.
    render: template,
    argTypes: {
      label: {
        control: 'text',
        description: 'Label text. When set, wraps the input in a <label class="ss-field">.',
      },
      type: {
        control: { type: 'inline-radio' },
        options: ['text', 'email', 'password', 'number', 'search', 'url'],
        description: 'Native input type.',
      },
      placeholder: {
        control: 'text',
        description: 'Placeholder text shown when value is empty.',
      },
      value: {
        control: 'text',
        description: 'Bindable current value of the input.',
      },
      disabled: {
        control: 'boolean',
        description: 'Renders the input non-interactive.',
      },
      required: {
        control: 'boolean',
        description: 'Marks the input as required for form validation.',
      },
    },
    args: {
      label: '',
      type: 'text',
      placeholder: '',
      value: '',
      disabled: false,
      required: false,
      oninput: () => {},
    },
  });
</script>

{#snippet template(args: Record<string, unknown>)}
  <Input
    label={args.label as string}
    type={args.type as string}
    placeholder={args.placeholder as string}
    value={args.value as string}
    disabled={args.disabled as boolean}
    required={args.required as boolean}
    oninput={args.oninput as (e: Event & { currentTarget: HTMLInputElement }) => void}
  />
{/snippet}

<Story name="Bare" args={{ placeholder: 'Type something…' }} />

<Story name="With Label" args={{ label: 'Email', type: 'email', placeholder: 'rafael@hub.home' }} />

<Story name="Prefilled" args={{ label: 'Username', value: 'rafael' }} />

<Story name="Password" args={{ label: 'Password', type: 'password', placeholder: '••••••••' }} />

<Story name="Disabled" args={{ label: 'API key', value: 'sk-••••••••••••', disabled: true }} />

<Story name="Required" args={{ label: 'Required field', placeholder: 'Cannot be blank', required: true }} />
