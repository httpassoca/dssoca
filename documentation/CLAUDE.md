# dssoca docs site — Claude / agent context

The **documentation site** for the `dssoca` design system (agile `DS-0010`). Read this before
working in `documentation/`. For the library itself, see the repo-root `CLAUDE.md`.

## What it is

A standalone **SvelteKit + mdsvex** app (package `dssoca-docs`, `private`) that documents dssoca in
the spirit of [ui.shadcn.com](https://ui.shadcn.com/): a landing page, narrative guides, a live
token gallery, and a page per component that **embeds the component's live Storybook story**.

- **Static site.** `pnpm docs:build` produces a fully prerendered static site via `adapter-static`
  → `documentation/build/`. Run it locally with `pnpm docs:dev` / `pnpm docs:preview`.
- **Deployed to Vercel** (see `vercel.json` at the repo root + the Deployment section below).
- **Not published.** It's a separate workspace package — nothing here ships in the npm tarball
  (`pnpm pack` stays clean).
- **Dogfoods dssoca.** The chrome (nav, theme/size toggles, cards) is built from dssoca components +
  tokens, imported from the library **source** (see Aliases).

## Commands (from repo root)

```sh
pnpm docs:dev      # dev server (run `pnpm storybook` alongside for the embeds)
pnpm docs:build    # static build → documentation/build/
pnpm docs:preview  # preview the static build
pnpm docs:test     # Vitest unit tests (docs config + highlighter)
```

## Deployment (Vercel)

The site deploys to **Vercel** as a static build. Two facts about how Vercel handles this monorepo
drive the config:

1. Vercel **reads `vercel.json` from the repo root** regardless of the Root Directory → the config
   lives at **`vercel.json` (repo root)**.
2. Vercel **runs the build commands _in_ the Root Directory** (`documentation/`) → so the commands
   must be this package's own scripts (the repo-root `pnpm docs:build` isn't visible there).

`vercel.json`:

- `framework: null` — we drive the build ourselves (don't let Vercel's SvelteKit detection assume
  `adapter-vercel`); we ship the `adapter-static` output instead.
- `buildCommand: pnpm -w run prepare && pnpm build`. Two syncs are needed:
  - `pnpm -w run prepare` runs the **root/library** `svelte-kit sync` (at the workspace root) →
    creates the repo-root `.svelte-kit/tsconfig.json`. The docs build transforms the dogfooded
    `../src` library files, which fall under the **repo-root `tsconfig.json`** (it
    `extends "./.svelte-kit/tsconfig.json"`); without this the build dies with
    `Tsconfig not found .../.svelte-kit/tsconfig.json`.
  - `pnpm build` is this package's own `svelte-kit sync && vite build` (run from `documentation/`).
- `outputDirectory: build` (relative to the Root Directory → `documentation/build`).
- `trailingSlash: true` — matches the docs' `trailingSlash: 'always'` so prerendered
  `route/index.html` files resolve.

**One-time setup (Vercel dashboard):**

- _Root Directory_ = `documentation`, Framework Preset = "Other" (the repo-root `vercel.json`
  supplies the commands).
- **Enable "Include files outside the Root Directory in the Build Step"** — the docs import the
  library **source** via `../src` (see Aliases), which lives above the Root Directory; pnpm's
  workspace install also resolves from the repo root above.

### Storybook deployment (second Vercel project)

Storybook deploys to Vercel as its **own** static project from this same repo (agile `DS-0056`).
Because Vercel reads a **single repo-root `vercel.json`** (a `documentation/vercel.json` is ignored —
see DS-0015), the two projects can't each have their own config file; instead the one root
`vercel.json` **branches its `buildCommand` on a `VERCEL_DEPLOY_TARGET` env var**:

```jsonc
"buildCommand": "if [ \"$VERCEL_DEPLOY_TARGET\" = \"storybook\" ]; then pnpm -w run prepare && pnpm exec storybook build --output-dir build; else pnpm -w run prepare && pnpm build; fi"
```

- The **docs** project sets no such env var → the `else` branch runs — **byte-for-byte the previous
  command** (`pnpm -w run prepare && pnpm build`). The docs deploy is unchanged.
