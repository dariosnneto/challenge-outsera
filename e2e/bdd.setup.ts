import { execSync } from 'child_process';

export default async function globalSetup() {
  execSync('npx bddgen', { stdio: 'inherit', cwd: process.cwd() });
}
