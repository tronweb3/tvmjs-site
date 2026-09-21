import type { HTMLAttributeAnchorTarget } from 'react';

const isDev = process.env.NODE_ENV === 'development';

/**
 * Where this app is mounted. Injected by next.config.ts from the BASE_PATH env var;
 * '' means the app is served from the origin root.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** Public origin (including base path) used for canonical and Open Graph URLs. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://walletadapter.org/tvmjs-site').replace(
  /\/+$/,
  ''
);

/** Google Analytics measurement ID. Empty disables analytics — see layout.tsx. */
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? '';

/**
 * Prefix a file in `public/` with the app's base path.
 *
 * Next rewrites routes and its own chunk URLs for `basePath`, but it does not touch the
 * `src` of next/image or of a plain <img> in a static export. Without this, `/logo.png`
 * resolves against the origin root rather than this app's own copy.
 */
export const withBasePath = (path: string) => `${BASE_PATH}${path}`;

/** Alias for readability at asset call sites. */
export const assetPath = withBasePath;

/**
 * Absolute URL for a page, used for `canonical` and `og:url`.
 *
 * `href` is the exported path relative to this app's root, e.g. '/roadmap.html'.
 * SITE_URL already carries the base path, so this must not go through withBasePath.
 */
export const absoluteUrl = (href: string) => `${SITE_URL}${href.startsWith('/') ? href : `/${href}`}`;

/** The site's own root, base-path aware — the nav logo and footer link here. */
export const SITE_ROOT = BASE_PATH || '/';

/**
 * The origin root — the parent property this site is mounted inside (walletadapter.org).
 * Deliberately not base-path aware: the nav logo and title lead out of this site, while
 * SITE_ROOT leads to its own home.
 */
export const PARENT_ROOT = '/';

export const BRAND = 'TVMJS';

export const GITHUB_URL = 'https://github.com/tronweb3/tvmjs-monorepo';
export const ISSUE_URL = 'https://github.com/tronweb3/tvmjs-monorepo/issues';
export const NPM_ORG_URL = 'https://www.npmjs.com/org/tvmjs';
export const MPL_LICENSE_URL = 'https://mozilla.org/MPL/2.0/';
export const RELEASES_URL = 'https://github.com/tronweb3/tvmjs-monorepo/releases';

export type NavItem = {
  path: string;
  title: string;
  target?: HTMLAttributeAnchorTarget;
  width?: string;
  /**
   * Render a plain <a> instead of next/link. Needed for destinations that are not Next
   * routes — the VitePress docs are a separate static build, and Link would try to
   * client-side navigate into a route this app does not have.
   */
  external?: boolean;
};
export type NavGroup = { title: string; width?: string; children: NavItem[] };
export type NavEntry = NavItem | NavGroup;

export const isNavGroup = (entry: NavEntry): entry is NavGroup => 'children' in entry;

export const NAV_LIST: NavEntry[] = [
  { path: '/', title: 'Home', width: '50px' },
  // Rendered as a plain <a> via `external`, so NavBar prefixes the base path itself:
  // '/docs/' becomes `${BASE_PATH}/docs/`.
  { path: '/docs/', title: 'Docs', width: '48px', external: true },
  { path: isDev ? '/roadmap' : '/roadmap.html', title: 'Roadmap', width: '72px' },
  { path: isDev ? '/announcement' : '/announcement.html', title: 'Announcements', width: '116px' },
];

/**
 * Collapse a link or a page's `pathname` to one comparable form.
 *
 * The two sides never match literally: pages hand CommonLayout the exported name
 * (`/roadmap.html`) while NAV_LIST switches on `isDev` and serves `/roadmap` locally,
 * so a plain `===` highlighted nothing in dev. Normalising both sides makes the active
 * state work in dev and in the static export alike.
 */
export function normalizePath(path: string) {
  let p = (path || '/').split('?')[0].split('#')[0];
  if (p.endsWith('.html')) p = p.slice(0, -'.html'.length);
  if (p.endsWith('/index')) p = p.slice(0, -'/index'.length);
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p || '/';
}

/** True when `href` is the page currently being rendered. */
export function isActivePath(pathname: string, href: string) {
  return normalizePath(pathname) === normalizePath(href);
}
