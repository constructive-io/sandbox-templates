import coreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

// eslint-config-next 16 ships flat configs natively (each entry point is a
// flat-config array) — spreading them through FlatCompat's legacy eslintrc
// loader crashes the validator on their plugin objects, so import and spread
// them directly instead.
const eslintConfig = [
  {
    ignores: ['.next/**/*', 'src/graphql/**/*'],
  },
  ...coreWebVitals,
  ...nextTypescript,
  {
    // eslint-plugin-react 7.x's version 'detect' probes the filesystem via
    // context.getFilename(), which eslint 10 removed — pin the version this
    // app actually uses instead of detecting it.
    settings: { react: { version: '19.2' } },
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // eslint-plugin-react-hooks 7.x ships the React-compiler analysis
      // (refs, set-state-in-effect, static-components, …). Those fire across
      // the vendored blocks and hooks at error severity although this
      // codebase predates them; keep them advisory — visible, not gating —
      // until the patterns they flag are worked through.
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/set-state-in-render': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/incompatible-library': 'warn',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@next/next/no-img-element': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'prefer-const': 'error',
      'react/display-name': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];

export default eslintConfig;
