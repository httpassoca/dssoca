<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Icon, { PATHS } from '$lib/components/Icon.svelte'
  import type { IconName } from '$lib/components/Icon.svelte'

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
          'cup',
          'wallet',
          'target',
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
      px: {
        control: { type: 'number', min: 8, max: 128, step: 4 },
        description: 'Width and height of the SVG in px.',
      },
    },
    args: {
      name: 'grid',
      px: 24,
    },
  })
</script>

{#snippet template(args: Record<string, unknown>)}
  <Icon name={args.name as IconName} px={args.px as number} />
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
