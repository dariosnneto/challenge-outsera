const { execSync, execFileSync } = require('child_process');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const isMock = process.argv.includes('--mock');
const k6Bin = process.platform === 'win32'
  ? 'C:\\Program Files\\k6\\k6.exe'
  : 'k6';
const outputFile = path.resolve(__dirname, '../reports/k6/summary.json');
const projectRoot = path.resolve(__dirname, '..');

function waitForWireMock(retries = 15, delayMs = 1000) {
  const http = require('http');
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      http.get('http://localhost:8080/__admin/health', (res) => {
        if (res.statusCode === 200) return resolve();
        retry();
      }).on('error', retry);
    };
    const retry = () => {
      attempts++;
      if (attempts >= retries) return reject(new Error('WireMock did not start in time'));
      setTimeout(check, delayMs);
    };
    check();
  });
}

async function run() {
  if (isMock) {
    console.log('[mock] Starting WireMock...');
    execSync('docker compose up -d wiremock', { cwd: projectRoot, stdio: 'inherit' });
    try {
      await waitForWireMock();
      console.log('[mock] WireMock ready. Running K6 against http://localhost:8080/api');
      execFileSync(k6Bin, [
        'run',
        '--env', 'BASE_URL=http://localhost:8080/api',
        '--out', `json=${outputFile}`,
        'load-test.ts',
      ], { cwd: __dirname, stdio: 'inherit' });
    } finally {
      console.log('[mock] Stopping WireMock...');
      execSync('docker compose down', { cwd: projectRoot, stdio: 'inherit' });
    }
  } else {
    const apiKey = process.env.REQRES_API_KEY || '';
    execFileSync(k6Bin, [
      'run',
      '--env', `REQRES_API_KEY=${apiKey}`,
      '--out', `json=${outputFile}`,
      'load-test.ts',
    ], { cwd: __dirname, stdio: 'inherit' });
  }
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
