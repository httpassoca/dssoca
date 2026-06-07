<script lang="ts">
  import { Icon } from 'dssoca';
  import { storyUrl, storybookLink, STORYBOOK_URL } from '$lib/docs.config';

  interface Props {
    storyId: string;
    title: string;
    /** iframe height in px. */
    height?: number;
  }
  let { storyId, title, height = 320 }: Props = $props();
</script>

<div class="embed">
  <div class="bar">
    <span class="label">live · storybook</span>
    <a class="open" href={storybookLink(storyId)} target="_blank" rel="noopener noreferrer">
      Open in Storybook <Icon name="external" px={12} />
    </a>
  </div>
  <iframe
    src={storyUrl(storyId)}
    title={`${title} — live Storybook demo`}
    loading="lazy"
    style="height: {height}px"
  ></iframe>
  <p class="hint">
    Demo loads from <code>{STORYBOOK_URL}</code>. Run <code>pnpm storybook</code> for it to render
    locally.
  </p>
</div>

<style lang="scss">
  .embed {
    border: 1px solid var(--ss-line);
    background: var(--ss-bg-elev);
  }
  .bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--ss-s-2) var(--ss-s-3);
    border-bottom: 1px solid var(--ss-line);
  }
  .label {
    font-family: var(--ss-font-mono);
    font-size: var(--ss-ui-xs);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--ss-fg-faint);
  }
  .open {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: var(--ss-font-mono);
    font-size: var(--ss-ui-xs);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--ss-primary);
    text-decoration: none;
  }
  iframe {
    display: block;
    width: 100%;
    border: none;
    background: var(--ss-bg);
  }
  .hint {
    margin: 0;
    padding: var(--ss-s-2) var(--ss-s-3);
    border-top: 1px solid var(--ss-line);
    font-family: var(--ss-font-mono);
    font-size: var(--ss-ui-xs);
    color: var(--ss-fg-faint);

    code {
      color: var(--ss-fg-muted);
    }
  }
</style>
