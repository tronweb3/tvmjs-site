# TVMJS Home

Website and developer documentation for [TVMJS](https://github.com/tronweb3/tvmjs-monorepo) —
the TRON Virtual Machine implemented in TypeScript.

Two applications, one deployable artifact:

| Path    | Stack                 | What it is                                                  | Served at            |
| ------- | --------------------- | ----------------------------------------------------------- | -------------------- |
| `site/` | Next.js static export | Landing page, roadmap and release announcements             | `${BASE_PATH}/`      |
| `docs/` | VitePress             | Guides, TRON execution semantics, package and release notes | `${BASE_PATH}/docs/` |

`pnpm build` builds both and merges them into a single `dist/` directory that is uploaded
as one unit.

---

## Quick start

```bash
# Node 24 (see .nvmrc) and pnpm 11
corepack enable
pnpm install
pnpm dev
```

`pnpm dev` starts both dev servers behind one proxy, so links between the site and the
docs behave exactly as they will in production:

```
http://localhost:3100/tvmjs-site/        → site  (Next.js   :3103)
http://localhost:3100/tvmjs-site/docs/   → docs  (VitePress :3104)
```

Running a single app on its own port also works — `pnpm dev:site` or `pnpm dev:docs` — but
cross-app links will 404, because each app only serves its own half of the URL space.

## Commands

| Command                 | What it does                                                        |
| ----------------------- | ------------------------------------------------------------------- |
| `pnpm dev`              | Both apps behind one proxy at <http://localhost:3100>               |
| `pnpm dev:site`         | Next.js only                                                        |
| `pnpm dev:docs`         | VitePress only                                                      |
| `pnpm build`            | Build both and merge into `dist/`                                   |
| `pnpm preview`          | Serve the built `dist/` the way production does, on `:3200`         |
| `pnpm test`             | Unit tests — fast, no build required                                |
| `pnpm test:integration` | Assertions against `dist/`; run `pnpm build` first                  |
| `pnpm test:all`         | Both suites                                                         |
| `pnpm lint`             | ESLint over the Next.js app                                         |
| `pnpm typecheck`        | `tsc --noEmit` in both packages                                     |
| `pnpm format`           | Prettier, write                                                     |
| `pnpm format:check`     | Prettier, check only — what CI runs                                 |
| `pnpm verify`           | `format:check` + `lint` + `typecheck` + unit tests. Run before a PR |
| `pnpm clean`            | Remove every build artifact                                         |

## Configuration

Everything deployment-specific is an environment variable with a default that reproduces
the current deployment, so a clean clone builds without any configuration. Copy
`.env.example` to `.env` to change them locally.

| Variable            | Default       | Effect                                                    |
| ------------------- | ------------- | --------------------------------------------------------- |
| `BASE_PATH`         | `/tvmjs-site` | Where the site is mounted. Empty means the origin root    |
| `NEXT_PUBLIC_GA_ID` | _(empty)_     | Google Analytics measurement ID. Empty ships no analytics |

`BASE_PATH` drives the Next.js `basePath`, the VitePress `base` (always `${BASE_PATH}/docs/`),
the dev proxy's routing and the preview server at once. To serve the whole thing from a
domain root:

```bash
BASE_PATH= SITE_URL=https://example.org pnpm build
```

Note that `dist/` never contains a `tvmjs-site/` directory of its own — the prefix lives in the
URLs inside the pages, and the directory is mounted _at_ `BASE_PATH`.

### Analytics

Analytics is opt-in and off by default. A fork that sets no `NEXT_PUBLIC_GA_ID` ships no
tracking script on either property, and an integration test asserts that. Set the variable
only for the deployment that should actually report.

## Deploying

`pnpm build` produces `dist/`. Upload it so that its root is served at `BASE_PATH`.

A static export cannot emit HTTP response headers, so a handful of defences have to be
configured on whatever serves these files. The pages declare what they can in `<meta>`
(CSP, Referrer-Policy) and ship a clickjacking guard script, but these are header-only:

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: frame-ancestors 'none'
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Cross-Origin-Opener-Policy: same-origin
```

`pnpm preview` sets the subset it can, so a local check of the built output is not
misleadingly permissive.

## Repository layout

```
site/                      Next.js app (static export)
  src/app/                 Routes: /, /roadmap, /announcement, /announcement/[version]
  src/components/          Nav, footer, shared MUI-styled primitives
  src/lib/config.ts        Base path, site URL, nav data, path helpers
  public/                  Static assets, analytics bootstrap, frame guard
docs/                      VitePress site
  .vitepress/config.mts    Site config, head tags, CSP
  .vitepress/navigation.ts Nav and sidebar data — kept importable by tests
  guide/  tron/  packages/  releases/
scripts/                   dev proxy, build, preview, clean
tests/unit/                Pure logic and content invariants
tests/integration/         Assertions against the built dist/
```

## Editing content

**A release announcement.** Prepend an entry to `ANNOUNCEMENTS` in
`site/src/app/announcement/announcements.tsx`. `detailContent` is markdown rendered by
`next-mdx-remote`; the detail page is statically generated per version by
`generateStaticParams`. Entries must stay ordered newest first — a unit test enforces it.

**A roadmap quarter.** Edit `site/src/app/roadmap/milestones.ts`. A quarter with no `items`
renders the "to be announced" placeholder; move `status` from `planned` to `in-progress`
to `released` as it lands.

**A documentation page.** Add the markdown file under `docs/`, then add it to `SIDEBAR` in
`docs/.vitepress/navigation.ts`. A page that exists but is not linked fails the test suite,
as does a sidebar entry pointing at a file that does not exist.

**A new TVMJS release.** Bump `TVMJS_VERSION` in `docs/.vitepress/version.ts`, add
`docs/releases/vX.Y.Z.md`, add it to `RELEASES` in `navigation.ts`, and add the matching
announcement. The tests check these stay in step.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). In short: `pnpm verify` must pass, and commits are
formatted by Prettier through a pre-commit hook.

## Licence

This repository — the site and documentation source — is [MIT](LICENSE) licensed.

TVMJS itself is a derivative work of EthereumJS and is released under the **MPL-2.0**
licence in [its own repository](https://github.com/tronweb3/tvmjs-monorepo).
