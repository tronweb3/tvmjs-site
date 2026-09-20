import { defineConfig } from 'vitest/config';
import path from 'node:path';

const root = import.meta.dirname;

export default defineConfig({
  resolve: {
    alias: {
      // Mirrors the `@/*` path mapping in site/tsconfig.json so tests import the same
      // specifiers the app does.
      '@': path.resolve(root, 'site/src'),
    },
  },
  test: {
    projects: [
      {
        // Pure logic: base-path normalisation, nav data, page metadata. Fast, no build.
        extends: true,
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        // Asserts against the merged `dist/` artifact, so `pnpm build` must run first.
        // Kept in its own project so `pnpm test` stays build-free.
        extends: true,
        test: {
          name: 'integration',
          include: ['tests/integration/**/*.test.ts'],
          environment: 'node',
          // The whole suite walks the built output; give it room.
          testTimeout: 30_000,
        },
      },
    ],
  },
});
