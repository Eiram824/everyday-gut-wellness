# Everyday Gut Wellness — Master Engineering Recovery & Hardening Plan

This document establishes the definitive, non-destructive technical recovery plan for **Everyday Gut Wellness** (`https://everyday-gut-wellness.netlify.app`), incorporating all required enterprise safeguards, migration verifications, serverless architectural realities, and rollback protocols.

---

## 1. Non-Negotiable Core Safeguards & Guarantees

1. **Zero Data Destruction & Preservation of Assets**: All website design, branding, articles, illustrations, downloadable PDFs (`The-7-Day-Gentle-Gut-Reset-Guide.pdf`), and GA4 tracking (`G-JE9KCKNQ54`) remain strictly intact.
2. **Transparent Verification Standard**:
   * Local unit/integration tests are reported separately from live production verification.
   * A service without configured credentials will be marked **`BLOCKED (Awaiting Credentials)`**, never falsely marked as working.
3. **Database-First Ingestion**: Database persistence must succeed before any success confirmation is displayed to the user. A subsequent third-party failure (such as Sender.net) will never fail the user's primary download or cause duplicate records.
4. **Serverless Rate Limiting Honesty**: In-memory rate limiting does not persist across isolated serverless lambda invocations. Persistent rate limiting will be implemented via a dedicated Supabase audit table (`admin_auth_attempts`). If Supabase credentials are not configured, the architectural limitation will be explicitly reported rather than falsely claiming complete protection.
5. **SSRF Redirect Hardening**: Video download endpoints will inspect both the initial URL and any HTTP redirects (`redirect: 'manual'`) against a strict domain allowlist before streaming bytes.
6. **No Production Deployment Without Approval**: All changes remain local to the development preview and automated test suite until final owner review and approval.

---

## 2. Existing Data Audit, Migration & Rollback Protocol

### A. Current Data Storage Inspection
* **File Inspected**: `data/subscribers.json`
* **Current Contents**: Contains 2 synthetic test records (`wellness.tester@example.com` and `duplicate@example.com`) generated during automated test runs. No unbacked production subscriber data is currently stored in this file.
* **Pre-Migration Backup Protocol**:
  1. Before executing any migration, an immutable timestamped snapshot will be saved to:  
     `data/backups/subscribers_pre_migration_<timestamp>.json`
  2. The original `data/subscribers.json` will **never be deleted**. It will be retained in read-only archive mode.

### B. Idempotent Migration Script (`scripts/migrate-subscribers.ts`)
* **Email Normalization**: Lowercases and trims all email strings, validating against RFC 5322 regex.
* **De-duplication**: Uses SQL `ON CONFLICT (email) DO UPDATE` to preserve the original `signup_date` while updating consent history only if a newer timestamp exists.
* **Integrity Gate**: The migration script calculates pre-migration record count vs. post-migration database count. If counts or checksums mismatch, the script halts and triggers a rollback notice.

### C. Formal Rollback Procedure
* **Database Rollback**:
  * If Supabase persistence encounters unexpected failures, an environment toggle `STORAGE_BACKEND=local` allows immediate reversion to the local file adapter without redeploying code.
* **Application Rollback**:
  * Pristine snapshots are retained at `/.stage0_backup_1eca53b/` and in Git commit `1eca53b`.
  * Rollback can be executed in seconds via `cp -r /.stage0_backup_1eca53b/* .` and running `npm test`.

---

## 3. Persistent Serverless Database Architecture (Supabase PostgreSQL)

### A. Production Table Schema & RLS Policies (`scripts/supabase-schema.sql`)
```sql
-- Everyday Gut Wellness: Production Schema with Rate Limiting & Audit History
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Subscribers Table
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(80) NOT NULL DEFAULT 'Reader',
    email VARCHAR(254) NOT NULL,
    signup_date TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    source VARCHAR(60) NOT NULL DEFAULT 'ebook_lead_modal',
    marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
    consent_date TIMESTAMPTZ,
    consent_withdrawn_at TIMESTAMPTZ,
    sender_synced BOOLEAN NOT NULL DEFAULT FALSE,
    sender_synced_at TIMESTAMPTZ,
    sender_sync_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- Email uniqueness enforced via lowercase functional index
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscribers_email_lower ON public.subscribers (LOWER(TRIM(email)));
CREATE INDEX IF NOT EXISTS idx_subscribers_consent ON public.subscribers (marketing_consent) WHERE marketing_consent = TRUE;
CREATE INDEX IF NOT EXISTS idx_subscribers_signup_date ON public.subscribers (signup_date DESC);

-- Automated Timestamp Trigger
CREATE OR REPLACE FUNCTION update_subscribers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_subscribers_updated_at ON public.subscribers;
CREATE TRIGGER trg_subscribers_updated_at
BEFORE UPDATE ON public.subscribers
FOR EACH ROW EXECUTE FUNCTION update_subscribers_updated_at();

-- 2. Serverless Rate Limiting Table (Shared across all Netlify instances)
CREATE TABLE IF NOT EXISTS public.admin_auth_attempts (
    id BIGSERIAL PRIMARY KEY,
    ip_hash VARCHAR(64) NOT NULL,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    success BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_auth_attempts_lookup ON public.admin_auth_attempts (ip_hash, attempted_at DESC);

-- Automated cleanup of auth attempts older than 24 hours
CREATE OR REPLACE FUNCTION purge_old_auth_attempts()
RETURNS void AS $$
BEGIN
    DELETE FROM public.admin_auth_attempts WHERE attempted_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- 3. Security: Row Level Security (RLS)
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_auth_attempts ENABLE ROW LEVEL SECURITY;

-- Block public anon access completely. Only service_role (serverless backend) is permitted.
CREATE POLICY "Deny public anon access to subscribers"
ON public.subscribers FOR ALL TO anon USING (false) WITH CHECK (false);

CREATE POLICY "Allow service_role full access to subscribers"
ON public.subscribers FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Deny public anon access to auth attempts"
ON public.admin_auth_attempts FOR ALL TO anon USING (false) WITH CHECK (false);

CREATE POLICY "Allow service_role full access to auth attempts"
ON public.admin_auth_attempts FOR ALL TO service_role USING (true) WITH CHECK (true);
```

