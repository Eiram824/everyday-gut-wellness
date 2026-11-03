# Everyday Gut Wellness

An evidence-informed, practical digital wellness publication and digital product storefront dedicated to digestive health education, daily motility habits, gentle fiber diversity, and mindful routine tracking.

Official Live Applet: [https://ai.studio/apps/bd172229-cd7a-4f89-877d-6c41ba6a4b4e](https://ai.studio/apps/bd172229-cd7a-4f89-877d-6c41ba6a4b4e)  
GitHub Repository: [https://github.com/Eiram824/everyday-gut-wellness](https://github.com/Eiram824/everyday-gut-wellness)

---

## Overview

**Everyday Gut Wellness** is designed for adults seeking sustainable, non-prescriptive, and hype-free guidance for bowel regularity. The platform provides:

1. **Evidence-Informed Educational Guide**: Physiology of transit, soluble vs. insoluble fiber balance, gastrocolic reflex, and toilet ergonomics.
2. **Free Lead Magnet (The 7-Day Gentle Gut Reset Guide)**:
   - High-fidelity 8-page printable PDF automatically generated at build time using `pdf-lib`.
   - Fullscreen interactive in-app reader with page flipping, print mode, and direct PDF download.
   - Responsible lead capture requiring explicit voluntary consent for marketing communications.
3. **Original Digital Product Showcase (The 30-Day Digestive Wellness Planner)**:
   - 68-page printable and tablet-fillable habit workbook ($14.99).
   - Direct Gumroad checkout integration via `VITE_GUMROAD_PRODUCT_URL`.
   - Safe fallback: if the Gumroad URL is not yet configured, the button gracefully switches to a waitlist notification flow without 404 errors.
4. **Creator & Lead Management Hub**:
   - Protected admin modal (`Ctrl+Shift+L` or `#admin` URL hash).
   - Real-time subscriber stats and RFC-compliant CSV export (`/api/leads/export.csv`).
   - Optional Sender.net email marketing integration.
5. **Robust CI/CD & Static Deployment**:
   - Automated TypeScript type checking (`tsc --noEmit`).
   - Built-in automated test suite (`npm test`).
   - Seamless GitHub Pages deployment via `.github/workflows/deploy.yml`.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS, Lucide React icons.
- **Backend / Dev Server**: Node.js 20+, Express 4, tsx.
- **PDF Generation Engine**: `pdf-lib` (pure JavaScript, zero system binary dependencies).
- **Testing**: Node.js native test runner (`node --import tsx --test`).
- **CI/CD**: GitHub Actions deploying to GitHub Pages.

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

- `VITE_GUMROAD_PRODUCT_URL`: The public Gumroad checkout link for the 30-Day Planner.
- `ADMIN_ACCESS_KEY`: Secret key required to access `/api/leads` and download CSV exports (defaults to `gutwellness_admin_2026` if unset).
- `SENDER_API_TOKEN`: Optional API token for Sender.net synchronization.
- `SENDER_GROUP_ID`: Optional Sender.net subscriber group tag.
- `GEMINI_API_KEY`: Required only for server-side Google GenAI proxy endpoints.

---

## Security & Privacy Standards

- **Open Source Safety**: Live subscriber data (`data/subscribers.json`) and private API tokens (`data/sender_config.json`) are strictly excluded via `.gitignore` to prevent data leakage in public repositories.
- **Admin Route Protection**: Backend routes (`/api/leads`, `/api/leads/export.csv`, `/api/admin/verify`) require authentication via header (`x-admin-key`, `Authorization: Bearer <key>`) or query parameter (`?key=<key>`).
- **GDPR & CAN-SPAM Compliance**: Transactional guide delivery is strictly decoupled from promotional marketing. Users can access the free guide without consenting to ongoing marketing emails.
- **No Affiliate Code**: All ClickBank, BellyFlush, and third-party affiliate scripts have been permanently purged.

---

## License

Apache-2.0 License.
