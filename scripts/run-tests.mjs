import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

// Node's default discovery omits .tsx; explicitly include every project test.
const files = readdirSync('tests', { recursive: true })
  .filter(file => /\.(?:test|spec)\.(?:[cm]?[jt]s|[jt]sx)$/.test(file))
  .map(file => path.join('tests', file)).sort();
if (!files.length) throw new Error('No project tests were discovered.');
const result = spawnSync(process.execPath, ['--import', 'tsx', '--test', ...files], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
