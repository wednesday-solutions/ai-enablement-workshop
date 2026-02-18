import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import sonarjs from 'eslint-plugin-sonarjs'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  sonarjs.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      // Honour standard TypeScript _ prefix convention for intentionally unused names
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],

      // Downgraded to warn — pre-existing issues in untyped server routes and
      // untyped fetch responses. These will be fixed in Phase 2f (typed routes)
      // and Phase 2d (security + typed auth). Until then they surface as warnings
      // without blocking CI.
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-misused-promises': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/restrict-template-expressions': 'warn',
      '@typescript-eslint/no-base-to-string': 'warn',

      // Downgraded to warn — sonarjs security/quality rules for known pre-existing
      // issues. hardcoded-secret and pseudo-random are fixed in Phase 2d.
      // cors and x-powered-by are server config concerns addressed in Phase 2f.
      'sonarjs/hardcoded-secret-signatures': 'warn',
      'sonarjs/pseudo-random': 'warn',
      'sonarjs/cors': 'warn',
      'sonarjs/x-powered-by': 'warn',
      'sonarjs/no-alphabetical-sort': 'warn',
      'sonarjs/no-misleading-array-reverse': 'warn',
      // Pre-existing patterns in web pages — addressed in Phase 2c (Home perf) and Phase 2f (quality)
      'sonarjs/no-ignored-return': 'warn',
      'sonarjs/no-ignored-exceptions': 'warn',
      'sonarjs/prefer-read-only-props': 'warn',
      // React class render() legitimately returns JSX | ReactNode on different paths
      'sonarjs/function-return-type': 'warn',
    },
  },
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**'],
  }
)
