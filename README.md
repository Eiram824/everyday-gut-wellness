# Everyday Gut Wellness

Independent educational publishing at [everydaygutwellness.com](https://everydaygutwellness.com/). General health information and printable planning tools; not medical advice, diagnosis or treatment.

## Application

React and TypeScript with Vite, Tailwind CSS and Netlify Functions. The build renders six complete HTML documents: home, fiber guide, routine reset, myths vs. facts, when to seek care, and workbooks. Real route links and static fallbacks work independently of SPA navigation. Existing legal/support URLs remain available.

The 3-question Habit Check keeps answers in memory. The 6-item routine checklist supports keyboard input. Workbook previews are labelled illustrative sample layouts; the actual paid PDF files are delivered through Gumroad.

## Local development and validation

Install the lockfile dependencies with `npm ci`. Copy `.env.example` to an ignored local environment file only if backend configuration is needed. Keep real credentials out of source, public variables and chat.

```sh
npm run dev
npm test
npm run typecheck
npm run build
```

Tests mock external API requests and include a pinned, in-memory PostgreSQL engine for the new bundle-interest migration. They do not send emails or write live subscriber data. The test runner explicitly includes TypeScript JSX tests instead of silently skipping them.

The production build generates the eight-page guide PDF, client assets, six pre-rendered pages, sitemap/robots and routing. It then validates raw HTML, metadata/schema, internal links/assets and the absence of public admin implementation or credentials. The local Express adapter is also compiled.

## Deployment and safeguards

Netlify uses `npm run build:client`, publishes `dist`, and bundles `netlify/functions`. Production-only flags and secrets belong in Netlify's environment configuration; `VITE_` variables are public. Custom-domain redirect generation preserves API POST routes and the known-page static routing rules. Unknown paths return 404.

The existing guide subscriber, durable requested-guide delivery queue, Systeme.io tagging and server-side admin authentication remain separate from the frontend. Guide access is unlocked only after a verified backend response. The minimal localStorage preference is a device convenience; legacy public PDF URLs remain available for existing email deliveries.

Two live Gumroad listings are retained:

- [14-Day Gut Clarity Workbook](https://eiram32.gumroad.com/l/14-day-gut-clarity-workbook): $25, 26-page printable US Letter PDF.
- [30-Day Gut Routine Planner](https://eiram32.gumroad.com/l/ynisjl): $30, 31-page printable US Letter PDF.

The $39 bundle is planned. An empty `GUMROAD_BUNDLE_URL` renders a launch-alert trigger rather than a fake checkout. Bundle-alert capture is isolated from existing guide subscribers, disabled by default, and requires the reviewed additive migration before its server flag is enabled. It does not send emails or activate marketing.

See [release configuration and limitations](docs/multi-page-launch.md) and the [implementation/validation report](docs/multi-page-implementation-report.md) before production changes. The native marketing campaign and the separate buyer-exclusion draft are not activated by this refactor.
