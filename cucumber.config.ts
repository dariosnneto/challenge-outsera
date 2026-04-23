// Cucumber configuration loaded via the --config flag or cucumber.js / .cucumber.js discovery.
// playwright-bdd generates Playwright spec files from .feature files; this config governs
// the pure Cucumber run (npm run test:e2e) which uses ts-node to transpile on the fly.

const config = {
  default: {
    paths: ['e2e/features/**/*.feature'],
    require: ['e2e/steps/**/*.ts', 'e2e/support/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: [
      'html:reports/cucumber-report.html',
      'json:reports/cucumber-results.json',
      'progress-bar',
    ],
    publishQuiet: true,
  },
};

export default config;
