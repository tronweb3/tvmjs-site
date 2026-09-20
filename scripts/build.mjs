#!/usr/bin/env node
/**
 * Build both apps and merge them into one deployable artifact at `dist/`.
 *
 *   dist/            ← site/out             (Next.js static export)
 *   dist/docs/       ← docs/.vitepress/dist (VitePress build)
 *
 * `dist/` is laid out to be served at BASE_PATH: with the default BASE_PATH=/tvmjs-site it is
 * uploaded to https://host/tvmjs-site/, with BASE_PATH= it is the origin root. The apps encode
 * BASE_PATH in their own URLs, so the directory itself carries no prefix.
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, BASE_PATH, SITE_OUT, DOCS_OUT, DIST } from './env.mjs';

const C = { reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m', red: '\x1b[31m', green: '\x1b[32m' };

function run(label, args) {
  console.log(`${C.bold}▸ ${label}${C.reset}`);
  const result = spawnSync('pnpm', args, { cwd: ROOT, stdio: 'inherit' });
  if (result.error) {
    console.error(`${C.red}${label} failed to start: ${result.error.message}${C.reset}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`${C.red}${label} failed with exit code ${result.status}${C.reset}`);
    process.exit(result.status ?? 1);
  }
}

function requireDir(dir, hint) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    console.error(`${C.red}Expected build output at ${dir} — ${hint}${C.reset}`);
    process.exit(1);
  }
}

// NODE_ENV=production is what switches analytics on in both apps and is what `next build`
// and `vitepress build` expect; set it here so a bare `pnpm build` behaves like CI.
process.env.NODE_ENV = 'production';

run('Building site (Next.js)', ['--filter', 'tvmjs-site', 'build']);
run('Building docs (VitePress)', ['--filter', 'tvmjs-docs', 'build']);

requireDir(SITE_OUT, 'did `next build` run with output: "export"?');
requireDir(DOCS_OUT, 'did `vitepress build` succeed?');

console.log(`${C.bold}▸ Merging into dist/${C.reset}`);
fs.rmSync(DIST, { recursive: true, force: true });
fs.cpSync(SITE_OUT, DIST, { recursive: true });

const docsDest = path.join(DIST, 'docs');
if (fs.existsSync(docsDest)) {
  // A `docs` route in the Next app would be silently replaced by the VitePress build.
  console.error(
    `${C.red}site/out already contains a "docs" entry — it would be overwritten by the docs build.${C.reset}`
  );
  process.exit(1);
}
fs.cpSync(DOCS_OUT, docsDest, { recursive: true });

const mountedAt = BASE_PATH || '/';
console.log('');
console.log(`${C.green}${C.bold}  Build complete${C.reset}`);
console.log(`${C.dim}  artifact: ${path.relative(ROOT, DIST)}/${C.reset}`);
console.log(`${C.dim}  serve at: ${mountedAt}   (docs at ${BASE_PATH}/docs/)${C.reset}`);
console.log('');
