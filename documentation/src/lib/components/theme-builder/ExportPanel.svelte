<script lang="ts">
  import { SegmentedControl } from 'dssoca'
  import CodeBlock from '$lib/components/CodeBlock.svelte'
  import { EXPORT_FORMATS } from '$lib/theme-builder/export'
  import type { Palette } from '$lib/theme-builder/types'

  interface Props {
    palette: Palette
    /** Metadata baked into the generated snippet's comment line. */
    accent: string
    /** 0..1 tint fraction. */
    tint: number
  }
  let { palette, accent, tint }: Props = $props()

  let formatId = $state(EXPORT_FORMATS[0].id)

  const format = $derived(EXPORT_FORMATS.find((f) => f.id === formatId) ?? EXPORT_FORMATS[0])
  const code = $derived(format.generate(palette, { accent, tint }))
  const options = EXPORT_FORMATS.map((f) => ({ value: f.id, label: f.label }))
</script>

<div class="export">
  <div class="head">
    <h3>export</h3>
    <SegmentedControl label="Export format" {options} bind:value={formatId} />
  </div>
  <CodeBlock {code} lang={format.lang} />
  <p class="footnote">
    terminal formats (Windows Terminal · Alacritty · Kitty · Xresources) are a planned follow-up.
  </p>
</div>

<style lang="scss">
  .export {
    display: flex;
    flex-direction: column;
    gap: var(--ss-s-3);
  }
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ss-gap);
    flex-wrap: wrap;
  }
  h3 {
    font-family: var(--ss-font-subhead);
    font-size: var(--ss-size-h3);
    color: var(--ss-fg-shine);
    text-transform: lowercase;
    margin: 0;
  }
  .footnote {
    margin: 0;
    font-family: var(--ss-font-body);
    font-size: var(--ss-ui-xs);
    color: var(--ss-fg-faint);
  }
</style>
