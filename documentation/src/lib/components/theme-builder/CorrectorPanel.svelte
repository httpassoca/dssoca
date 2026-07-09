<script lang="ts">
  import { Badge, Button } from 'dssoca'
  import type { Check } from '$lib/theme-builder/types'

  interface Props {
    checks: Check[]
    /** Apply one check's `fixedHex` as an override on its slot+theme. */
    onFix: (check: Check) => void
    /** Apply every available fix, re-running the checks between rounds. */
    onFixAll: () => void
  }
  let { checks, onFix, onFixAll }: Props = $props()

  const groups = $derived(
    (['dark', 'light'] as const).map((theme) => ({
      theme,
      checks: checks.filter((c) => c.theme === theme),
    })),
  )
  const fixable = $derived(checks.filter((c) => !c.ok && c.fixSlot && c.fixedHex))
  const allOk = $derived(checks.every((c) => c.ok))

  const ratio = (c: Check) => (c.ratio === undefined ? '' : `${c.ratio.toFixed(2)}:1`)
</script>

<div class="corrector">
  <div class="head">
    <h3>corrector</h3>
    {#if fixable.length >= 2}
      <Button variant="secondary" onclick={onFixAll}>Fix everything</Button>
    {/if}
  </div>

  {#if allOk}
    <p class="all-good">
      <Badge tone="positive" dot label="all checks pass">all checks pass</Badge>
      every text slot clears its WCAG target on both themes.
    </p>
  {/if}

  {#each groups as group (group.theme)}
    <section>
      <h4>{group.theme}</h4>
      <div class="rows">
        {#each group.checks as check (check.id)}
          <div class="row" class:fail={!check.ok}>
            <span class="status">
              {#if check.ok}
                <Badge tone="positive" label="pass">✓</Badge>
              {:else}
                <Badge tone="critical" label="fail">✕</Badge>
              {/if}
            </span>
            <span class="text">
              <span class="title">
                {check.title}
                {#if check.target !== undefined}
                  <small>≥ {check.target}:1</small>
                {/if}
              </span>
              <span class="detail">{check.detail}</span>
            </span>
            {#if check.ratio !== undefined}
              <code class="ratio">{ratio(check)}</code>
            {/if}
            {#if !check.ok && check.fixSlot && check.fixedHex}
              <span class="fix">
                <Button variant="ghost" onclick={() => onFix(check)}>
                  Fix → {check.fixedHex}
                </Button>
              </span>
            {/if}
          </div>
        {/each}
      </div>
    </section>
  {/each}
</div>

<style lang="scss">
  .corrector {
    display: flex;
    flex-direction: column;
    gap: var(--ss-s-3);
  }
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ss-gap);
  }
  h3 {
    font-family: var(--ss-font-subhead);
    font-size: var(--ss-size-h3);
    color: var(--ss-fg-shine);
    text-transform: lowercase;
    margin: 0;
  }
  h4 {
    font-family: var(--ss-font-mono);
    font-size: var(--ss-ui-xs);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--ss-fg-faint);
    margin: 0 0 var(--ss-s-2);
  }
  .all-good {
    display: flex;
    align-items: center;
    gap: var(--ss-s-2);
    margin: 0;
    font-family: var(--ss-font-body);
    font-size: var(--ss-size-sm);
    color: var(--ss-fg-muted);
  }
  .rows {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--ss-line);
  }
  .row {
    display: flex;
    align-items: center;
    gap: var(--ss-s-3);
    padding: var(--ss-s-2) var(--ss-s-3);
    border-bottom: 1px solid var(--ss-line);

    &:last-child {
      border-bottom: none;
    }
    &.fail {
      background: var(--ss-danger-soft);
    }
  }
  .status {
    flex: none;
  }
  .text {
    display: flex;
    flex-direction: column;
    min-width: 0;

    .title {
      font-family: var(--ss-font-mono);
      font-size: var(--ss-ui-sm);
      color: var(--ss-fg);

      small {
        color: var(--ss-fg-faint);
        margin-left: var(--ss-s-1);
      }
    }
    .detail {
      font-family: var(--ss-font-body);
      font-size: var(--ss-ui-xs);
      color: var(--ss-fg-muted);
    }
  }
  .ratio {
    margin-left: auto;
    font-family: var(--ss-font-mono);
    font-size: var(--ss-ui-xs);
    color: var(--ss-fg-faint);
    flex: none;
  }
  .fix {
    flex: none;
  }
</style>
