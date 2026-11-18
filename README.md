# Everyday Gut Wellness

An evidence-informed, practical digital wellness publication and digital product storefront dedicated to digestive health education, daily motility habits, gentle fiber diversity, and mindful routine tracking.

Website: [https://everyday-gut-wellness.netlify.app](https://everyday-gut-wellness.netlify.app)  
GitHub Repository: [https://github.com/Eiram824/everyday-gut-wellness](https://github.com/Eiram824/everyday-gut-wellness)

---

## Overview

**Everyday Gut Wellness** is designed for adults seeking sustainable, non-prescriptive, and hype-free guidance for bowel regularity. The platform provides:

1. **Evidence-Informed Educational Guide**: Physiology of transit, soluble vs. insoluble fiber balance, gastrocolic reflex, and toilet ergonomics.
2. **Free Lead Magnet (The 7-Day Gentle Gut Reset Guide)**:
   - High-fidelity 8-page printable PDF automatically generated at build time using `pdf-lib`.
   - Fullscreen interactive in-app reader with page flipping, print mode, and direct PDF download.
   - Responsible lead capture requiring explicit voluntary consent for marketing communications.
3. **Original Digital Product (The 14-Day Gut Clarity Workbook)**:
   - 26-page printable US Letter PDF with daily observation logs, a midpoint and final review, safety guidance, and clinician-prep pages.
   - $25 USD through Gumroad checkout; the checkout URL is a public constant in `constants.ts` and is not a secret.
   - Educational use only; it does not provide medical advice, diagnosis, or treatment.
4. **Creator & Lead Management Hub**:
   - Protected admin modal (`Ctrl+Shift+L` or `#admin` URL hash).
   - Real-time subscriber stats and RFC-compliant CSV export (`/api/leads/export.csv`).
   - Optional Sender.net email marketing integration.
5. **Netlify Deployment**:
   - Static React/Vite site with serverless functions in `netlify/functions`.
   - Subscriber records are stored in Supabase when production secrets are configured.
   - GitHub Pages workflow remains available for the separate static docs build.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS, Lucide React icons.
- **Backend / Dev Server**: Netlify Functions for production APIs; Node.js 20+, Express 4, tsx for local development.
- **Data**: Supabase PostgREST with server-side-only secret key.
- **PDF Generation Engine**: `pdf-lib` (pure JavaScript, zero system binary dependencies).
- **Testing**: Node.js native test runner (`node --import tsx --test`).
- **Hosting**: Netlify connected to the GitHub repository.

---

## Quick Start & Local Setup

### Prerequisites
- Node.js version 20.x or 22.x
- npm version 9.x or later

### Installation

```bash
# 1. Clone repository
git clone https://github.com/Eiram824/everyday-gut-wellness.git
cd everyday-gut-wellness

# 2. Clean install dependencies
npm ci

# 3. Configure environment variables (optional for local dev)
cp .env.example .env
```

### Development Server

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Build & Validation Commands

| Command | Description |
| :--- | :--- |
| `npm run typecheck` | Validates TypeScript with zero type errors (`tsc --noEmit`). |
| `npm test` | Runs the automated test suite across constants, lead flows, and PDF generation. |
| `npm run build` | Generates the 7-day reset PDF, builds production client assets, and bundles `server.ts`. |
| `npm run build:client` | Generates the PDF and builds the Vite frontend static bundle (`dist/`). |
| `npm start` | Starts the production Express server serving `dist/`. |

---

## Environment Configuration

Configure environment variables in `.env` (refer to `.env.example`):

- Gumroad checkout URL and public product metadata: `constants.ts` (`GUT_CLARITY_PRODUCT`).
- `ADMIN_ACCESS_KEY`: Secret key for the private lead dashboard and CSV export. Set it as a secret in Netlify for both Production and Deploy Preview; administrative routes fail closed if it is missing.
- `SENDER_API_TOKEN`: Optional API token for Sender.net synchronization.
- `SENDER_GROUP_ID`: Optional Sender.net subscriber group tag.
- `GEMINI_API_KEY`: Required only for server-side Google GenAI proxy endpoints.

---

## Security & Privacy Standards

- **Open Source Safety**: Live subscriber data (`data/subscribers.json`) and private API tokens (`data/sender_config.json`) are strictly excluded via `.gitignore` to prevent data leakage in public repositories.
- **Admin Route Protection**: Backend routes (`/api/leads`, `/api/leads/export.csv`, `/api/admin/verify`) strictly require header-based authentication (`x-admin-key` or `Authorization: Bearer <key>`). URL query parameter authentication is disabled to prevent credential leakage in access logs, referrers, and browser histories.
- **GDPR & CAN-SPAM Compliance**: Transactional guide delivery is strictly decoupled from promotional marketing. Users can access the free guide without consenting to ongoing marketing emails.
- **No Affiliate Code**: All ClickBank, BellyFlush, and third-party affiliate scripts have been permanently purged.

---

## License

Apache-2.0 License.
