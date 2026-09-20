## What this changes

<!-- One or two sentences. Link the issue if there is one. -->

## Why

<!-- The problem this solves. For a content change, say what was wrong or missing. -->

## Checklist

- [ ] `pnpm verify` passes
- [ ] `pnpm build && pnpm test:integration` passes
- [ ] Checked the change at both `BASE_PATH=/tvmjs-site` and `BASE_PATH=` if it touches links or assets
- [ ] Added or updated a test for any behaviour change
- [ ] No new runtime dependency, or the PR explains why one is needed
