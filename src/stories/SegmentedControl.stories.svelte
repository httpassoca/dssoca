<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import SegmentedControl, { type SegmentOption } from '$lib/components/SegmentedControl.svelte'

  const VIEW: SegmentOption[] = [
    { value: 'list', label: 'List', icon: 'logs' },
    { value: 'grid', label: 'Grid', icon: 'grid' },
    { value: 'map', label: 'Map' },
  ]

  const LOCALE: SegmentOption[] = [
    { value: 'en', label: 'EN' },
    { value: 'pt', label: 'PT' },
  ]

  const { Story } = defineMeta({
    title: 'Components/SegmentedControl',
    component: SegmentedControl,
    tags: ['autodocs'],
    // `render` points at the shared `template` snippet below so every prop —
    // including the in-flight component-wide `disabled` — is wired explicitly.
    render: template,
    parameters: {
      // Radiogroup semantics + roving tabindex — keep the a11y addon strict.
      a11y: { test: 'error' },
    },
    argTypes: {
      options: {
        control: 'object',
        description: 'Mutually-exclusive options: { value, label, icon?, disabled? }.',
      },
      value: {
        control: 'text',
        description: 'Selected option value (bindable).',
      },
      label: {
        control: 'text',
        description: 'Accessible name for the radiogroup (required, WCAG 2.2 AA).',
      },
      fullWidth: {
        control: 'boolean',
        description: 'Stretch segments to equal widths and fill the container.',
      },
      size: {
        control: { type: 'inline-radio' },
        options: ['sm', 'md', 'lg'],
        description: 'Token size override; inherits the ancestor data-size-variant when unset.',
      },
      disabled: {
        control: 'boolean',
        description: 'Disable the whole control (component-wide).',
      },
      onChange: {
        action: 'onChange',
        description: 'Fired when the selection changes (after `value` updates).',
      },
    },
    args: {
      options: VIEW,
      value: 'grid',
      label: 'View mode',
      fullWidth: false,
      disabled: false,
      onChange: () => {},
    },
  })
</script>

{#snippet template(args: Record<string, unknown>)}
  <SegmentedControl
    options={args.options as SegmentOption[]}
    value={args.value as string}
    label={args.label as string}
    fullWidth={args.fullWidth as boolean}
    size={args.size as 'sm' | 'md' | 'lg' | undefined}
    disabled={args.disabled as boolean}
    onChange={args.onChange as (value: string) => void}
  />
{/snippet}

<Story name="Default" args={{ options: VIEW, value: 'grid', label: 'View mode' }} />

<Story name="Locale (compact)" args={{ options: LOCALE, value: 'en', label: 'Language' }} />

<Story
  name="Full width"
  args={{ options: VIEW, value: 'list', label: 'View mode', fullWidth: true }}
/>

<Story
  name="With a disabled option"
  args={{
    options: [
      { value: 'day', label: 'Day' },
      { value: 'week', label: 'Week' },
      { value: 'month', label: 'Month', disabled: true },
    ],
    value: 'day',
    label: 'Range',
  }}
/>

<!-- Component-wide disabled: every segment is inert -->
<Story
  name="Disabled"
  args={{ options: VIEW, value: 'grid', label: 'View mode', disabled: true }}
/>

<!-- Explicit token size override, independent of the global size axis -->
<Story name="Small" args={{ options: VIEW, value: 'grid', label: 'View mode', size: 'sm' }} />
