import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

const ignores = [
  'dist/**',
  'coverage/**',
  'node_modules/**',
  '.pnpm-store/**',
  '.vite/**',
  'eslint.config.mjs',
];

function createBaseTypeScriptConfig(extraConfig, options = {}) {
  const { project = ['./tsconfig.json'] } = options;

  return tseslint.config(
    { ignores },
    js.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.strictTypeChecked,
    {
      languageOptions: {
        parserOptions: {
          project,
          tsconfigRootDir: process.cwd(),
        },
      },
      rules: {
        '@typescript-eslint/consistent-type-imports': 'error',
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/no-misused-promises': 'error',
        'no-console': 'off',
      },
    },
    extraConfig,
    prettier,
  );
}

export function createNodeConfig(options) {
  return createBaseTypeScriptConfig({
    languageOptions: {
      globals: globals.node,
    },
  }, options);
}

export function createReactConfig(options) {
  return createBaseTypeScriptConfig({
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  }, options);
}
