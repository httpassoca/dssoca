<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import RadioGroup, { type RadioOption } from '$lib/components/RadioGroup.svelte'

  const OPTIONS: RadioOption[] = [
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro' },
    { value: 'team', label: 'Team' },
  ]

  const { Story } = defineMeta({
    title: 'Components/RadioGroup',
    component: RadioGroup,
    tags: ['autodocs'],
    render: template,
    parameters: {
      // Native radios in a named radiogroup — keep the a11y addon strict.
      a11y: { test: 'error' },
    },
    argTypes: {
      value: { control: 'text', description: 'Selected option value (bindable).' },
      label: { control: 'text', description: 'Visible group label; names the radiogroup.' },
      orientation: {
        control: { type: 'inline-radio' },
        options: ['vertical', 'horizontal'],
        description: 'Stack the options or lay them out in a row.',
      },
      disabled: { control: 'boolean', description: 'Disable the whole group.' },
      size: {
        control: { type: 'inline-radio' },
        options: ['sm', 'md', 'lg'],
        description: 'Token size override; inherits the ancestor data-size-variant when unset.',
      },
      onChange: {
        action: 'onChange',
        description: 'Fired when the selection changes, with the new value.',
      },
    },
    args: {
      options: OPTIONS,
      value: 'pro',
      label: 'Plan',
      orientation: 'vertical',
      disabled: false,
      onChange: () => {},
    },
  })
</script>

{#snippet template(args: Record<string, unknown>)}
  <RadioGroup
    options={args.options as RadioOption[]}
    value={args.value as string | undefined}
    label={args.label as string}
    orientation={args.orientation as 'vertical' | 'horizontal'}
    disabled={args.disabled as boolean}
    size={args.size as 'sm' | 'md' | 'lg' | undefined}
    onChange={args.onChange as (value: string) => void}
  />
{/snippet}

<Story name="Default" />

<Story name="Nothing selected" args={{ value: undefined }} />

<Story name="Horizontal" args={{ orientation: 'horizontal' }} />

<Story
  name="Disabled option"
  args={{
    options: [
      { value: 'free', label: 'Free' },
      { value: 'pro', label: 'Pro', disabled: true },
      { value: 'team', label: 'Team' },
    ],
    value: 'free',
  }}
/>

<Story name="Disabled" args={{ disabled: true }} />

<Story name="Large" args={{ size: 'lg' }} />
