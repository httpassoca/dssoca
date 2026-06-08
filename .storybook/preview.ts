import type { Decorator, Preview } from '@storybook/sveltekit';
import '../src/styles/theme.scss';

/**
 * The design system is driven by two orthogonal axes written as data-attributes
 * on an ancestor (usually <html>): color (`data-theme`) and size
 * (`data-size-variant`). We expose both as Storybook toolbar globals and apply
 * them to <html> so every story recolors/rescales exactly as it would in an app.
 */
const withDesignAxes: Decorator = (story, context) => {
  if (typeof document !== 'undefined') {
    const { theme, sizeVariant } = context.globals;
    document.documentElement.setAttribute('data-theme', theme ?? 'dark');
    document.documentElement.setAttribute('data-size-variant', sizeVariant ?? 'md');
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
    sizeVariant: {
      description: 'Size axis (data-size-variant)',
      defaultValue: 'md',
      toolbar: {
        title: 'Size',
        icon: 'component',
        items: [
          { value: 'sm', title: 'Small' },
          { value: 'md', title: 'Medium' },
          { value: 'lg', title: 'Large' },
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
