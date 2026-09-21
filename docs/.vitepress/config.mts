import { defineConfig } from 'vitepress';
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons';
import { TVMJS_VERSION } from './version';
import { buildNav, SIDEBAR_WITH_RELEASES, SRC_EXCLUDE, REPO_URL, HOME_REPO_URL } from './navigation';

const isProduction = process.env.NODE_ENV === 'production';
const version = TVMJS_VERSION;

/**
 * Where the site this documentation belongs to is mounted, and where the docs sit inside it.
 *
 * Both are environment-driven so the same source can be deployed standalone or nested under
 * another property. The defaults reproduce the current walletadapter.org deployment. Keep
 * BASE_PATH in step with the value used for the `site/` build — the two are wired together
 * by the root `pnpm build`.
 */
const rawBasePath = process.env.BASE_PATH ?? '/tvmjs-site';
const BASE_PATH = rawBasePath === '/' ? '' : rawBasePath.replace(/\/+$/, '');

// VitePress requires `base` to both start and end with a slash.
const DOCS_BASE = `${BASE_PATH}/docs/`;

const SITE_URL = (process.env.SITE_URL ?? 'https://walletadapter.org/tvmjs-site').replace(/\/+$/, '');

/** Empty disables analytics entirely — the default for forks and local builds. */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? '';
const analyticsEnabled = isProduction && GA_ID !== '';

const DESCRIPTION =
  'Developer documentation for TVMJS, the TRON Virtual Machine implemented in TypeScript. Run and test TRON contract bytecode with TRON opcodes, energy metering, precompiles and the TRON account model.';

export default defineConfig({
  base: DOCS_BASE,
  title: 'TVMJS Documentation',
  description: DESCRIPTION,
  cleanUrls: false,
  srcExclude: SRC_EXCLUDE,
  head: [
    ['link', { rel: 'icon', href: `${DOCS_BASE}favicon.ico` }],
    [
      'meta',
      {
        name: 'keywords',
        content:
          'TVMJS, TVM, TRON Virtual Machine, TRON, TRC-10, energy model, precompiles, smart contracts, TypeScript, java-tron',
      },
    ],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'TVMJS' }],
    ['meta', { property: 'og:title', content: 'TVMJS Documentation' }],
    ['meta', { property: 'og:description', content: DESCRIPTION }],
    ['meta', { property: 'og:url', content: `${SITE_URL}/docs/` }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:title', content: 'TVMJS Documentation' }],
    ['meta', { name: 'twitter:description', content: DESCRIPTION }],
    // Security headers that can be set via <meta> in static HTML. frame-ancestors /
    // X-Frame-Options / X-Content-Type-Options / Permissions-Policy / COOP / HSTS only
    // work as HTTP response headers, which a static build cannot emit — those have to be
    // set on the server serving these files. The repository README lists them.
    [
      'meta',
      {
        // `http-equiv`, not the React spelling `httpEquiv`: VitePress writes head
        // attributes verbatim, so the camelCase form yields an attribute browsers
        // ignore — the policy silently stops being enforced.
        'http-equiv': 'Content-Security-Policy',
        content: [
          "default-src 'self'",
          // VitePress ships an inline hydration script
          "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
          // VitePress injects inline <style> blocks
          "style-src 'self' 'unsafe-inline'",
          // VitePress bundles Inter locally; no external font host needed
          "font-src 'self' data:",
          "img-src 'self' data:",
          // Same set as the site — see the note in site/src/app/layout.tsx. GA4 beacons
          // reach a regional collector, so the exact-host form dropped every hit.
          "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
          'worker-src blob:',
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'none'",
        ].join('; '),
      },
    ],
    ['meta', { name: 'referrer', content: 'strict-origin-when-cross-origin' }],
    // Clickjacking guard shared with the site — `frame-ancestors` is ignored in a <meta> CSP.
    // The file is served from the site's root, one level above the docs base. A plain
    // <script src> in <head> is blocking, so it runs before anything paints.
    ['script', { src: `${BASE_PATH}/frame-guard.js` }],
    ...(analyticsEnabled
      ? [
          ['script', { async: '', src: `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}` }],
          [
            'script',
            {},
            `window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', ${JSON.stringify(GA_ID)});`,
          ],
        ]
      : []),
  ] as [string, Record<string, string>][],
  themeConfig: {
    logo: '/logo.png',
    // The logo and title lead out to the parent site at the origin root, not to the docs
    // landing page (the default). `target: '_self'` matters: VitePress's router swallows
    // clicks on same-origin anchors without a target and would keep the visitor in the docs.
    logoLink: { link: '/', target: '_self' },
    siteTitle: 'TVMJS',
    outline: [2, 3],
    socialLinks: [{ icon: 'github', link: REPO_URL }],
    nav: buildNav(BASE_PATH, version),
    sidebar: SIDEBAR_WITH_RELEASES,
    editLink: {
      // `:path` is relative to this VitePress root (docs/), so the repo prefix is added here.
      pattern: `${HOME_REPO_URL}/edit/main/docs/:path`,
      text: 'Edit this page on GitHub',
    },
    footer: {
      // TVMJS itself is a derivative of EthereumJS and is released under MPL-2.0.
      // This website repository is MIT — see LICENSE at the repo root.
      message: 'TVMJS is released under the MPL-2.0 License.',
      copyright: 'A derivative work of EthereumJS.',
    },
    search: {
      provider: 'local',
    },
  },
  markdown: {
    config(md) {
      md.use(groupIconMdPlugin);
    },
  },
  vite: {
    plugins: [groupIconVitePlugin()],
  },
});
