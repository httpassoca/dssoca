<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf'
  import Kbd from '$lib/components/Kbd.svelte'

  const { Story } = defineMeta({
    title: 'Components/Kbd',
    component: Kbd,
    tags: ['autodocs'],
    render: template,
    parameters: {
      a11y: { test: 'error' },
    },
    argTypes: {
      keys: {
        control: 'text',
        description:
          "Combo in the shortcut grammar ('mod+k', '?, mod+/'). `mod` renders per platform.",
      },
      format: {
        control: { type: 'inline-radio' },
        options: ['glyph', 'label'],
        description: 'glyph = ⌘⇧↵ symbols on Apple (words elsewhere); label = always full words.',
      },
      platform: {
        control: { type: 'inline-radio' },
        options: ['apple', 'other'],
        description:
          'Override platform auto-detection (defaults to the visitor platform, corrected client-side).',
      },
      size: {
        control: { type: 'inline-radio' },
        options: ['sm', 'md', 'lg'],
        description: 'Token size override; inherits the ancestor data-size-variant when unset.',
      },
      text: {
        control: 'text',
        description: 'Story-only: raw children content (the escape hatch). Clear `keys` to see it.',
      },
    },
    args: {
      keys: 'mod+k',
      format: 'glyph',
    },
  })
</script>

{#snippet template(args: Record<string, unknown>)}
  {#if args.text}
    <Kbd
      format={args.format as 'glyph' | 'label'}
      platform={args.platform as 'apple' | 'other' | undefined}
      size={args.size as 'sm' | 'md' | 'lg' | undefined}
    >
      {args.text}
    </Kbd>
  {:else}
    <Kbd
      keys={args.keys as string}
      format={args.format as 'glyph' | 'label'}
      platform={args.platform as 'apple' | 'other' | undefined}
      size={args.size as 'sm' | 'md' | 'lg' | undefined}
    />
  {/if}
{/snippet}

<!-- Default glyph format on the auto-detected platform -->
<Story name="Glyph" args={{ keys: 'mod+k', format: 'glyph' }} />

<!-- Always-words rendering -->
<Story name="Label" args={{ keys: 'mod+shift+k', format: 'label' }} />

<!-- Pinned Apple rendering: ⌘⇧ glyphs, concatenated (no + separators) -->
<Story name="Apple" args={{ keys: 'mod+shift+k', format: 'glyph', platform: 'apple' }} />

<!-- Pinned non-Apple rendering: words joined with + -->
<Story name="Other" args={{ keys: 'mod+shift+k', format: 'glyph', platform: 'other' }} />

<!-- Comma alternatives render as sibling groups joined by a muted "or" -->
<Story name="Alternatives" args={{ keys: '?, mod+/', format: 'glyph', platform: 'other' }} />

<!-- Special keys have glyph + label spellings (↵ / Enter, Esc / Escape, arrows) -->
<Story name="SpecialKeys" args={{ keys: 'alt+enter', format: 'glyph', platform: 'apple' }} />

<!-- Raw-content escape hatch for keys the grammar can't express -->
<Story name="RawContent" args={{ keys: '', text: 'F12' }} />

<!-- Per-instance size override next to the inherited default -->
{#snippet sizesTemplate()}
  <div style="display: flex; align-items: center; gap: var(--ss-gap);">
    <Kbd keys="mod+k" platform="other" size="sm" />
    <Kbd keys="mod+k" platform="other" size="md" />
    <Kbd keys="mod+k" platform="other" size="lg" />
  </div>
{/snippet}
<Story name="Sizes" template={sizesTemplate} />

<!-- Both color themes side by side (the toolbar flips the whole canvas) -->
{#snippet themesTemplate()}
  <div style="display: flex; gap: var(--ss-gap);">
    <div data-theme="dark" style="background: var(--ss-bg); padding: var(--ss-s-4);">
      <Kbd keys="mod+shift+k" platform="apple" />
    </div>
    <div data-theme="light" style="background: var(--ss-bg); padding: var(--ss-s-4);">
      <Kbd keys="mod+shift+k" platform="apple" />
    </div>
  </div>
{/snippet}
<Story name="Themes" template={themesTemplate} />
