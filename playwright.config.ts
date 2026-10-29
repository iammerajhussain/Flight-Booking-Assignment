import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const bddTestDir = defineBddConfig({
  features: 'src/tests/UI/Flight/features/*.feature',
  steps: 'src/tests/UI/Flight/steps/*.ts',
  outputDir: '.features-gen',
});

export default defineConfig({
  testDir: bddTestDir,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['./reporters/console-table-reporter.js'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'https://www.booking.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      testDir: bddTestDir,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'smoke',
      testDir: './shared',
      testMatch: '**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
