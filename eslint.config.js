import { defineConfig, globalIgnores } from 'eslint/config';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default defineConfig([
  {
    languageOptions: {
      parser: tsParser
    },
    plugins: {
      '@typescript-eslint': typescriptEslint
    },
    extends: compat.extends(
      'eslint:recommended',
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier',
      'plugin:prettier/recommended'
    ),

    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/prefer-namespace-keyword': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      'no-async-promise-executor': 'off',
      'no-constant-condition': 'off',

      'no-empty': [
        'error',
        {
          allowEmptyCatch: true
        }
      ],

      'no-useless-catch': 'off',
      'no-useless-escape': 'off',
      'prefer-const': 'off'
    }
  },
  {
    files: ['src/lib/**/*.{js,mjs}'],

    languageOptions: {
      ecmaVersion: 6,
      sourceType: 'module',
      parserOptions: {},

      globals: {
        ...globals.amd,
        ...globals.commonjs,
        ...globals.browser,
        axios: true,
        Debug: true,
        Store: true,
        WAPI: true,
        webpackChunkwhatsapp_web_client: true,
        WWebJS: true
      }
    },

    rules: {
      '@typescript-eslint/no-array-constructor': 'off',
      'no-prototype-builtins': 'off',
      'no-redeclare': 'off',
      'no-console': 0
    }
  },
  {
    files: ['src/lib/**/webpack.*.{js,mjs}', 'src/lib/**/gulpfile.mjs'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...Object.fromEntries(
          Object.entries(globals.browser).map(([key]) => [key, 'off'])
        ),
        ...globals.node
      }
    }
  },
  globalIgnores(['src/lib/wapi/store/*'])
]);
