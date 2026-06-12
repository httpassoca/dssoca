<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Spinner, { SPINNER_VARIANT_NAMES } from '$lib/components/Spinner.svelte'
  import type { SpinnerVariant } from '$lib/components/Spinner.svelte'

  const { Story } = defineMeta({
    title: 'Components/Spinner',
    component: Spinner,
    tags: ['autodocs'],
    render: template,
    argTypes: {
      variant: {
        control: { type: 'select' },
        options: SPINNER_VARIANT_NAMES,
        description:
          'Frame set to animate — curated squared/blocky glyph sequences from cli-spinners (MIT).',
      },
      size: {
        control: { type: 'inline-radio' },
        options: ['sm', 'md', 'lg'],
        description: 'Token size override; inherits the ancestor data-size-variant when unset.',
      },
      label: {
        control: 'text',
        description: 'Accessible name announced via role="status".',
      },
      showLabel: {
        control: 'boolean',
        description: 'Render the label visibly next to the glyph (announced either way).',
      },
      speed: {
        control: { type: 'number', min: 20, max: 1000, step: 10 },
        description: "Override the variant's frame interval (ms).",
      },
    },
    args: {
      variant: 'boxBounce2',
      label: 'Loading',
      showLabel: false,
    },
  })
</script>

{#snippet template(args: Record<string, unknown>)}
  <Spinner
    variant={args.variant as SpinnerVariant}
    size={args.size as 'sm' | 'md' | 'lg' | undefined}
    label={args.label as string}
    showLabel={args.showLabel as boolean}
    speed={args.speed as number | undefined}
  />
{/snippet}

{#snippet gallery()}
  <div
    style="display:grid;grid-template-columns:repeat(auto-fill,minmax(11rem,1fr));gap:1.25rem;align-items:center;"
  >
    {#each SPINNER_VARIANT_NAMES as variant}
      <div style="display:flex;align-items:center;gap:0.75rem;">
        <Spinner {variant} label={`Loading (${variant})`} />
        <code style="font-size:0.75rem;opacity:0.7;">{variant}</code>
      </div>
    {/each}
  </div>
{/snippet}

{#snippet sizes()}
  <div style="display:flex;align-items:center;gap:2rem;">
    {#each ['sm', 'md', 'lg'] as const as size}
      <div style="display:flex;align-items:center;gap:0.75rem;">
        <Spinner {size} label={`Loading (${size})`} />
        <code style="font-size:0.75rem;opacity:0.7;">{size}</code>
      </div>
    {/each}
  </div>
{/snippet}

<Story name="Default" />

<Story name="Visible Label" args={{ label: 'Fetching services…', showLabel: true }} />

<Story name="Square Corners" args={{ variant: 'squareCorners' }} />

<Story name="Pipe" args={{ variant: 'pipe' }} />

<Story name="Slowed Down" args={{ variant: 'toggle4', speed: 400, showLabel: true }} />

<Story name="Sizes" template={sizes} />

<Story name="All Variants" template={gallery} />
