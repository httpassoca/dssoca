# dssoca docs site — Claude / agent context

The **documentation site** for the `dssoca` design system (agile `DS-0010`). Read this before
working in `documentation/`. For the library itself, see the repo-root `CLAUDE.md`.

## What it is

A standalone **SvelteKit + mdsvex** app (package `dssoca-docs`, `private`) that documents dssoca in
the spirit of [ui.shadcn.com](https://ui.shadcn.com/): a landing page, narrative guides, a live
token gallery, and a page per component that **embeds the component's live Storybook story**.

- **Local-only.** No deploy/CI (intentionally out of scope). Run it locally; `pnpm docs:build`
  produces a static site via `adapter-static`.
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
      +layout.svelte   shell: top bar (PassocaMark + ThemeControls) + dssoca Sidebar nav
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
