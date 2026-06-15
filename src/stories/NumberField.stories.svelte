<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import NumberField from '$lib/components/NumberField.svelte'

  const { Story } = defineMeta({
    title: 'Components/NumberField',
    component: NumberField,
    tags: ['autodocs'],
    render: template,
    parameters: {
      // Form fields are an a11y hotspot (labels, describedby, contrast) — fail hard.
      a11y: { test: 'error' },
    },
    argTypes: {
      label: {
        control: 'text',
        description: 'Label text rendered inside the .ss-numberfield wrapper.',
      },
      value: { control: 'number', description: 'Bindable current value; null when empty.' },
      min: {
        control: 'number',
        description: 'Lower bound; clamps the steppers and disables − at the floor.',
      },
      max: {
        control: 'number',
        description: 'Upper bound; clamps the steppers and disables + at the ceiling.',
      },
      step: { control: 'number', description: 'Increment/decrement applied by the steppers.' },
      size: {
        control: { type: 'inline-radio' },
        options: ['sm', 'md', 'lg'],
        description: 'Token size override; inherits the ancestor data-size-variant when unset.',
      },
      placeholder: { control: 'text', description: 'Placeholder shown when empty.' },
      disabled: { control: 'boolean', description: 'Renders the field non-interactive.' },
      readonly: {
        control: 'boolean',
        description: 'Value visible but not editable; steppers inert.',
      },
      required: {
        control: 'boolean',
        description: 'Marks the field required for form validation.',
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
        description: 'Error text; implies aria-invalid and is announced to AT.',
      },
    },
    args: {
      label: 'Replicas',
      value: 3,
      step: 1,
      placeholder: '',
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
  <NumberField
    label={args.label as string}
    value={args.value as number | null}
    min={args.min as number | undefined}
    max={args.max as number | undefined}
    step={args.step as number}
    size={args.size as 'sm' | 'md' | 'lg' | undefined}
    placeholder={args.placeholder as string}
    disabled={args.disabled as boolean}
    readonly={args.readonly as boolean}
    required={args.required as boolean}
    invalid={(args.invalid as boolean) || undefined}
    hint={(args.hint as string) || undefined}
    error={(args.error as string) || undefined}
  />
{/snippet}

<Story name="Default" args={{ label: 'Replicas', value: 3 }} />

<Story
  name="With min/max/step"
  args={{ label: 'Replicas', value: 4, min: 0, max: 10, step: 2, hint: 'Between 0 and 10.' }}
/>

<Story name="Error" args={{ label: 'Port', value: 99999, error: 'Must be 1024–65535.' }} />

<Story name="Disabled" args={{ label: 'Replicas', value: 3, disabled: true }} />

<Story name="Large" args={{ label: 'Replicas', value: 3, size: 'lg' }} />
