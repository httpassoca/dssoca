<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import DateField from '$lib/components/DateField.svelte'

  const { Story } = defineMeta({
    title: 'Components/DateField',
    component: DateField,
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
          'Label text. When set, renders a <label class="lbl"> inside the .ss-datefield wrapper.',
      },
      size: {
        control: { type: 'inline-radio' },
        options: ['sm', 'md', 'lg'],
        description: 'Token size override; inherits the ancestor data-size-variant when unset.',
      },
      value: {
        control: 'text',
        description: 'Bindable ISO date string (yyyy-mm-dd).',
      },
      min: {
        control: 'text',
        description: 'Earliest selectable date (ISO yyyy-mm-dd).',
      },
      max: {
        control: 'text',
        description: 'Latest selectable date (ISO yyyy-mm-dd).',
      },
      disabled: {
        control: 'boolean',
        description: 'Renders the field non-interactive.',
      },
      readonly: {
        control: 'boolean',
        description: 'Native readonly — value visible but not editable; rendered muted.',
      },
      required: {
        control: 'boolean',
        description: 'Marks the field as required for form validation.',
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
    },
    args: {
      label: '',
      value: '',
      min: '',
      max: '',
      disabled: false,
      readonly: false,
      required: false,
      invalid: false,
      hint: '',
      error: '',
    },
  })
</script>

{#snippet template(args: Record<string, unknown>)}
  <DateField
    label={args.label as string}
    size={args.size as 'sm' | 'md' | 'lg' | undefined}
    value={args.value as string}
    min={(args.min as string) || undefined}
    max={(args.max as string) || undefined}
    disabled={args.disabled as boolean}
    readonly={args.readonly as boolean}
    required={args.required as boolean}
    invalid={(args.invalid as boolean) || undefined}
    hint={(args.hint as string) || undefined}
    error={(args.error as string) || undefined}
  />
{/snippet}

<Story name="Default" args={{ label: 'Start date', value: '2026-06-15' }} />

<!-- Constrain the selectable range with min/max -->
<Story
  name="With min/max"
  args={{
    label: 'Booking date',
    value: '2026-06-15',
    min: '2026-06-01',
    max: '2026-06-30',
    hint: 'Within June 2026 only.',
  }}
/>

<!-- Error text: implies aria-invalid and is announced to AT -->
<Story name="Error" args={{ label: 'Start date', value: '', error: 'Please pick a date.' }} />

<Story name="Disabled" args={{ label: 'Locked date', value: '2026-06-15', disabled: true }} />

<Story name="Large" args={{ label: 'Start date', value: '2026-06-15', size: 'lg' }} />
