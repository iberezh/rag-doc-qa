import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage', 'eslint.config.mjs'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node, ...globals.jest },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // Architectural limits from CLAUDE.md not covered by the recommended presets.
      complexity: ['error', 15],
      'max-depth': ['error', 3],
      'no-nested-ternary': 'error',
      'max-lines': ['warn', { max: 150, skipBlankLines: true, skipComments: true }],
    },
  },
);
