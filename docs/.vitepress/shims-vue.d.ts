/**
 * Lets TypeScript resolve `.vue` imports. Vite handles the actual compilation; without
 * this, `tsc --noEmit` fails on the theme's component imports.
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}
