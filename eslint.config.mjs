import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** Módulos que un paquete de dominio puro jamás debe importar (CLAUDE.md, CLY-016). */
const FORBIDDEN_IN_PURE_PACKAGES = [
  {
    group: ['react', 'react/*', 'react-dom', 'react-dom/*'],
    message: 'El dominio no depende de React.',
  },
  {
    group: ['react-native', 'react-native-*', 'react-native/*'],
    message: 'El dominio no depende de React Native.',
  },
  { group: ['expo', 'expo-*', 'expo/*', '@expo/*'], message: 'El dominio no depende de Expo.' },
  { group: ['@cly/design-tokens'], message: 'El dominio no depende del sistema visual.' },
];

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.expo/**',
      '**/coverage/**',
      '**/expo-env.d.ts',
      'apps/game/playwright-report/**',
      'apps/game/test-results/**',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    languageOptions: { globals: { ...globals.node } },
    rules: {
      // Nunca evaluar texto como código (CLAUDE.md regla 4).
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // Paquetes de dominio puro: sin UI, sin plataforma, sin reloj ni azar implícitos.
  {
    files: [
      'packages/numbers-engine/src/**/*.ts',
      'packages/game-engine/src/**/*.ts',
      'packages/words-engine/src/**/*.ts',
    ],
    ignores: ['**/*.test.ts', '**/test-helpers.ts'],
    languageOptions: { globals: { ...globals.es2021 } },
    rules: {
      'no-restricted-imports': ['error', { patterns: FORBIDDEN_IN_PURE_PACKAGES }],
      'no-restricted-globals': [
        'error',
        ...['window', 'document', 'navigator', 'localStorage', 'sessionStorage', 'fetch'].map(
          (name) => ({
            name,
            message: 'El motor no puede usar APIs de navegador ni de plataforma.',
          }),
        ),
      ],
      'no-restricted-properties': [
        'error',
        {
          object: 'Date',
          property: 'now',
          message: 'El tiempo se inyecta (nowMs); el motor no lee el reloj.',
        },
        {
          object: 'Math',
          property: 'random',
          message: 'La aleatoriedad se inyecta (RandomSource semillado).',
        },
        { object: 'performance', property: 'now', message: 'El tiempo se inyecta (nowMs).' },
      ],
      'no-restricted-syntax': [
        'error',
        { selector: "NewExpression[callee.name='Date']", message: 'El tiempo se inyecta (nowMs).' },
      ],
    },
  },
  {
    files: ['packages/design-tokens/src/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: FORBIDDEN_IN_PURE_PACKAGES.slice(0, 3) }],
    },
  },

  // Desactiva reglas de estilo que chocan con Prettier (debe ir al final).
  prettier,
);
