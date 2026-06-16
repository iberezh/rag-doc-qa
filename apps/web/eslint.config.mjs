import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const config = [
  { ignores: ['.next', 'node_modules', 'next-env.d.ts'] },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    // Enforce the repo's architectural limits (CLAUDE.md) that the framework presets don't cover.
    rules: {
      complexity: ['error', 15],
      'max-depth': ['error', 3],
      'max-params': ['error', 3],
      'no-nested-ternary': 'error',
      'max-lines': ['warn', { max: 150, skipBlankLines: true, skipComments: true }],
    },
  },
];

export default config;
