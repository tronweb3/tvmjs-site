import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Lints the repo-level code: build scripts and tests.
 *
 * The Next.js app carries its own config (site/eslint.config.mjs) because the
 * `next/core-web-vitals` preset has to run with that package's plugin versions.
 * `pnpm lint` runs both.
 */
export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      'dist/**',
      'coverage/**',
      'site/**',
      'docs/.vitepress/dist/**',
      'docs/.vitepress/cache/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['scripts/**/*.mjs', 'tests/**/*.ts', '*.config.ts', '*.config.mjs', 'docs/.vitepress/**/*.ts'],
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-console': 'off',
      eqeqeq: ['error', 'smart'],
      'prefer-const': 'error',
    },
  }
);
