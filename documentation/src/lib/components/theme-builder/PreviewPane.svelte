<script lang="ts">
  import { Badge, Button, Card, Heading, Input } from 'dssoca'
  import { SLOTS, SLOT_TO_CSS_VAR, type Palette } from '$lib/theme-builder/types'

  // THE key mechanism: this pane carries its own `data-theme` plus the 19 root
  // slot custom properties inline. Every dssoca semantic token (--ss-primary,
  // --ss-danger, badge washes, …) is a var()/color-mix() derivation of those
  // slots *inside the [data-theme] blocks*, so the whole subtree re-resolves
  // against the built palette — while the rest of the docs site is untouched.
  interface Props {
    palette: Palette
    previewTheme: 'dark' | 'light'
  }
  let { palette, previewTheme }: Props = $props()

  const inlineVars = $derived(
    SLOTS.map((slot) => `${SLOT_TO_CSS_VAR[slot]}: ${palette[previewTheme][slot]}`).join('; '),
  )

  const tones = ['brand', 'neutral', 'positive', 'caution', 'critical', 'info'] as const
  const logLines = [
    { color: 'var(--ss-bright-black)', text: '12:04:01 [dbg] palette derived in 0.4ms' },
    { color: 'var(--ss-blue)', text: '12:04:02 [inf] service homelab-api up' },
    { color: 'var(--ss-yellow)', text: '12:04:07 [wrn] disk pool at 81%' },
    { color: 'var(--ss-red)', text: '12:04:09 [err] backup job failed (exit 2)' },
    { color: 'var(--ss-green)', text: '12:04:11 [ok ] retry succeeded' },
    { color: 'var(--ss-magenta)', text: '12:04:12 [trc] 6 hue slots leaned toward seed' },
  ]
</script>

<div class="tb-preview" data-theme={previewTheme} style={inlineVars}>
  <Card title="preview" meta={previewTheme}>
    <div class="vignette">
      <Heading level={3}>real components</Heading>
      <div class="buttons">
        <Button variant="primary">deploy</Button>
        <Button variant="ghost">logs</Button>
        <Button variant="danger">destroy</Button>
      </div>
      <Input label="hostname" placeholder="node-01.lan" hint="rendered by the built palette" />
      <div class="badges">
        {#each tones as tone (tone)}
          <Badge {tone} dot label={tone}>{tone}</Badge>
        {/each}
      </div>
      <div class="log" role="img" aria-label="Sample log lines in the six hue slots">
        {#each logLines as line (line.text)}
          <span style="color: {line.color}">{line.text}</span>
        {/each}
      </div>
    </div>
  </Card>
</div>

<style lang="scss">
  .tb-preview {
    // Paint the pane's own surface from the built palette so the vignette
    // floats on ITS bg, not the docs page's.
    background: var(--ss-bg);
    color: var(--ss-fg);
    border: 1px solid var(--ss-line);
    padding: var(--ss-s-4);
  }
  .vignette {
    display: flex;
    flex-direction: column;
    gap: var(--ss-gap);
  }
  .buttons {
    display: flex;
    gap: var(--ss-s-2);
    flex-wrap: wrap;
  }
  .badges {
    display: flex;
    gap: var(--ss-s-2);
    flex-wrap: wrap;
  }
  .log {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: var(--ss-s-2) var(--ss-s-3);
    border: 1px solid var(--ss-line);
    background: var(--ss-bg-inset, var(--ss-bg));
    font-family: var(--ss-font-mono);
    font-size: var(--ss-ui-xs);
    overflow-x: auto;
    white-space: nowrap;
  }
</style>
