import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

/**
 * eslint-config-next 16 exports a flat config directly, so consume it as-is.
 *
 * Do not reach for `FlatCompat` here: routing this preset through the eslintrc shim
 * crashes inside @eslint/eslintrc on ESLint 9 instead of reporting lint results, which
 * looks like a tooling error rather than a config mistake.
 */
const config = [
  {
    ignores: ['.next/**', 'out/**', 'next-env.d.ts', 'public/**'],
  },
  ...nextCoreWebVitals,
];

export default config;
