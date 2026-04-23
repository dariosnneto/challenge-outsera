module.exports = {
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
