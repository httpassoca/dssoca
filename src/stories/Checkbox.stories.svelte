<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Checkbox from '$lib/components/Checkbox.svelte'

  const { Story } = defineMeta({
    title: 'Components/Checkbox',
    component: Checkbox,
    tags: ['autodocs'],
    render: template,
    parameters: {
      // Native checkbox + accessible name — keep the a11y addon strict.
      a11y: { test: 'error' },
    },
    argTypes: {
      checked: { control: 'boolean', description: 'Checked state (bindable).' },
      indeterminate: {
        control: 'boolean',
        description: 'Mixed state (bindable); a toggle lands on checked.',
      },
      label: { control: 'text', description: 'Visible label; becomes the accessible name.' },
      labelHidden: { control: 'boolean', description: 'Visually hide the label.' },
      disabled: { control: 'boolean', description: 'Disable the checkbox.' },
      size: {
        control: { type: 'inline-radio' },
        options: ['sm', 'md', 'lg'],
        description: 'Token size override; inherits the ancestor data-size-variant when unset.',
      },
      onchange: {
        action: 'onchange',
        description: 'Fired after `checked` changes, with the new value.',
      },
    },
    args: {
      checked: false,
      indeterminate: false,
      label: 'Email me updates',
      labelHidden: false,
      disabled: false,
      onchange: () => {},
    },
  })
</script>

{#snippet template(args: Record<string, unknown>)}
  <Checkbox
    checked={args.checked as boolean}
    indeterminate={args.indeterminate as boolean}
    label={args.label as string}
    labelHidden={args.labelHidden as boolean}
    disabled={args.disabled as boolean}
    size={args.size as 'sm' | 'md' | 'lg' | undefined}
    onchange={args.onchange as (checked: boolean) => void}
  />
{/snippet}

<Story name="Default" />

<Story name="Checked" args={{ checked: true }} />

<Story name="Indeterminate" args={{ indeterminate: true, label: 'Select all' }} />

<Story name="Disabled" args={{ checked: true, disabled: true }} />

<Story name="Label hidden" args={{ label: 'Select row 3', labelHidden: true }} />

<Story name="Large" args={{ checked: true, size: 'lg' }} />
