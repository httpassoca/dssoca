<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Select, { type SelectOption, type SelectOptGroup } from '$lib/components/Select.svelte'

  const countries: SelectOption[] = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'mx', label: 'Mexico' },
    { value: 'br', label: 'Brazil' },
  ]

  const regions: SelectOptGroup[] = [
    {
      label: 'North America',
      options: [
        { value: 'us', label: 'United States' },
        { value: 'ca', label: 'Canada' },
      ],
    },
    {
      label: 'Europe',
      options: [
        { value: 'de', label: 'Germany' },
        { value: 'fr', label: 'France' },
        { value: 'es', label: 'Spain' },
      ],
    },
  ]

  const { Story } = defineMeta({
    title: 'Components/Select',
    component: Select,
    tags: ['autodocs'],
    render: template,
    parameters: {
      // Form fields are an a11y hotspot (labels, describedby, contrast) — fail hard.
      a11y: { test: 'error' },
    },
    argTypes: {
      label: {
        control: 'text',
        description:
          'Label text. When set, renders a <label class="lbl"> inside the .ss-select wrapper.',
      },
      size: {
        control: { type: 'inline-radio' },
        options: ['sm', 'md', 'lg'],
        description: 'Token size override; inherits the ancestor data-size-variant when unset.',
      },
      placeholder: {
        control: 'text',
        description: 'Disabled, hidden first option, selected while the value is empty.',
      },
      value: {
        control: 'text',
        description: 'Bindable current value of the select.',
      },
      disabled: {
        control: 'boolean',
        description: 'Renders the select non-interactive.',
      },
      required: {
        control: 'boolean',
        description: 'Marks the select as required for form validation.',
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
      grouped: {
        control: 'boolean',
        description: 'Story-only: render grouped <optgroup> options instead of a flat list.',
      },
    },
    args: {
      label: '',
      placeholder: '',
      value: '',
      disabled: false,
      required: false,
      invalid: false,
      hint: '',
      error: '',
      grouped: false,
    },
  })
</script>

{#snippet template(args: Record<string, unknown>)}
  <Select
    label={args.label as string}
    size={args.size as 'sm' | 'md' | 'lg' | undefined}
    options={args.grouped ? regions : countries}
    placeholder={(args.placeholder as string) || undefined}
    value={args.value as string}
    disabled={args.disabled as boolean}
    required={args.required as boolean}
    invalid={(args.invalid as boolean) || undefined}
    hint={(args.hint as string) || undefined}
    error={(args.error as string) || undefined}
  />
{/snippet}

<Story name="Default" args={{ label: 'Country', value: 'us' }} />

<Story name="With groups" args={{ label: 'Region', value: 'de', grouped: true }} />

<Story name="Placeholder" args={{ label: 'Country', placeholder: 'Select a country…' }} />

<Story
  name="Error"
  args={{ label: 'Country', placeholder: 'Select a country…', error: 'Please choose a country.' }}
/>

<Story name="Disabled" args={{ label: 'Country', value: 'ca', disabled: true }} />

<Story name="Large" args={{ label: 'Country', value: 'us', size: 'lg' }} />
