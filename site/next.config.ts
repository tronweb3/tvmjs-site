import type { NextConfig } from 'next';

/**
 * Where this app is mounted, and the public origin it is served from.
 *
 * Both are environment-driven so the same source can be deployed standalone (`BASE_PATH=`,
 * serving from `/`) or nested under another property (`BASE_PATH=/tvmjs`). The defaults
 * reproduce the current walletadapter.org deployment, so an unconfigured build is the
 * deployment that exists today rather than a surprise.
 *
 * BASE_PATH is re-exposed as NEXT_PUBLIC_BASE_PATH because `assetPath()` in src/lib/config.ts
 * needs it at runtime: Next rewrites routes and chunk URLs for `basePath`, but NOT the `src`
 * of next/image or of a plain <img> in a static export, so those would otherwise resolve
 * against the parent site.
 */
const rawBasePath = process.env.BASE_PATH ?? '/tvmjs';

// Normalise: '' (root) or '/segment', never a trailing slash. `basePath: '/'` is rejected
// by Next, and a trailing slash produces '//logo.png' in asset URLs.
const BASE_PATH = rawBasePath === '/' ? '' : rawBasePath.replace(/\/+$/, '');

if (BASE_PATH && !BASE_PATH.startsWith('/')) {
  throw new Error(`BASE_PATH must start with "/" or be empty, received: ${JSON.stringify(rawBasePath)}`);
}

const SITE_URL = (process.env.SITE_URL ?? 'https://walletadapter.org/tvmjs').replace(/\/+$/, '');

const nextConfig: NextConfig = {
  // basePath also applies in `next dev`, so the local URL is
  // http://localhost:3103{BASE_PATH}.
  basePath: BASE_PATH,
  env: {
    NEXT_PUBLIC_BASE_PATH: BASE_PATH,
    NEXT_PUBLIC_SITE_URL: SITE_URL,
    // Empty disables analytics entirely — the default for forks and local builds.
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID ?? '',
  },
  // Next 16 writes AGENTS.md / CLAUDE.md into the package on every dev start. They are
  // generated scaffolding, not content of this repository, so keep them out of it.
  agentRules: false,
  output: 'export',
  images: { unoptimized: true },
  // next-mdx-remote/rsc must be compiled against this app's React, otherwise
  // prerendering an announcement detail page fails with "A React Element from an
  // older version of React was rendered".
  transpilePackages: ['next-mdx-remote'],
};

export default nextConfig;
