import type { StorybookConfig } from '@storybook/sveltekit';

const config: StorybookConfig = {
  // Stories live outside src/lib so svelte-package never publishes them.
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|ts|svelte)'],
  addons: ['@storybook/addon-svelte-csf', '@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/sveltekit',
    options: {},
  },
};

export default config;
