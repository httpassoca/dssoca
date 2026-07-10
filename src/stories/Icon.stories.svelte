<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Icon, { PATHS } from '$lib/components/Icon.svelte'
  import type { IconName, IconSize } from '$lib/components/Icon.svelte'

  const ALL_NAMES = Object.keys(PATHS) as IconName[]

  /** DS-0087: nav/social additions, shown in their own story. */
  const NAV_SOCIAL_NAMES: IconName[] = [
    'home',
    'briefcase',
    'folder',
    'github',
    'linkedin',
    'language',
    'color-swatch',
  ]

  const { Story } = defineMeta({
    title: 'Components/Icon',
    component: Icon,
    tags: ['autodocs'],
    render: template,
    argTypes: {
      name: {
        control: { type: 'select' },
        options: [
          'grid',
          'activity',
          'database',
          'logs',
          'terminal',
          'settings',
          'user',
          'arrow',
          'external',
          'film',
          'note',
          'book',
          'check',
          'chevron',
          'cup',
          'wallet',
          'target',
          'spinner',
          'home',
          'briefcase',
          'folder',
          'github',
          'linkedin',
          'language',
          'color-swatch',
        ] satisfies IconName[],
        description: 'Icon identifier — maps to an inline SVG path.',
      },
      size: {
        control: { type: 'inline-radio' },
        options: [undefined, 'xs', 'sm', 'md', 'lg'],
        description:
          'Icon-local fixed size scale — xs 12 / sm 16 / md 20 / lg 24 px. `undefined` inherits the active --ss-icon token.',
      },
      px: {
        control: { type: 'number', min: 8, max: 128, step: 4 },
        description: 'Explicit width/height in px — overrides the size scale.',
      },
      variant: {
        control: { type: 'inline-radio' },
        options: ['outline', 'solid'],
        description: 'Stroked (outline) or filled with currentColor (solid).',
      },
      spin: {
        control: { type: 'boolean' },
        description: 'Spin the glyph (e.g. a loader). Honours prefers-reduced-motion.',
      },
      rotate: {
        control: { type: 'inline-radio' },
        options: [0, 90, 180, 270],
        description: 'Quarter-turn rotation.',
      },
      flip: {
        control: { type: 'inline-radio' },
        options: [undefined, 'horizontal', 'vertical'],
        description: 'Mirror the glyph.',
      },
      strokeWidth: {
        control: { type: 'number', min: 0.5, max: 6, step: 0.5 },
        description: 'Stroke weight in viewBox units (default 2).',
      },
      absoluteStroke: {
        control: { type: 'boolean' },
        description:
          'Keep strokeWidth optically constant across sizes (recompute from resolved px).',
      },
      title: {
        control: { type: 'text' },
        description: 'Accessible name — rendered as <title> and wired via aria-labelledby.',
      },
      decorative: {
        control: { type: 'boolean' },
        description: 'Force aria-hidden with no a11y name. Defaults true when no title.',
      },
    },
    args: {
      name: 'grid',
      size: 'md',
      px: undefined,
      variant: 'outline',
      spin: false,
      rotate: 0,
      flip: undefined,
      strokeWidth: 2,
      absoluteStroke: false,
      title: undefined,
      decorative: undefined,
    },
  })
</script>

{#snippet template(args: Record<string, unknown>)}
  <Icon
    name={args.name as IconName}
    size={args.size as IconSize | undefined}
    px={args.px as number | undefined}
    variant={args.variant as 'outline' | 'solid'}
    spin={args.spin as boolean}
    rotate={args.rotate as 0 | 90 | 180 | 270}
    flip={args.flip as 'horizontal' | 'vertical' | undefined}
    strokeWidth={args.strokeWidth as number}
    absoluteStroke={args.absoluteStroke as boolean}
    title={args.title as string | undefined}
    decorative={args.decorative as boolean | undefined}
  />
{/snippet}

{#snippet gallery(args: Record<string, unknown>)}
  <div style="display:flex;flex-wrap:wrap;gap:1.5rem;align-items:flex-start;">
    {#each ALL_NAMES as iconName}
      <div style="display:flex;flex-direction:column;align-items:center;gap:0.375rem;width:5rem;">
        <Icon name={iconName} px={args.px as number} />
        <span style="font-size:0.625rem;opacity:0.6;text-align:center;">{iconName}</span>
      </div>
    {/each}
  </div>
{/snippet}

<Story name="Default" args={{ name: 'grid', px: 24 }} />

<Story name="Activity" args={{ name: 'activity', px: 24 }} />

<Story name="Settings" args={{ name: 'settings', px: 24 }} />

<Story name="Terminal" args={{ name: 'terminal', px: 24 }} />

<Story name="Large" args={{ name: 'target', px: 48 }} />

<Story name="Small" args={{ name: 'check', px: 12 }} />

{#snippet navSocial(args: Record<string, unknown>)}
  <div style="display:flex;flex-wrap:wrap;gap:1.5rem;align-items:flex-start;">
    {#each NAV_SOCIAL_NAMES as iconName}
      <div style="display:flex;flex-direction:column;align-items:center;gap:0.375rem;width:5rem;">
        <Icon name={iconName} px={args.px as number} />
        <span style="font-size:0.625rem;opacity:0.6;text-align:center;">{iconName}</span>
      </div>
    {/each}
  </div>
{/snippet}

<Story name="Nav & social glyphs" template={navSocial} args={{ px: 32 }} />

<Story name="Gallery" template={gallery} args={{ px: 32 }} />
