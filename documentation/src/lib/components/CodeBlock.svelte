<script lang="ts">
  import { highlight, langClass } from '$lib/highlight'

  // A static, copy-able code block with Prism syntax highlighting. Token
  // colours come from the global `code.css` (the --ss-code-* tokens), so it
  // follows the theme axis.
  interface Props {
    code: string
    lang?: string
  }
  let { code, lang = 'svelte' }: Props = $props()

  const highlighted = $derived(highlight(code, lang))
  const cls = $derived(langClass(lang))

  let copied = $state(false)
  let timer: ReturnType<typeof setTimeout> | undefined

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      copied = true
      clearTimeout(timer)
      timer = setTimeout(() => (copied = false), 1500)
    } catch {
      // clipboard unavailable (e.g. insecure context) — no-op
    }
  }
</script>

<div class="code">
  <div class="bar">
    <span class="lang">{lang}</span>
    <button type="button" onclick={copy} aria-label="Copy code to clipboard">
      {copied ? 'copied' : 'copy'}
    </button>
  </div>
  <pre class="language-{cls}"><code class="language-{cls}">{@html highlighted}</code></pre>
</div>

<style lang="scss">
  .code {
    border: 1px solid var(--ss-line);
    background: var(--ss-code-bg);
  }
  .bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--ss-s-1) var(--ss-s-3);
    border-bottom: 1px solid var(--ss-line);
    background: var(--ss-bg-elev);
  }
  .lang {
    font-family: var(--ss-font-mono);
    font-size: var(--ss-ui-xs);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--ss-fg-faint);
  }
  button {
    font-family: var(--ss-font-mono);
    font-size: var(--ss-ui-xs);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--ss-fg-muted);
    background: transparent;
    border: 1px solid var(--ss-line);
    padding: 2px 8px;
    cursor: pointer;
    transition:
      color var(--ss-dur-fast) var(--ss-ease),
      border-color var(--ss-dur-fast) var(--ss-ease);
  }
  button:hover {
    color: var(--ss-primary);
    border-color: var(--ss-primary);
  }
  pre {
    margin: 0;
    padding: var(--ss-s-4);
    overflow-x: auto;
    color: var(--ss-code-fg);
    font-family: var(--ss-font-mono);
    font-size: var(--ss-size-xs);
    line-height: 1.6;
  }
</style>
