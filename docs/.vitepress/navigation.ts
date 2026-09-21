/**
 * Nav and sidebar structure for the docs.
 *
 * Kept out of config.mts and free of any VitePress import so the link integrity test can
 * load it directly: tests/unit/docs-navigation.test.ts walks every entry and asserts the
 * target markdown file exists, which is the failure mode a docs site actually has.
 */

/** The TVMJS library repository — the source these docs describe. */
export const REPO_URL = 'https://github.com/tronweb3/tvmjs-monorepo';

/** This website repository — where the markdown on each page lives. */
export const HOME_REPO_URL = 'https://github.com/tronweb3/tvmjs-site';

export const NPM_ORG_URL = 'https://www.npmjs.com/org/tvmjs';

/**
 * Markdown under `docs/` that is repository documentation, not a published page.
 *
 * VitePress would otherwise route README.md as a page and fail the build on its
 * relative links out of the docs root. Consumed by config.mts (`srcExclude`) and by the
 * orphan-page test, so the two can never disagree about what is content.
 */
export const SRC_EXCLUDE = ['README.md'];

export type NavLink = { text: string; link: string; activeMatch?: string };
export type NavDropdown = { text: string; items: NavLink[] };
export type NavExternalComponent = { component: string; props: { title: string; href: string } };
export type NavEntry = NavLink | NavDropdown | NavExternalComponent;

export type SidebarGroup = { text: string; items: NavLink[] };

/**
 * `basePath` is where the *site* is mounted, not the docs — the Home entry has to escape
 * the docs base, which is why it renders through the ExternalNavLink component.
 */
export function buildNav(basePath: string, version: string): NavEntry[] {
  return [
    { component: 'ExternalNavLink', props: { title: 'Home', href: basePath ? `${basePath}/` : '/' } },
    // Back to the docs landing page. Named "Docs" rather than "Home" or "Overview": Home
    // already means the site, and /tron/overview would make "Overview" ambiguous.
    { text: 'Docs', link: '/' },
    { text: 'Guide', link: '/guide/introduction', activeMatch: '/guide/' },
    { text: 'TRON Semantics', link: '/tron/overview', activeMatch: '/tron/' },
    { text: 'Packages', link: '/packages/', activeMatch: '/packages/' },
    {
      text: `v${version}`,
      items: [
        { text: `What’s new in ${version}`, link: `/releases/v${version}` },
        { text: 'Release history', link: `${REPO_URL}/releases` },
        { text: 'npm', link: NPM_ORG_URL },
      ],
    },
  ];
}

export const SIDEBAR: SidebarGroup[] = [
  {
    text: 'Guide',
    items: [
      { text: 'Introduction', link: '/guide/introduction' },
      { text: 'Getting Started', link: '/guide/getting-started' },
      { text: 'Chain Configuration', link: '/guide/chain-configuration' },
      { text: 'Executing Code', link: '/guide/execution' },
      { text: 'State and Blockchain', link: '/guide/state-and-blockchain' },
      { text: 'Events and Tracing', link: '/guide/events-and-tracing' },
      { text: 'Coming from EthereumJS', link: '/guide/migrating-from-ethereumjs' },
    ],
  },
  {
    text: 'TRON Semantics',
    items: [
      { text: 'Overview', link: '/tron/overview' },
      { text: 'TRC-10 Token Opcodes', link: '/tron/token-opcodes' },
      { text: 'Precompiled Contracts', link: '/tron/precompiles' },
      { text: 'Account Model', link: '/tron/account-model' },
      { text: 'Energy Model', link: '/tron/energy' },
      { text: 'Addresses', link: '/tron/addresses' },
      { text: 'Transaction IDs', link: '/tron/transaction-ids' },
    ],
  },
  {
    text: 'Packages',
    items: [{ text: 'Overview', link: '/packages/' }],
  },
];

/** Release notes, newest first. Each entry must have a matching `releases/vX.Y.Z.md`. */
export const RELEASES: NavLink[] = [{ text: 'v1.1.0', link: '/releases/v1.1.0' }];

/** The sidebar as VitePress consumes it: the static groups plus the release list. */
export const SIDEBAR_WITH_RELEASES: SidebarGroup[] = [...SIDEBAR, { text: 'Releases', items: RELEASES }];
