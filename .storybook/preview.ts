import type { Decorator, Preview } from '@storybook/sveltekit';
import '../src/lib/theme.css';

/**
 * The design system is driven by two orthogonal axes written as data-attributes
 * on an ancestor (usually <html>): color (`data-theme`) and density
 * (`data-density`). We expose both as Storybook toolbar globals and apply them
 * to <html> so every story recolors/rescales exactly as it would in an app.
 */
const withDesignAxes: Decorator = (story, context) => {
  if (typeof document !== 'undefined') {
    const { theme, density } = context.globals;
    document.documentElement.setAttribute('data-theme', theme ?? 'dark');
    document.documentElement.setAttribute('data-density', density ?? 'comfy');
  }
  return story();
};

const preview: Preview = {
  decorators: [withDesignAxes],
  globalTypes: {
    theme: {
      description: 'Color axis (data-theme)',
      defaultValue: 'dark',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'dark', title: 'Dark' },
          { value: 'light', title: 'Light' },
        ],
        dynamicTitle: true,
      },
    },
    density: {
      description: 'Density axis (data-density)',
      defaultValue: 'comfy',
      toolbar: {
        title: 'Density',
        icon: 'component',
        items: [
          { value: 'comfy', title: 'Comfy' },
          { value: 'compact', title: 'Compact' },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
