import { defineConfig, devices } from '@playwright/test';
import { defineBddProject } from 'playwright-bdd';
import * as dotenv from 'dotenv';

dotenv.config();

const e2eProject = defineBddProject({
  name: 'e2e',
  features: 'e2e/features/**/*.feature',
  steps: ['e2e/steps/**/*.ts'],
});

const apiBddProject = defineBddProject({
  name: 'api',
  features: 'api/features/**/*.feature',
  steps: ['api/steps/**/*.ts'],
});

export default defineConfig({
  testDir: './',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  globalSetup: './e2e/bdd.setup.ts',
  reporter: [
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['json', { outputFile: 'reports/results.json' }],
    ['list'],
  ],
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      ...apiBddProject,
      timeout: 30_000,
      use: {
        baseURL: process.env.BASE_URL_API || 'https://reqres.in',
        extraHTTPHeaders: {
          'Accept': 'application/json',
          ...(process.env.REQRES_API_KEY
            ? { 'x-api-key': process.env.REQRES_API_KEY }
            : {}),
        },
      },
    },
    {
      ...e2eProject,
      timeout: 60_000,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.BASE_URL_E2E || 'https://www.saucedemo.com',
        headless: !!process.env.CI,
      },
    },
  ],
});
