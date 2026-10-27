import { defineConfig } from 'vitest/config';

// Solo lógica pura de la app (formato, resúmenes). La UI se verifica con Playwright (e2e/).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
