<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import ColorPicker from '$lib/components/ColorPicker.svelte'

  const { Story } = defineMeta({
    title: 'Components/ColorPicker',
    component: ColorPicker,
    tags: ['autodocs'],
    render: template,
    argTypes: {
      value: {
        control: 'text',
        description: 'Selected colour as a hex string (bindable).',
      },
      label: {
        control: 'text',
        description: 'Field label (associated with the hex input).',
      },
      presets: {
        control: 'object',
        description: 'Preset swatch colours to quick-pick from.',
      },
      disabled: {
        control: 'boolean',
        description: 'Disable all three controls.',
      },
      size: {
        control: { type: 'inline-radio' },
        options: ['sm', 'md', 'lg'],
        description: 'Token size override; inherits the ancestor data-size-variant when unset.',
      },
      onChange: {
        action: 'onChange',
        description: 'Fired whenever the value changes (swatch, native picker, or hex input).',
      },
    },
    args: {
      value: '#66ef73',
      label: 'Brand colour',
      disabled: false,
      onChange: () => {},
    },
  })
</script>

{#snippet template(args: Record<string, unknown>)}
  <ColorPicker
    value={args.value as string}
    label={args.label as string}
    presets={args.presets as string[] | undefined}
    disabled={args.disabled as boolean}
    size={args.size as 'sm' | 'md' | 'lg' | undefined}
    onChange={args.onChange as (value: string) => void}
  />
{/snippet}

<Story name="Default" args={{ value: '#66ef73', label: 'Brand colour' }} />

<Story
  name="With presets"
  args={{
    value: '#9aa4ff',
    label: 'Team colour',
    presets: ['#66ef73', '#9aa4ff', '#b98cff', '#66d9ef', '#e0c36a', '#a6e22e'],
  }}
/>

<Story name="Disabled" args={{ value: '#b98cff', label: 'Locked colour', disabled: true }} />

<Story name="Large" args={{ value: '#66d9ef', label: 'Brand colour', size: 'lg' }} />
