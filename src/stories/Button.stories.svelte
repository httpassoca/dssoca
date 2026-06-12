<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Button from '$lib/components/Button.svelte'
  import Icon from '$lib/components/Icon.svelte'

  const { Story } = defineMeta({
    title: 'Components/Button',
    component: Button,
    tags: ['autodocs'],
    // `render` points at the shared `template` snippet below so every story can
    // drive the button's text via the `label` arg (Button takes its label as a
    // child snippet, not a prop). `withLeading`/`withTrailing` are story-only
    // booleans that toggle the optional icon snippets.
    render: template,
    parameters: {
      // Buttons are a primary interactive surface — fail the a11y addon hard.
      a11y: { test: 'error' },
    },
    argTypes: {
      variant: {
        control: { type: 'inline-radio' },
        options: ['primary', 'secondary', 'ghost', 'danger'],
        description: 'Visual emphasis of the button.',
      },
      type: {
        control: { type: 'inline-radio' },
        options: ['button', 'submit', 'reset'],
        description: 'Native button type.',
      },
      size: {
        control: { type: 'inline-radio' },
        options: ['sm', 'md', 'lg'],
        description: 'Token size override; inherits the ancestor data-size-variant when unset.',
      },
      disabled: {
        control: 'boolean',
        description: 'Renders the button non-interactive.',
      },
      loading: {
        control: 'boolean',
        description: 'Shows a spinner, blocks clicks, sets aria-busy; stays focusable.',
      },
      loadingLabel: {
        control: 'text',
        description:
          'Accessible name while loading (keeps the name stable when the label is hidden).',
      },
      fullWidth: {
        control: 'boolean',
        description: 'Block-level: stretch to fill the inline axis and center the content.',
      },
      iconOnly: {
        control: 'boolean',
        description: 'Icon-only square button — `label` becomes the aria-label (required).',
      },
      label: {
        control: 'text',
        description:
          'Text content (rendered as the button child) and the accessible name for icon-only buttons.',
      },
      withLeading: {
        control: 'boolean',
        description: 'Story-only: render a demo leading icon via the `leading` snippet.',
      },
      withTrailing: {
        control: 'boolean',
        description: 'Story-only: render a demo trailing icon via the `trailing` snippet.',
      },
      onclick: {
        action: 'onclick',
        description: 'Click handler (blocked while loading/disabled).',
      },
    },
    args: {
      label: 'Button',
      variant: 'secondary',
      type: 'button',
      disabled: false,
      loading: false,
      loadingLabel: '',
      fullWidth: false,
      iconOnly: false,
      withLeading: false,
      withTrailing: false,
      onclick: () => {},
    },
  })
</script>

{#snippet leadingIcon()}
  <Icon name="check" />
{/snippet}

{#snippet trailingIcon()}
  <Icon name="arrow" />
{/snippet}

{#snippet template(args: Record<string, unknown>)}
  <Button
    variant={args.variant as 'primary' | 'secondary' | 'ghost' | 'danger'}
    type={args.type as 'button' | 'submit' | 'reset'}
    size={args.size as 'sm' | 'md' | 'lg' | undefined}
    disabled={args.disabled as boolean}
    loading={args.loading as boolean}
    loadingLabel={(args.loadingLabel as string) || undefined}
    fullWidth={args.fullWidth as boolean}
    iconOnly={args.iconOnly as boolean}
    label={args.label as string}
    leading={args.withLeading ? leadingIcon : undefined}
    trailing={args.withTrailing ? trailingIcon : undefined}
    onclick={args.onclick as (e: MouseEvent) => void}
  >
    {#if !args.iconOnly}
      {args.label}
    {:else}
      <Icon name="settings" />
    {/if}
  </Button>
{/snippet}

<Story name="Primary" args={{ variant: 'primary', label: 'Deploy' }} />

<Story name="Secondary" args={{ variant: 'secondary', label: 'Cancel' }} />

<Story name="Ghost" args={{ variant: 'ghost', label: 'Dismiss' }} />

<Story name="Disabled" args={{ variant: 'primary', label: 'Deploy', disabled: true }} />

<!-- Loading: spinner + aria-busy; the accessible name stays "Deploying…" -->
<Story
  name="Loading"
  args={{ variant: 'primary', label: 'Deploy', loading: true, loadingLabel: 'Deploying…' }}
/>

<!-- Explicit token size override, independent of the global size axis -->
<Story name="Small" args={{ variant: 'secondary', label: 'Small', size: 'sm' }} />

<Story name="FullWidth" args={{ variant: 'primary', label: 'Continue', fullWidth: true }} />

<!-- Icon-only square button: `label` becomes the aria-label -->
<Story name="IconOnly" args={{ variant: 'ghost', label: 'Settings', iconOnly: true }} />

<!-- Leading + trailing icon snippets toggled via the story-only booleans -->
<Story
  name="WithIcons"
  args={{ variant: 'secondary', label: 'Next step', withLeading: true, withTrailing: true }}
/>
