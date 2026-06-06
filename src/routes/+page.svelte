<script lang="ts">
  import Badge from "../lib/components/Badge.svelte";
  import Button from "../lib/components/Button.svelte";
  import Card from "../lib/components/Card.svelte";
  import Input from "../lib/components/Input.svelte";
  import LogStream from "../lib/components/LogStream.svelte";
  import MetricTile from "../lib/components/MetricTile.svelte";
  import ServiceCard from "../lib/components/ServiceCard.svelte";
  import Sidebar from "../lib/components/Sidebar.svelte";
  import Topbar from "../lib/components/Topbar.svelte";
  import type { ColorTheme, Density } from "../lib/config.js";
  import "../lib/theme.css";

  let activeTab = $state("overview");
  let activeSide = $state("hub");

  // Demo models the hub → starts compact/dark. Toggle to preview comfy/light.
  let theme = $state<ColorTheme>("dark");
  let density = $state<Density>("compact");
</script>

<svelte:head>
  <title>@homelab/ui — design system preview</title>
</svelte:head>

<div class="ss-app" data-theme={theme} data-density={density}>
  <Topbar active={activeTab} onTab={(t) => (activeTab = t)} />
  <Sidebar active={activeSide} onSelect={(id) => (activeSide = id)} />

  <main class="ss-main">
    <div class="ss-pageHead">
      <div>
        <h1>Good morning, <span class="accent">Rafael.</span></h1>
        <div class="sub">hub.home · bun · hono · drizzle · sqlite</div>
      </div>
      <div style="display:flex;gap:6px;align-items:center">
        <Button
          variant="ghost"
          onclick={() =>
            (density = density === "compact" ? "comfy" : "compact")}
        >
          density: {density}
        </Button>
        <Button
          variant="ghost"
          onclick={() => (theme = theme === "dark" ? "light" : "dark")}
        >
          theme: {theme}
        </Button>
        <Button variant="primary">+ deploy</Button>
      </div>
    </div>

    <div class="ss-metrics">
      <MetricTile
        label="services"
        value="6"
        suffix="/7"
        delta="all healthy"
        dir="up"
      />
      <MetricTile label="req/min" value="142" delta="↑12%" dir="up" />
      <MetricTile label="p95" value="48" suffix="ms" delta="−6ms" dir="up" />
      <MetricTile
        label="disk"
        value="2.4"
        suffix="G"
        delta="12% used"
        dir="up"
      />
      <MetricTile label="mem" value="3.8" suffix="G" delta="↑0.2G" dir="down" />
      <MetricTile label="uptime" value="14" suffix="d" />
    </div>

    <div class="ss-grid-2">
      <Card title="Services" meta="6 of 7 healthy">
        <div class="ss-svc-grid">
          <ServiceCard
            name="movies-api"
            host="movies.home"
            status="up"
            latency="4ms"
          />
          <ServiceCard
            name="notes-api"
            host="notes.home"
            status="up"
            latency="6ms"
          />
          <ServiceCard
            name="tasks-api"
            host="tasks.home"
            status="down"
            latency="—"
          />
          <ServiceCard name="hub" host="hub.home" status="up" latency="8ms" />
          <ServiceCard
            name="auth"
            host="hub.home/auth"
            status="up"
            latency="3ms"
          />
          <ServiceCard name="caddy" host=":80 :443" status="up" latency="1ms" />
        </div>
      </Card>

      <div style="display:flex;flex-direction:column;gap:8px">
        <Card title="Movies · to_watch" meta="4 queued">
          <div style="display:flex;flex-direction:column;gap:4px">
            {#each ["Dune: Part Two", "Oppenheimer", "Past Lives", "Poor Things"] as film}
              <div
                style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--ss-line);font-size:12px"
              >
                <span>{film}</span>
                <Badge tone="info">to_watch</Badge>
              </div>
            {/each}
          </div>
        </Card>

        <Card title="Form elements">
          <div style="display:flex;flex-direction:column;gap:10px">
            <Input label="email" type="email" placeholder="rafael@hub.home" />
            <Input label="password" type="password" placeholder="••••••••" />
            <div style="display:flex;gap:6px;margin-top:4px">
              <Button variant="primary" type="submit">sign in</Button>
              <Button variant="secondary">cancel</Button>
              <Button variant="ghost">forgot?</Button>
            </div>
          </div>
        </Card>

        <Card title="Badges">
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <Badge tone="up">up</Badge>
            <Badge tone="deg">degraded</Badge>
            <Badge tone="down">down</Badge>
            <Badge tone="info">to_watch</Badge>
          </div>
        </Card>
      </div>
    </div>

    <Card title="Log stream" meta="live">
      <LogStream live={true} />
    </Card>

    <div class="ss-footer">
      <span>hub.home · v0.4.1</span>
      <span>bun · hono · drizzle · sqlite</span>
    </div>
  </main>
</div>
