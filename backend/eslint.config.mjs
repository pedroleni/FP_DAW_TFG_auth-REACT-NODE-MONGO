import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: ['node_modules', 'reports'],
  },
  ...compat.extends(
    'eslint:recommended',
    'plugin:prettier/recommended',
    'eslint-config-prettier'
  ),
  {
    languageOptions: {
      globals: {
        ...globals.commonjs,
        ...globals.node,
      },

      ecmaVersion: 'latest',
      sourceType: 'commonjs',
    },

    rules: {
      'prettier/prettier': [
        'error',
        {
          endOfline: 'semicolon',
        },
        {
          usePrettierrc: true,
        },
      ],
    },
    ignores: [
      'node_modules/',
      'eslint.config.mjs', // Ignorar la carpeta node_modules
      'dist/', // Ignorar la carpeta de salida
      '*.test.js', // Ignorar archivos de prueba
      'config/**/*.js', // Ignorar todos los archivos JS en config y subcarpetas
      'src/temp/**', // Ignorar una subcarpeta específica
    ],
  },
];
