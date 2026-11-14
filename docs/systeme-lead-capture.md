# Requested-guide email integration

Status: implemented and locally tested. The additive queue migration was applied to the existing production Supabase project on November 14, 2026; live read-only checks confirmed RLS, denied public table/RPC access, allowed service-role execution and zero historical jobs. Production email activation still awaits DNS, sender verification, a private API key and a tested delivery rule.

## Netlify production variables

Set these in Project configuration → Environment variables. Secret values belong in the **Functions** scope and **Production** context; never prefix them with `VITE_`. If the plan only offers all scopes, the unprefixed API key must still remain server-only. Do not paste keys into chat, a PR, or a DNS record.

| Name | Value | When to set |
| --- | --- | --- |
| `SYSTEME_IO_API_KEY` | Private Systeme.io Public API key | Enter directly into Netlify; mark secret |
| `SYSTEME_IO_TAG_ID` | Numeric ID of `gut-reset-lead` | Copy from the actual tag; the tag name is not an API ID |
| `SYSTEME_IO_ENABLED` | `false` initially | Switch to `true` after migration and sender setup |
| `SYSTEME_IO_GUIDE_DELIVERY_READY` | `false` initially | Switch to `true` only after the exact delivery rule has passed a test |
| `SYSTEME_IO_MARKETING_OPT_IN_URL` | Optional verified native Systeme.io double-opt-in form URL | Leave blank until that separate series is ready |
| `CUSTOM_DOMAIN_REDIRECTS_ENABLED` | `false` initially; build scope | Enable only after apex and www DNS/TLS work; production context only |

Keep the existing `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_ACCESS_KEY` private and intact. Redeploy after runtime-variable changes. The new API key authenticates server calls using `X-API-Key`; it is not sent to the browser. [Systeme.io Public API](https://developer.systeme.io/reference/api)

Explicit preview/development contexts and Netlify Dev disable fulfillment even when the other flags are set. Use production-scoped values as the primary protection. A local test with an undefined deployment context must use mocks, not live credentials.

## Systeme.io setup

1. Confirm that the correct account contains a tag named **`gut-reset-lead`**. Reuse the tag if it already exists. Do not remove and recreate a tag to obtain a new ID.
2. Its only automation is requested-guide fulfillment: **Tag added → send one delivery-only email**. Use the guide-delivery copy and the public file URL `https://everydaygutwellness.com/The-7-Day-Gentle-Gut-Reset-Guide.pdf`. Do not attach a promotional campaign, another tag-triggered sender, or a second delivery action to the same tag.
3. Authenticate the domain and verify `hello@everydaygutwellness.com` after its forwarding works. Confirm a monitored Reply-To and the actual sender displayed by the delivery rule.
4. Keep the rule inactive while preparing it. Test it with an owned test address after configuration, then inspect actual delivery and headers. Only then assert `SYSTEME_IO_GUIDE_DELIVERY_READY=true` and redeploy.
5. The optional seven-email marketing series has a separate native form and native double opt-in. A website guide request, API-created contact or fulfillment tag is **not** confirmed marketing consent. [Native double opt-in](https://help.systeme.io/article/271-how-to-set-up-double-opt-in)

The current direct Gumroad checkout and receipts continue to provide the paid PDFs. No purchase, refund or buyer-suppression bridge is introduced by this guide-delivery integration. Keep the complete sales-nurture v1 inactive until its separate buyer-exclusion checks pass.

## Apply the database migration before activation

The existing subscriber table remains the private request store. **`scripts/systeme-io-migration.sql`** has already been applied to this production project; there is no need to reset or recreate its data. For another installation, apply the delta to its correct Supabase project before enabling either integration flag. Never paste a service-role key into SQL.

The delta adds `systeme_guide_jobs` and three service-role-only functions. It is transaction-wrapped and idempotent. It neither deletes subscriber data nor queues old records. Public `anon`/`authenticated` roles have neither table access nor RPC execution. Existing names and consent are not overwritten by repeat submissions.

The base schema's existing subscriber-update trigger delimiter was corrected so a new installation can execute the schema. Existing installations need only the delta for this feature; no destructive reset is required.

## Request and retry behavior

- `GET /api/subscribe` returns only `guideEmailAvailable` and the optional validated `marketingSignupUrl`. It performs no subscriber read and exposes no key or tag ID.
- The form offers an email-copy request only when configuration reports it available. Otherwise it offers immediate PDF access. Every guide remains accessible without joining marketing.
- `POST /api/subscribe` requires a valid normalized email. Fulfillment additionally requires an explicit `emailGuideRequested: true`, the guide source and all activation gates.
- Save and queue are atomic. There is one job per subscriber and guide version. The public request cannot overwrite an existing name, consent or suppression state.
- Contact lookup uses the exact email. Creation sends only email and locale. Suppressed, bounced or unconfirmed contacts remain unchanged; no resubscribe/PATCH or campaign-enrollment call is made.
- An existing fulfillment tag is retained. The code does not remove/re-add it to resend the email.
- The initial request tries one leased job. A scheduled function processes at most one due job every five minutes in UTC. Retries are bounded; rate-limit backoff honors `Retry-After`.
- A tag-request timeout/5xx can mean the provider accepted it. Such a job becomes reconciliation-only. If the tag cannot be confirmed, it stops for operator review rather than blindly adding the tag again.
- The form has bounded configuration/submission waits and ignores stale responses after close/reopen. A stalled provider never justifies promising that a message was delivered.

`queued` means the durable request was accepted, not that an inbox received mail. Public responses intentionally do not expose whether an address is already stored, tagged or suppressed. Other statuses are `not_requested`, `not_configured` and `unavailable`. Direct PDF access survives provider configuration or queue failures after the request is safely stored.

This design reduces duplicate sends; it does not claim exactly-once behavior from an external provider or guarantee inbox placement. Do not create a second campaign/rule for the same fulfillment event.

## Safe operator checks

The job table is private. Aggregate status counts are sufficient for routine diagnostics:

```sql
select status, count(*)
from public.systeme_guide_jobs
group by status
order by status;
```

Investigate `uncertain` and `failed` jobs privately. Do not replay them by deleting jobs or removing/re-adding tags. Check the authoritative provider contact/tag and delivery history first. No new public queue-management endpoint is introduced.

Before live activation, test first signup, repeated/concurrent signup, inherited suppression, duplicate tag, interrupted provider request, unsubscribe, requested-guide-only copy, no marketing enrollment, correct free-file URL, monitored replies and deployment-context isolation. Local mock/embedded-Postgres checks do not establish that these account-level checks have passed.
