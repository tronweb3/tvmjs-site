import { describe, expect, it } from 'vitest';
import { resolveBasePath } from '../../scripts/env.mjs';

/**
 * BASE_PATH is normalised in four places that must agree: site/next.config.ts,
 * docs/.vitepress/config.mts, scripts/env.mjs and site/src/lib/config.ts. They cannot
 * share a module — next.config.ts and config.mts are each loaded by a different bundler
 * before any alias exists — so this suite pins the contract, and normalisation-parity.test.ts
 * checks the copies still implement it.
 */
describe('resolveBasePath', () => {
  const withEnv = (value: string | undefined, fn: () => void) => {
    const previous = process.env.BASE_PATH;
    if (value === undefined) delete process.env.BASE_PATH;
    else process.env.BASE_PATH = value;
    try {
      fn();
    } finally {
      if (previous === undefined) delete process.env.BASE_PATH;
      else process.env.BASE_PATH = previous;
    }
  };

  it('defaults to /tvmjs-site so an unconfigured build reproduces the current deployment', () => {
    withEnv(undefined, () => expect(resolveBasePath()).toBe('/tvmjs-site'));
  });

  it('treats an empty value as the origin root', () => {
    withEnv('', () => expect(resolveBasePath()).toBe(''));
  });

  it('treats a lone slash as the origin root, because Next rejects basePath "/"', () => {
    withEnv('/', () => expect(resolveBasePath()).toBe(''));
  });

  it('strips trailing slashes, which would otherwise produce "//logo.png"', () => {
    withEnv('/tvmjs/', () => expect(resolveBasePath()).toBe('/tvmjs'));
    withEnv('/tvmjs///', () => expect(resolveBasePath()).toBe('/tvmjs'));
  });

  it('keeps nested mount points intact', () => {
    withEnv('/projects/tvmjs', () => expect(resolveBasePath()).toBe('/projects/tvmjs'));
  });

  it('rejects a value without a leading slash rather than silently producing bad URLs', () => {
    withEnv('tvmjs', () => expect(() => resolveBasePath()).toThrow(/must start with/));
  });
});
