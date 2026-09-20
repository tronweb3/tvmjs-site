# Security policy

## Scope

This repository contains a **static website**: a Next.js static export and a VitePress
documentation build. There is no server runtime, no database, no authentication and no
handling of keys, wallets or user funds anywhere in this codebase.

Reports that are in scope:

- Cross-site scripting or content injection reachable from the published pages
- A dependency advisory that affects the produced artifact rather than only the toolchain
- A supply-chain problem in the build or release path
- Secrets or internal infrastructure detail committed to this repository

Reports about the TRON Virtual Machine itself — execution correctness, energy accounting,
signature precompiles, address derivation — belong to
[tronweb3/tvmjs-monorepo](https://github.com/tronweb3/tvmjs-monorepo).

## What the site does for itself

A static export cannot emit HTTP response headers, which limits what this repository can
enforce on its own:

- Both properties declare a Content-Security-Policy and a Referrer-Policy via `<meta>`.
- `script-src` keeps `'unsafe-inline'` because Next.js streams its RSC payload through
  inline scripts and a static export cannot produce per-build nonces. Removing it breaks
  hydration rather than hardening anything.
- `frame-ancestors` is ignored in a `<meta>` CSP by specification, so `site/public/frame-guard.js`
  runs as a blocking script in `<head>` and hides the document if it is framed.
- `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`,
  `Permissions-Policy` and `Cross-Origin-Opener-Policy` are **header-only** and must be
  configured on the server that serves `dist/`. The README lists the exact set.

An integration test scans the built output for committed credentials, internal hostnames
and source maps on every CI run.

## Supported versions

Only the currently deployed site is supported. There are no releases to patch.
