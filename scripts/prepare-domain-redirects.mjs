import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function customDomainRedirects(environment) {
  // Enable only after both custom-domain names have valid DNS and HTTPS.
  // The platform hostname remains an infrastructure reference, never a canonical.
  if (environment.CONTEXT !== 'production' || environment.CUSTOM_DOMAIN_REDIRECTS_ENABLED !== 'true') return '';
  return 'https://everyday-gut-wellness.netlify.app/* https://everydaygutwellness.com/:splat 301!\n';
}

export async function writeDomainRedirects(directory, environment = process.env) {
  const redirects = customDomainRedirects(environment);
  await writeFile(resolve(directory, '_redirects'), redirects, 'utf8');
  return redirects;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const redirects = await writeDomainRedirects(resolve('dist'));
  console.log(redirects ? 'Custom-domain redirect enabled for production.' : 'Custom-domain redirect withheld pending DNS/HTTPS verification.');
}
