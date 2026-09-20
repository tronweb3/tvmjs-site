import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * The BASE_PATH normalisation in next.config.ts and in the VitePress config is duplicated
 * from scripts/env.mjs — three bundlers, no shared module. A copy that drifts produces a
 * site and a docs build mounted at different prefixes, which no unit test of either half
 * would catch. So assert the literal expression is still present in each.
 *
 * If this fails because the expression was legitimately reworded, update the expectation
 * here and in every other file listed — do not just delete the assertion.
 */
const ROOT = path.resolve(import.meta.dirname, '../..');

const NORMALISATION = `const BASE_PATH = rawBasePath === '/' ? '' : rawBasePath.replace(/\\/+$/, '');`;
const DEFAULT_RAW = `process.env.BASE_PATH ?? '/tvmjs-site'`;

describe.each([['site/next.config.ts'], ['docs/.vitepress/config.mts']])('%s', (file) => {
  const source = fs.readFileSync(path.join(ROOT, file), 'utf8');

  it('applies the shared BASE_PATH normalisation', () => {
    expect(source).toContain(NORMALISATION);
  });

  it('defaults BASE_PATH to /tvmjs-site', () => {
    expect(source).toContain(DEFAULT_RAW);
  });
});

describe('scripts/env.mjs', () => {
  it('is the module the parity assertions are copied from', () => {
    const source = fs.readFileSync(path.join(ROOT, 'scripts/env.mjs'), 'utf8');
    expect(source).toContain(DEFAULT_RAW);
    expect(source).toContain(`raw === '/' ? '' : raw.replace(/\\/+$/, '')`);
  });
});
