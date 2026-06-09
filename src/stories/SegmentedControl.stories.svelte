<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import SegmentedControl, {
    type SegmentOption,
  } from '$lib/components/SegmentedControl.svelte';

  const VIEW: SegmentOption[] = [
    { value: 'list', label: 'List', icon: 'logs' },
    { value: 'grid', label: 'Grid', icon: 'grid' },
    { value: 'map', label: 'Map' },
  ];

  const LOCALE: SegmentOption[] = [
    { value: 'en', label: 'EN' },
    { value: 'pt', label: 'PT' },
  ];

  const { Story } = defineMeta({
    title: 'Components/SegmentedControl',
    component: SegmentedControl,
    tags: ['autodocs'],
    argTypes: {
      fullWidth: { control: 'boolean' },
      size: { control: { type: 'inline-radio' }, options: ['sm', 'md', 'lg'] },
    },
    args: {
      options: VIEW,
      value: 'grid',
      label: 'View mode',
    },
  });
</script>

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
