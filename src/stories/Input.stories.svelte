<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Input from '$lib/components/Input.svelte'
  import Icon from '$lib/components/Icon.svelte'

  const { Story } = defineMeta({
    title: 'Components/Input',
    component: Input,
    tags: ['autodocs'],
    // `render` points at the shared `template` snippet below. `value` is a
    // $bindable prop; passed one-way here it still types freely (the binding
    // falls back to the child) and each story seeds a different initial value.
    // `withPrefix`/`withSuffix` are story-only booleans toggling the decorative
    // prefix/suffix snippets.
    render: template,
    parameters: {
      // Form fields are an a11y hotspot (labels, describedby, contrast) — fail hard.
      a11y: { test: 'error' },
    },
    argTypes: {
      label: {
        control: 'text',
        description:
          'Label text. When set, renders a <label class="lbl"> inside the .ss-field wrapper.',
      },
      type: {
        control: { type: 'inline-radio' },
        options: ['text', 'email', 'password', 'number', 'search', 'url'],
        description: 'Native input type.',
      },
      size: {
        control: { type: 'inline-radio' },
        options: ['sm', 'md', 'lg'],
        description: 'Token size override; inherits the ancestor data-size-variant when unset.',
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
      readonly: {
        control: 'boolean',
        description: 'Native readonly — value visible but not editable; rendered muted.',
      },
      required: {
        control: 'boolean',
        description: 'Marks the input as required for form validation.',
      },
      invalid: {
        control: 'boolean',
        description: 'Marks the field invalid for assistive tech (aria-invalid).',
      },
      hint: {
        control: 'text',
        description: 'Helper text under the field, wired via aria-describedby.',
      },
      error: {
        control: 'text',
        description: 'Error text under the field; implies aria-invalid and is announced to AT.',
      },
      clearable: {
        control: 'boolean',
        description: 'Renders a clear button; hidden when empty/readonly/disabled.',
      },
      withPrefix: {
        control: 'boolean',
        description: 'Story-only: render a demo leading glyph via the `prefix` snippet.',
      },
      withSuffix: {
        control: 'boolean',
        description: 'Story-only: render a demo trailing unit via the `suffix` snippet.',
      },
    },
    args: {
      label: '',
      type: 'text',
      placeholder: '',
      value: '',
      disabled: false,
      readonly: false,
      required: false,
      invalid: false,
      hint: '',
      error: '',
      clearable: false,
      withPrefix: false,
      withSuffix: false,
      oninput: () => {},
    },
  })
</script>

{#snippet prefixGlyph()}
  <Icon name="user" />
{/snippet}

{#snippet suffixUnit()}
  <span style="opacity:.6;font-size:12px">ms</span>
{/snippet}

{#snippet template(args: Record<string, unknown>)}
  <Input
    label={args.label as string}
    type={args.type as string}
    size={args.size as 'sm' | 'md' | 'lg' | undefined}
    placeholder={args.placeholder as string}
    value={args.value as string}
    disabled={args.disabled as boolean}
    readonly={args.readonly as boolean}
    required={args.required as boolean}
    invalid={(args.invalid as boolean) || undefined}
    hint={(args.hint as string) || undefined}
    error={(args.error as string) || undefined}
    clearable={args.clearable as boolean}
    prefix={args.withPrefix ? prefixGlyph : undefined}
    suffix={args.withSuffix ? suffixUnit : undefined}
    oninput={args.oninput as (e: Event & { currentTarget: HTMLInputElement }) => void}
  />
{/snippet}

<Story name="Bare" args={{ placeholder: 'Type something…' }} />

<Story name="With Label" args={{ label: 'Email', type: 'email', placeholder: 'admin@hub.home' }} />

<Story name="Prefilled" args={{ label: 'Username', value: 'admin' }} />

<Story name="Password" args={{ label: 'Password', type: 'password', placeholder: '••••••••' }} />

<Story name="Disabled" args={{ label: 'API key', value: 'sk-••••••••••••', disabled: true }} />

<Story name="Readonly" args={{ label: 'Instance id', value: 'i-0f9d2', readonly: true }} />

<Story
  name="Required"
  args={{ label: 'Required field', placeholder: 'Cannot be blank', required: true }}
/>

<!-- Helper text under the field (aria-describedby) -->
<Story
  name="With Hint"
  args={{ label: 'Hostname', placeholder: 'hub.home', hint: 'Resolvable on the LAN only.' }}
/>

<!-- Error text: implies aria-invalid and is announced to AT -->
<Story
  name="Error"
  args={{ label: 'Email', value: 'not-an-email', error: 'Enter a valid email address.' }}
/>

<!-- aria-invalid without visible error copy -->
<Story name="Invalid" args={{ label: 'Port', value: '99999', invalid: true }} />

<!-- Clear button appears once there is a value -->
<Story
  name="Clearable"
  args={{ label: 'Search', type: 'search', value: 'sidecar', clearable: true }}
/>

<!-- Decorative prefix/suffix snippets inside the field -->
<Story
  name="PrefixSuffix"
  args={{ label: 'p95 latency', value: '48', withPrefix: true, withSuffix: true }}
/>
