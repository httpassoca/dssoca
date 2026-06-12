// ESLint flat config (DS-0075). Baseline = recommended sets; rules that fire
// widely on the existing tree are downgraded/disabled below (each annotated)
// so `pnpm lint` is green today and can be ratcheted up over time.
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import svelte from 'eslint-plugin-svelte'
import prettier from 'eslint-config-prettier'
import globals from 'globals'
import svelteConfig from './svelte.config.js'

export default tseslint.config(
  {
    ignores: [
      'dist/',
      'build/',
      '.svelte-kit/',
      'storybook-static/',
      'coverage/',
      'node_modules/',
      'documentation/build/',
      'documentation/.svelte-kit/',
      'documentation/node_modules/',
      'agile/', // generated board + tracker tooling, not product code
      'static/',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...svelte.configs.recommended,
  prettier,
  ...svelte.configs.prettier,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.svelte'],
        svelteConfig,
      },
    },
  },
  {
    // Adoption baseline (DS-0075): rules below recommended-severity fire on the
    // current tree; they are downgraded (warn) or disabled (off) so `pnpm lint`
    // is green without a mass edit. Ratchet warns back to error as hits are fixed.
    rules: {
      // SvelteKit-app rule; this is a component library whose links take arbitrary
      // consumer-supplied hrefs — resolve() doesn't apply.
      'svelte/no-navigation-without-resolve': 'off',
      // ~10 existing keyless {#each} blocks over static lists; fix incrementally.
      'svelte/require-each-key': 'warn',
      // Card.svelte carries a svelte-ignore list the current compiler no longer warns
      // for — clean the comment, then restore to error.
      'svelte/no-unused-svelte-ignore': 'warn',
      // Story-file style (explicit children snippets); harmless.
      'svelte/no-useless-children-snippet': 'warn',
      // Refactor suggestions, not bugs (LogStream, docs HubTile).
      'svelte/prefer-writable-derived': 'warn',
      // Non-reactive Set usage in Accordion/LogStream predates SvelteSet; review separately.
      'svelte/prefer-svelte-reactivity': 'warn',
      // Icon.svelte renders its own static glyph markup; docs CodeBlock renders Prism
      // output — both intentional {@html} sites. Keep visible as warnings.
      'svelte/no-at-html-tags': 'warn',
      // Two existing hits in files under active edit; underscore-prefix = intentional.
      // Ratchet to error once clean.
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      // One expression-statement hit in docs TokenGallery.
      '@typescript-eslint/no-unused-expressions': 'warn',
      // One dead assignment in SegmentedControl.
      'no-useless-assignment': 'warn',
    },
  },
)
