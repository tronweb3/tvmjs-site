/**
 * Shared deployment configuration for the build and dev scripts.
 *
 * Loads `.env` from the repo root if present — no dotenv dependency, `process.loadEnvFile`
 * has been in Node since 20.12. Values already in the real environment win, which is what
 * CI needs: a workflow setting BASE_PATH must not be overridden by a stray local file.
 */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const envFile = path.join(ROOT, '.env');
if (fs.existsSync(envFile)) {
  const before = { ...process.env };
  process.loadEnvFile(envFile);
  // loadEnvFile overwrites; restore anything that was already set.
  for (const [key, value] of Object.entries(before)) process.env[key] = value;
}

/**
 * Where the site is mounted: '' (origin root) or '/segment', never with a trailing slash.
 * Mirrors the normalisation in site/next.config.ts and docs/.vitepress/config.mts — the
 * three must agree or the dev proxy routes to the wrong server.
 */
export function resolveBasePath() {
  const raw = process.env.BASE_PATH ?? '/tvmjs-site';
  const basePath = raw === '/' ? '' : raw.replace(/\/+$/, '');
  if (basePath && !basePath.startsWith('/')) {
    throw new Error(`BASE_PATH must start with "/" or be empty, received: ${JSON.stringify(raw)}`);
  }
  return basePath;
}

export const BASE_PATH = resolveBasePath();

/** Docs live one level inside the site, at `${BASE_PATH}/docs/`. */
export const DOCS_PREFIX = `${BASE_PATH}/docs`;

/** Where each workspace package writes its static output. */
export const SITE_OUT = path.join(ROOT, 'site', 'out');
export const DOCS_OUT = path.join(ROOT, 'docs', '.vitepress', 'dist');

/** The merged, deployable artifact. */
export const DIST = path.join(ROOT, 'dist');
