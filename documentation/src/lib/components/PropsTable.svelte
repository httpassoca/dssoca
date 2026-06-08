<script lang="ts">
  import type { PropDoc } from '$lib/docs.config';
  let { props }: { props: PropDoc[] } = $props();
</script>

<div class="wrap">
  <table>
    <thead>
      <tr>
        <th>Prop</th>
        <th>Type</th>
        <th>Default</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      {#each props as p (p.name)}
        <tr>
          <td><code class="name">{p.name}</code></td>
          <td><code class="type">{p.type}</code></td>
          <td>{#if p.default}<code>{p.default}</code>{:else}<span class="dash">—</span>{/if}</td>
          <td>{p.desc}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style lang="scss">
  .wrap {
    overflow-x: auto;
    border: 1px solid var(--ss-line);
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-family: var(--ss-font-mono);
    font-size: var(--ss-size-xs);
  }
  th,
  td {
    text-align: left;
    padding: var(--ss-s-2) var(--ss-s-3);
    border-bottom: 1px solid var(--ss-line);
    vertical-align: top;
  }
  th {
    color: var(--ss-fg-faint);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: var(--ss-bg-elev);
  }
  td {
    color: var(--ss-fg);
  }
  tbody tr:last-child td {
    border-bottom: none;
  }
  code {
    background: var(--ss-bg);
    border: 1px solid var(--ss-line);
    padding: 0.1em 0.4em;
  }
  .name {
    color: var(--ss-primary);
  }
  .type {
    color: var(--ss-lime);
  }
  .dash {
    color: var(--ss-fg-faint);
  }
</style>
