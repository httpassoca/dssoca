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
      hideOnMobile: {
        control: 'boolean',
        description:
          'Hide the chip on keyboard-less devices — `(hover: none) and (pointer: coarse)`, i.e. phones/tablets (DS-0157). Default true; false where the chip is the content.',
      },
      text: {
        control: 'text',
        description: 'Story-only: raw children content (the escape hatch). Clear `keys` to see it.',
      },
    },
    args: {
      keys: 'mod+k',
      format: 'glyph',
      hideOnMobile: true,
    },
  })
</script>

{#snippet template(args: Record<string, unknown>)}
  {#if args.text}
    <Kbd
      format={args.format as 'glyph' | 'label'}
      platform={args.platform as 'apple' | 'other' | undefined}
      size={args.size as 'sm' | 'md' | 'lg' | undefined}
      hideOnMobile={args.hideOnMobile as boolean}
    >
      {args.text}
    </Kbd>
  {:else}
    <Kbd
      keys={args.keys as string}
      format={args.format as 'glyph' | 'label'}
      platform={args.platform as 'apple' | 'other' | undefined}
      size={args.size as 'sm' | 'md' | 'lg' | undefined}
      hideOnMobile={args.hideOnMobile as boolean}
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

<!-- DS-0157: by default the chip hides on devices without a keyboard — a capability query
     (hover: none + pointer: coarse), not a width, so resizing this canvas won't trigger it.
     Emulate a phone in DevTools (device toolbar) to see the left chip vanish while the
     opted-out one (the content of a shortcuts list, a keyboard guide) stays. -->
{#snippet mobileTemplate()}
  <dl
    style="display: grid; grid-template-columns: auto auto; gap: var(--ss-gap); align-items: center; margin: 0;"
  >
    <dt style="color: var(--ss-fg-muted);">default — a hint next to an action</dt>
    <dd style="margin: 0;">Search <Kbd keys="mod+k" platform="other" /></dd>
    <dt style="color: var(--ss-fg-muted);">hideOnMobile=false — the chip is the content</dt>
    <dd style="margin: 0;"><Kbd keys="mod+k" platform="other" hideOnMobile={false} /></dd>
  </dl>
{/snippet}
<Story name="HiddenOnMobile" template={mobileTemplate} />

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