- The **Storybook** project sets `VERCEL_DEPLOY_TARGET=storybook` → builds Storybook into `build`
  (`pnpm exec storybook build --output-dir build`; `pnpm exec` avoids pnpm's `--` arg-forwarding
  quirk, and `--output-dir build` matches the shared `outputDirectory`, which resolves relative to
  **each project's** Root Directory).

**One-time setup for the Storybook project (Vercel dashboard):**

- New Project → import this repo → _Root Directory_ = repo root (default), Framework Preset = "Other".
- Add env var **`VERCEL_DEPLOY_TARGET = storybook`** (Production + Preview).
- Deploy. The project serves the built Storybook at its own URL.

**Wiring the docs embeds to the deployed Storybook:** the per-component pages embed live Storybook
stories from `STORYBOOK_URL` (default `http://localhost:6006`). On the deployed docs those iframes are
blank until you set **`VITE_STORYBOOK_URL`** on the **docs** project to the Storybook deploy URL, then
redeploy the docs. (Set as a Vercel env var; placeholder until the Storybook URL exists — tracked as a
flagged follow-up.)

## Layout

```
documentation/
  svelte.config.js     mdsvex + vitePreprocess; adapter-static; kit.alias (see below)
  mdsvex.config.js     .svx layout (Prose) + Prism highlighter (escapes braces for Svelte)
  vite.config.ts       server.fs.allow = repo root (to read ../src)
  src/
    app.html           <html data-theme="dark" data-size-variant="md">
    lib/
      docs.config.ts   SOURCE OF TRUTH: STORYBOOK_URL, NAV, and the per-component
                       metadata (name, slug, icon, tagline, storyId, usage, props)
      highlight.ts     Prism highlight() + langClass() (used by CodeBlock)
      prism-setup.js   Prism singleton + language grammars (shared with mdsvex)
      styles/code.css  Prism token theme mapped to --ss-code-* (follows the theme axis)
      layouts/Prose.svelte         mdsvex layout (prose styling for .svx)
      components/      CodeBlock, StoryEmbed, PropsTable, TokenGallery, ThemeControls, ComponentPage
    routes/
      +layout.svelte   shell: top bar (dssoca logo + ThemeControls) + dssoca Sidebar nav
      +layout.ts       prerender = true; trailingSlash = 'always'
      +page.svelte                 landing
      introduction|installation|theming/+page.svx   guide pages (Markdown)
      tokens/+page.svelte          live token gallery
      components/[slug]/+page.{ts,svelte}  one config-driven page per component (entries() prerender)
  test/                Vitest: docs.config invariants + highlighter
```

## Aliases (dogfooding the source)

Wired in `svelte.config.js` → `kit.alias` (feeds both Vite and the generated tsconfig):

- `dssoca` → `../src/lib/index.ts` (components + config)
- `@dssoca/styles/*` → `../src/styles/*` (e.g. `@dssoca/styles/theme.scss`)
- `@dssoca/lib/*` → `../src/lib/*`

`vite.config.ts` adds `server.fs.allow` for the repo root so Vite can read those source files. No
build of the library is needed first — the docs track the working tree.

## House rules

- **Content = what exists today.** No speculative/future components or APIs.
- **Add a component →** add an entry to `src/lib/docs.config.ts` (`COMPONENTS`): set its `storyId`
  to the real Storybook id (`components-<name>--<story>`; confirm against
  `../storybook-static/index.json` or a running Storybook). The nav, the page, and the prerender
  `entries()` all derive from that array.
- **Mdsvex `.svx`** compiles in **legacy** mode (it emits `$$props`); the `runes` override in
  `svelte.config.js` exempts `.svx`. Don't author runes in `.svx`.
- **Code highlighting** is Prism, themed via `--ss-code-*` in `styles/code.css`. The mdsvex
  highlighter must keep escaping `{`/`}` (Svelte would otherwise parse code braces as expressions).
- **Monospace accents** use `--ss-lime`, not `--ss-cyan`.
- **Tests are a rule.** Keep `pnpm docs:test` green; extend it when you add docs-specific logic.
- **Storybook URL** defaults to `http://localhost:6006`; override with `VITE_STORYBOOK_URL`.
