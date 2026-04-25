const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const RESULTS = path.join(__dirname, 'reports', 'allure-results');
const HTML    = path.join(__dirname, 'reports', 'allure-html');
const HISTORY = path.join(__dirname, 'reports', 'allure-history');
const KEEP    = 2;

// Rotate history: keep only the last KEEP runs
if (fs.existsSync(HISTORY)) {
  const runs = fs.readdirSync(HISTORY)
    .filter(f => fs.statSync(path.join(HISTORY, f)).isDirectory())
    .sort()
    .reverse();
  runs.slice(KEEP).forEach(run => fs.rmSync(path.join(HISTORY, run), { recursive: true, force: true }));
}

// Copy previous history into results so Allure picks it up
const historyInResults = path.join(RESULTS, 'history');
const historySource    = path.join(HTML, 'history');
if (fs.existsSync(historySource)) {
  fs.cpSync(historySource, historyInResults, { recursive: true });
}

// Fix scenarios with stage=pending and no status (bug in @wdio/allure-reporter v9 + Cucumber)
// Infer scenario status from its steps: all passed → passed, any failed/broken → failed
const resultFiles = fs.readdirSync(RESULTS).filter(f => f.endsWith('-result.json'));
for (const file of resultFiles) {
  const filePath = path.join(RESULTS, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  if (data.stage === 'pending' && !data.status) {
    const stepStatuses = (data.steps || []).map(s => s.status);
    const hasFailed = stepStatuses.some(s => s === 'failed' || s === 'broken');
    data.status = hasFailed ? 'failed' : 'passed';
    data.stage = 'finished';
    data.stop = data.stop || Date.now();
    fs.writeFileSync(filePath, JSON.stringify(data));
  }
}

// Generate report
execSync(`npx allure generate "${RESULTS}" --clean -o "${HTML}"`, { stdio: 'inherit', cwd: ROOT });

// Save this run's history for next time
if (fs.existsSync(path.join(HTML, 'history'))) {
  const runDir = path.join(HISTORY, new Date().toISOString().replace(/[:.]/g, '-'));
  fs.mkdirSync(runDir, { recursive: true });
  fs.cpSync(path.join(HTML, 'history'), runDir, { recursive: true });
}

console.log('Allure report generated at mobile/reports/allure-html');
