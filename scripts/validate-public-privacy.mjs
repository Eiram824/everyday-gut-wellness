import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('dist');
const checks = [
  /sb_secret_[a-z0-9_]{10,}/i,
  /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/,
  /ADMIN_ACCESS_KEY|SUPABASE_SERVICE_ROLE_KEY|SENDER_API_TOKEN|SYSTEME_IO_API_KEY|GEMINI_API_KEY/,
  /\/api\/(?:admin|leads)|#admin|admin=true/,
];
const secrets = ['ADMIN_ACCESS_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'SENDER_API_TOKEN', 'SYSTEME_IO_API_KEY', 'GEMINI_API_KEY'].map(key => process.env[key]).filter(value => value && value.length > 8);
let checked = 0;
async function scan(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) { await scan(file); continue; }
    if (entry.name.startsWith('.env')) throw new Error('Environment file reached public output.');
    if (!/\.(?:js|html|map)$/.test(entry.name)) continue;
    const content = await readFile(file, 'utf8');
    if (checks.some(pattern => pattern.test(content)) || secrets.some(value => content.includes(value))) {
      // Only print the filename, never the detected secret or its surroundings.
      throw new Error(`Private credential or admin implementation found in ${path.relative(root, file)}.`);
    }
    checked++;
  }
}
await scan(root);
console.log(`Public privacy validation passed: ${checked} HTML/JavaScript files; no admin implementation or secret detected.`);
