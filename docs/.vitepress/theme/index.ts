// https://vitepress.dev/guide/custom-theme
import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import 'virtual:group-icons.css';
import './style.css';
import ExternalNavLink from './components/ExternalNavLink.vue';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('ExternalNavLink', ExternalNavLink);
  },
} satisfies Theme;
