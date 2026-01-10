import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';
import tsEslint from 'typescript-eslint';

export default defineConfig([
  js.configs.all,
  ...tsEslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', {
        args: 'after-used',
        caughtErrors: 'none',
        vars: 'all',
      }],
      'indent': ['error', 2, {
        SwitchCase: 1,
      }],
      'max-lines-per-function': 'off',
      'max-statements': 'off',
      'no-magic-numbers': 'warn',
      'no-multi-spaces': 'error',
      'no-new': 'off',
      'no-ternary': 'off',
      'no-undefined': 'off',
      'no-unused-vars': ['error', {
        args: 'after-used',
        caughtErrors: 'none',
        vars: 'all',
      }],
      'object-curly-spacing': ['error', 'always'],
      'one-var': ['error', 'never'],
      'quotes': ['error', 'single', {
        allowTemplateLiterals: true,
        avoidEscape: true,
      }],
    },
  },
  globalIgnores(['cdk.out/**/*', 'node_modules/**/*']),
]);
