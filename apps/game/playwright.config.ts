import { defineConfig } from '@playwright/test';

const PORT = 8099;

/**
 * E2E web (CLY-015/017). En local usa el Edge/Chrome instalado (`channel`) para no descargar
 * navegadores; en CI usa el Chromium de Playwright (`playwright install chromium`).
 * Solo prueba web: iOS y Android NO quedan cubiertos por estos tests.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    ...(process.env.CI ? {} : { channel: 'msedge' }),
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 } } },
    { name: 'phone', use: { viewport: { width: 390, height: 844 }, hasTouch: true } },
  ],
  webServer: {
    command: `pnpm exec expo start --web --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    env: { CI: '1' },
  },
});
