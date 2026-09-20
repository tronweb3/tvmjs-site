# site

The TVMJS marketing site: a Next.js app built as a **static export**. See the
[repository README](../README.md) for the workspace-level commands, the deployment model
and the environment variables.

## Commands

Run from this directory (or use the root `pnpm dev`, which serves this app and the docs
behind one proxy so cross-app links work):

```bash
pnpm dev        # Next dev server — serves under BASE_PATH, so http://localhost:3000/tvmjs-site
pnpm build      # static export → out/
pnpm lint       # ESLint
pnpm typecheck  # next typegen && tsc --noEmit
```

`pnpm build` writes `out/`. The root `pnpm build` copies that to `dist/` and drops the
docs build in at `dist/docs/`.

## Pages

| Route                     | Source                            | Notes                                                |
| ------------------------- | --------------------------------- | ---------------------------------------------------- |
| `/`                       | `src/app/page.tsx`                | Overview, feature cards, package list                |
| `/roadmap`                | `src/app/roadmap/`                | Quarterly milestones; content in `milestones.ts`     |
| `/announcement`           | `src/app/announcement/`           | Release notes; entries in `announcements.tsx`        |
| `/announcement/[version]` | `src/app/announcement/[version]/` | One statically generated page per announcement entry |

The export writes `/roadmap.html` rather than `/roadmap`, so `NAV_LIST` in
`src/lib/config.ts` switches form on `NODE_ENV` and `normalizePath()` makes the active-state
comparison work in both.

## Base path

`basePath` comes from the `BASE_PATH` environment variable and defaults to `/tvmjs-site`. It
applies in `next dev` too, so the local URL carries the prefix.

Next rewrites routes and its own chunk URLs for `basePath`, but **not**:

- `src` on `next/image` or on a plain `<img>` in a static export
- `icons` in the `metadata` export
- `url()` inside CSS

The first two go through `assetPath()` from `src/lib/config.ts`. The third cannot: a
stylesheet has no way to read the base path, so `layout.tsx` sets the finished `url(...)`
value on `<body>` as a custom property (`--bg-home-image`, `--bg-announcement-image`) and
`globals.css` consumes it. Anything new that points at `public/` needs one of these two
treatments — the integration tests at the repo root assert both.

## Fonts

Inter and Wix Madefor Display (both SIL OFL) are self-hosted through `next/font/google` in
`src/app/layout.tsx`. The build downloads the latin subset once and emits it under
`/_next/static/media`, so visitors never contact Google and no font binary is committed.
The build therefore needs network access to `fonts.googleapis.com`.