### B. Setup Instructions for the Website Owner
1. **Create Project**: Sign in to [Supabase](https://supabase.com) and create a project named `everyday-gut-wellness` (Region: US East or nearest your audience).
2. **Execute SQL**: Navigate to the **SQL Editor**, paste the SQL above, and click **Run**.
3. **Retrieve Credentials**: Under **Project Settings > API**, copy the `Project URL` and the secret `service_role` key (do not use the public `anon` key).
4. **Set Netlify Variables**: In your Netlify dashboard (*Site configuration > Environment variables*), add:
   * `SUPABASE_URL`: Your Project URL
   * `SUPABASE_SERVICE_ROLE_KEY`: Your secret service-role key

---

## 4. Phase-by-Phase Implementation Sequence

### Phase 1: Database Adapter, Pre-Migration Backup & Rate Limiting Engine
* **Tasks**:
  * Install `@supabase/supabase-js`.
  * Create `scripts/supabase-schema.sql` and `scripts/migrate-subscribers.ts`.
  * Build `netlify/functions/lib/db.ts` with connection pooling, health checks, and fail-closed handling.
  * Build `netlify/functions/lib/rate-limit.ts` using Supabase `admin_auth_attempts` (falling back to memory rate limiting in local test mode, reporting limitations clearly if DB is unconfigured).
* **Testing Gate**: Local unit tests pass; reports `BLOCKED` for live database verification until owner provides keys.

### Phase 2: Lead Capture Hardening & Consent Lifecycle
* **Tasks**:
  * Update `components/LeadCaptureModal.tsx`: Permanently delete lines 130–158 (`localStorage` success fallback). If server responds with an error, display an honest, supportive error message requesting a retry.
  * Update `netlify/functions/subscribe.ts`:
    1. Validate and normalize email.
    2. Write to Supabase first (`subscribers` table).
    3. Return `{ success: true }` only after database confirms persistence.
  * Create `netlify/functions/unsubscribe.ts`: Endpoint enabling users to withdraw marketing consent (`marketing_consent = false`, `consent_withdrawn_at = NOW()`).
* **Testing Gate**: Validate email formatting, duplicate handling, database-first ordering, and consent withdrawal.

### Phase 3: Sender.net Reliability & Non-Blocking Sync
* **Tasks**:
  * Update `subscribe.ts` synchronization workflow:
    1. If `marketing_consent === false`: Skip Sender.net marketing list sync entirely; record `sender_synced = false`.
    2. If `marketing_consent === true`: Attempt dispatch to Sender.net v2 API.
    3. If Sender.net fails (timeout or 5xx): Log error securely without exposing subscriber PII, update `sender_sync_error` in Supabase, and **still return success to the user** so they receive their guide download without disruption.
* **Testing Gate**: Test consent true/false branching and verify that simulated Sender.net outages do not block lead downloads.

### Phase 4: Admin Dashboard & CSV Security
* **Tasks**:
  * Update `components/LeadAdminModal.tsx`: Remove `localStorage.getItem('all_gut_subscribers')`. Display live database status.
  * Update `netlify/functions/admin-verify.ts`: Integrate serverless rate limiting (lockout after 5 failed attempts in 15 minutes).
  * Update `netlify/functions/leads-export.ts`: Retrieve records directly from Supabase; escape CSV cells to prevent formula injection (`=`, `+`, `-`, `@`).
* **Testing Gate**: Verify header authentication, brute-force lockout, and CSV escaping.

### Phase 5: Gemini API Hardening & SSRF Redirect Prevention
* **Tasks**:
  * Update `netlify/functions/gemini.ts`: Set 1MB body limit and 25s timeout.
  * In `/api/video-download`: Inspect initial URL and all subsequent redirect locations (`redirect: 'manual'`) against the Google allowlist (`generativelanguage.googleapis.com`, `storage.googleapis.com`, `lh3.googleusercontent.com`).
* **Testing Gate**: Test payload rejection over 1MB and rejection of untrusted hosts and malicious redirect chains.

### Phase 6: Product Structured Data, Clean Sitemap & Robots.txt
* **Tasks**:
  * Update `components/ProductSection.tsx`: Show *"Available Soon on Gumroad · Priority Waitlist"* badge when `VITE_GUMROAD_PRODUCT_URL` is empty.
  * Update `index.html`: Align canonical URLs to `https://everyday-gut-wellness.netlify.app`. **Update Schema.org availability to `https://schema.org/OutOfStock`** (strictly complying with search guidelines that an unreleased product must not claim `InStock` or `PreOrder` without active ordering).
  * Update `public/robots.txt`:
    ```
    User-agent: *
    Allow: /
    Disallow: /api/
    Sitemap: https://everyday-gut-wellness.netlify.app/sitemap.xml
    ```
  * Update `public/sitemap.xml`: Remove all `#hash` fragment entries; include only valid crawlable URLs.
* **Testing Gate**: Validate Schema.org JSON-LD syntax and sitemap XML compliance.

### Phase 7: Production CSS Bundling
* **Tasks**:
  * Remove `<script src="https://cdn.tailwindcss.com"></script>` from `index.html`.
  * Compile Tailwind CSS via Vite build pipeline into production assets.
* **Testing Gate**: Run `npm run build` and verify pixel-perfect layout preservation and zero console warnings.

---

## 5. File Modification Inventory

| File Path | Action | Safety & Integrity Rationale |
| :--- | :--- | :--- |
| `scripts/supabase-schema.sql` | **New** | Authoritative database schema with RLS and rate-limiting tables. |
| `scripts/migrate-subscribers.ts` | **New** | Idempotent migration script with count verification and backup checks. |
| `netlify/functions/lib/db.ts` | **New** | Serverless Supabase client with fail-closed error handling. |
| `netlify/functions/lib/rate-limit.ts` | **New** | Serverless persistent rate limiting with clear status reporting. |
| `netlify/functions/lib/subscribers.ts` | **Modify** | Supabase query layer with PII log sanitization. |
| `netlify/functions/subscribe.ts` | **Modify** | Enforces database persistence before returning success. |
| `netlify/functions/unsubscribe.ts` | **New** | Endpoint for explicit marketing consent withdrawal. |
| `netlify/functions/admin-verify.ts` | **Modify** | Integrates persistent rate limiting against brute-force attacks. |
| `netlify/functions/leads.ts` | **Modify** | Reads verified subscriber lists directly from Supabase. |
| `netlify/functions/leads-export.ts` | **Modify** | Exports Supabase records with RFC CSV formula escaping. |
| `netlify/functions/gemini.ts` | **Modify** | Adds payload limits and SSRF redirect defense. |
| `components/LeadCaptureModal.tsx` | **Modify** | Removes deceptive `localStorage` fallback. Displays honest server error on network failure. |
| `components/LeadAdminModal.tsx` | **Modify** | Removes `localStorage` fallback; shows live database status. |
| `components/ProductSection.tsx` | **Modify** | Renders "Available Soon on Gumroad" badge when checkout link is unconfigured. |
| `index.html` | **Modify** | Sets canonical domain, updates Schema.org to OutOfStock, removes dev Tailwind CDN. |
| `public/robots.txt` | **Modify** | Protects `/api/` from crawlers without affecting public routes. |
| `public/sitemap.xml` | **Modify** | Removes `#hash` fragments; aligns URLs to Netlify domain. |
| `package.json` | **Modify** | Adds `@supabase/supabase-js`. |
| `tests/database.test.ts` | **New** | Automated tests for database client, schema validation, and fail-closed logic. |

---

## 6. Verification Status Matrix Format

After each phase, progress will be reported using this exact structure:

| Area | Status | Evidence / Verification Notes |
| :--- | :--- | :--- |
| Subscriber Database | `NOT TESTED` | Will execute unit tests & connection check upon Phase 1 completion. |
| Lead Capture | `NOT TESTED` | Will test RFC validation & honest error handling upon Phase 2 completion. |
| Sender.net | `NOT TESTED` | Will test consent isolation upon Phase 3 completion. |
| Admin Security | `NOT TESTED` | Will test rate limiting & header auth upon Phase 4 completion. |
| Gemini API | `NOT TESTED` | Will test SSRF blocking upon Phase 5 completion. |
| Gumroad | `NOT TESTED` | Will test badge display upon Phase 6 completion. |
| SEO & Canonical | `NOT TESTED` | Will test sitemap XML & Schema.org JSON-LD upon Phase 6 completion. |
| Performance & CSS | `NOT TESTED` | Will test production CSS bundle upon Phase 7 completion. |
| Production Build | `NOT TESTED` | Will run `npm run build` and `tsc --noEmit`. |
| Deployment | `NOT TESTED` | Held until final user approval. |

---

## 7. Next Action Requiring Owner Approval

Please review this finalized plan. Upon your confirmation, we will execute **Phase 1 (Database Adapter, Pre-Migration Backup & Rate Limiting Engine)** and report immediate test results.
