const { execSync } = require('child_process');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const apiKey = process.env.REQRES_API_KEY || '';
const k6Bin = process.platform === 'win32'
  ? '"C:\\Program Files\\k6\\k6.exe"'
  : 'k6';

const outputFile = path.resolve(__dirname, '../reports/k6/summary.json');

execSync(
  `${k6Bin} run --env REQRES_API_KEY=${apiKey} --out json="${outputFile}" load-test.ts`,
  { cwd: __dirname, stdio: 'inherit' }
);
