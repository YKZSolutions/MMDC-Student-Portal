import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const repoRoot = path.resolve(currentDir, '..');

const databaseCloudUrl = process.env.DATABASE_CLOUD_URL;
const directCloudUrl = process.env.DIRECT_CLOUD_URL;

if (!databaseCloudUrl || !directCloudUrl) {
  console.error(`
Missing required environment variables:

  DATABASE_CLOUD_URL
  DIRECT_CLOUD_URL

PowerShell example:

  $env:DATABASE_CLOUD_URL="..."
  $env:DIRECT_CLOUD_URL="..."
  just docker-build
`);

  process.exit(1);
}

const args = [
  'build',
  '--no-cache',
  '-t',
  'backend',
  '-f',
  'backend/Dockerfile',
  '--build-arg',
  `DATABASE_CLOUD_URL=${databaseCloudUrl}`,
  '--build-arg',
  `DIRECT_CLOUD_URL=${directCloudUrl}`,
  '.',
];

const result = spawnSync('docker', args, {
  cwd: repoRoot,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

process.exit(result.status ?? 1);