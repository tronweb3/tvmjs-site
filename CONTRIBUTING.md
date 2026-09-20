# Contributing

Thanks for taking the time. This repository holds the **website and documentation** for
TVMJS. If your change is to the TRON Virtual Machine itself, it belongs in
[tronweb3/tvmjs-monorepo](https://github.com/tronweb3/tvmjs-monorepo) instead.

## Setup

```bash
corepack enable      # pnpm 11, pinned via packageManager
pnpm install
pnpm dev             # http://localhost:3100/tvmjs-site/
```

Node 24 is what CI runs; `.nvmrc` pins it. Anything ≥ 22 should work locally.

## Before you open a pull request

```bash
pnpm verify          # format:check + lint + typecheck + unit tests
pnpm build && pnpm test:integration
```

CI runs exactly these. The pre-commit hook formats staged files with Prettier, so
`format:check` should never be the thing that fails you.

## What we look for

- **One concern per pull request.** A content change and a build change are two PRs.
- **Comments explain why, not what.** The surprising constraint, the bug that motivated
  the workaround, the thing the next reader would otherwise "fix". Do not narrate code
  that already reads clearly.
- **Tests for behaviour, not for coverage.** If you fix a bug, add the assertion that
  would have caught it. `tests/integration/build-output.test.ts` is the right home for
  anything that can only go wrong after bundling.
- **No new runtime dependency without a reason in the PR description.** This is a static
  site; every dependency is weight on every visitor or on the build.

## Content changes

The README's _Editing content_ section covers announcements, roadmap quarters,
documentation pages and version bumps, including which files have to change together.
The test suite enforces most of those pairings, so a half-done edit fails locally.

## Commit messages

Conventional Commits, lightly enforced by review rather than by a hook:

```
feat(docs): document the TRC-10 token ID range
fix(site): prefix announcement images with the base path
chore(deps): bump vitepress to 1.6.4
```

Scopes in use: `site`, `docs`, `build`, `ci`, `deps`.

## Reporting a problem

Open an issue with the URL, what you expected, and what you saw. For anything with a
security impact, follow [SECURITY.md](SECURITY.md) instead of opening a public issue.

## Licence

By contributing you agree that your original contribution is licensed under the MIT Licence,
the same terms as the rest of this repository. Third-party content retains its original licence;
preserve its applicable copyright and licence notices.
