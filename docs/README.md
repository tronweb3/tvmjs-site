# docs

The TVMJS developer documentation, built with VitePress. See the
[repository README](../README.md) for the workspace-level commands and the deployment model.

## Commands

```bash
pnpm dev        # VitePress dev server
pnpm build      # → .vitepress/dist/
pnpm preview    # serve the build
pnpm typecheck  # tsc --noEmit over .vitepress/
```

The root `pnpm dev` runs this behind the shared proxy so that links to the site resolve;
running it alone means `Home` in the nav 404s.

## Layout

```
guide/          Getting started, chain configuration, execution, tracing, migration
tron/           TRON-specific execution semantics
packages/       Package overview
releases/       Per-version release notes
public/         favicon and logo
.vitepress/
  config.mts      Site config, head tags, CSP, analytics
  navigation.ts   Nav and sidebar data
  version.ts      The TVMJS release these docs describe
  theme/          Theme extension and the ExternalNavLink component
```

`navigation.ts` deliberately imports nothing from VitePress: the link integrity tests at
the repo root load it directly and assert every entry resolves to a markdown file that
exists, and that no markdown file is published without being linked.

## Adding a page

1. Add the markdown under `guide/`, `tron/` or `packages/`.
2. Add it to `SIDEBAR` in `.vitepress/navigation.ts`.
3. `pnpm test` at the repo root — an unlinked page or a dead link fails the suite.

## Base

`base` is `${BASE_PATH}/docs/` and follows the same `BASE_PATH` variable the site uses, so
the two halves always agree about where they are mounted.

## Licence

The documentation source is [MIT](../LICENSE), like the rest of this repository.
