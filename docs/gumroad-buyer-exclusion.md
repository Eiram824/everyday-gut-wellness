# Gumroad buyer exclusion

Status: implemented behind two disabled-by-default gates. No credential, native
workflow, live migration or marketing activation is created by this code.

## Purpose and boundary

The scheduled `gumroad-buyers` function reconciles the two existing paid PDF
products into a permanent `egw-buyer-v1` classification. That tag must **only stop**
the `EGW - Useful Notes - v1` campaign (ID `1234209`), never send an email, enroll a
campaign, remove suppression or grant marketing consent. Requested-guide delivery
keeps its own `gut-reset-lead` tag and rule.

The source is the seller-scoped **production sales collection** `GET /v2/sales`,
filtered by the exact configured product. Its current successful-purchase scope
excludes creator-test orders. The single-sale endpoint does not have that scope,
and the serialized sale does not provide a general `test_purchase:false` field.
Do not replace the collection check with a guessed flag. Refunded and disputed
production buyers remain excluded permanently; refunds never restart promotions.

Primary contract: [Gumroad sales controller](https://raw.githubusercontent.com/antiwork/gumroad/main/app/controllers/api/v2/sales_controller.rb),
[purchase scopes and serialization](https://raw.githubusercontent.com/antiwork/gumroad/main/app/models/purchase.rb).

## Production configuration

| Variable | Required value |
| --- | --- |
| `GUMROAD_ACCESS_TOKEN` | Seller OAuth token with **`view_sales` only**, secret, Production/Functions. No refund, product-edit, payment or payout permission. |
| `GUMROAD_SELLER_ID` | Exact seller ID from the Advanced settings Ping helper or `GET /v2/user` response's `user.user_id`; never substitute a numeric connector ID or `user.id`. The existing `view_sales` grant can read `/v2/user`; do not add a profile scope. |
| `SYSTEME_IO_API_KEY` | Existing protected server key; never `VITE_` or another client prefix. |
| `SYSTEME_IO_BUYER_TAG_ID` | Numeric ID of the dedicated `egw-buyer-v1` tag, different from `SYSTEME_IO_TAG_ID`. |
| `GUMROAD_BUYER_SYNC_ENABLED` | Leave unset/false until the migration and configuration have been checked. |
| `GUMROAD_BUYER_SYNC_READY` | Leave unset/false until native buyer/entry guards and owned-address QA pass. |

Both gates, valid credentials and positive distinct tag IDs are required.
`CONTEXT` must be exactly `production`; Netlify Dev and preview contexts cannot run
the bridge. Guide-delivery activation flags do not activate buyer reconciliation.
Redeploy after environment changes. These settings are server-only and have no
public readiness/data endpoint. No public webhook is introduced.

### Verify the seller OAuth grant before saving the token

Use a dedicated OAuth application and an explicit authorization request with
`scope=view_sales`. Review the consent screen for sales-read access only. The
ordinary **Generate access token** button can issue a broader grant and is not an
approved shortcut for this bridge.

Inspect the granted scope in the token exchange response: normalize its
whitespace-separated `scope` value and require exactly `view_sales`. An omitted,
ambiguous or additional scope is not verified least-privilege access: stop and
resolve the grant rather than installing that token or enabling either gate.
Record only the verified scope names and a pass/fail outcome in release evidence;
never log the access token, refresh token, client secret or authorization code.
A successful sales read alone does not prove the absence of write permissions.

Verify seller identity separately using the exact Advanced settings Ping helper
value, or request `GET /v2/user` privately with the same sales-only token and read
`user.user_id`. Gumroad's API serializes that value differently from `user.id`;
the connector's numeric account identifier is not a substitute. Keep the full
profile response private and do not widen the grant merely for this check.

Primary contracts: [OAuth scope configuration](https://raw.githubusercontent.com/antiwork/gumroad/main/config/initializers/doorkeeper.rb),
[user endpoint authorization](https://raw.githubusercontent.com/antiwork/gumroad/main/app/controllers/api/v2/users_controller.rb),
[user ID serialization](https://raw.githubusercontent.com/antiwork/gumroad/main/app/models/concerns/user/as_json.rb),
and [Advanced settings seller ID](https://raw.githubusercontent.com/antiwork/gumroad/main/app/presenters/settings_presenter.rb).

## Native Systeme.io guard before activation

Inventory existing tags, rules, workflows and plan limits before creating assets.
Reuse one buyer tag and one persistent entered-v1 marker. The existing guide tag,
buyer tag and entered marker must be separate.

The marketing-entry workflow needs to check **buyer status first**, including
when a previously classified buyer later submits the optional native DOI form.
A buyer exits/unsubscribes from campaign `1234209`; a non-buyer proceeds only with
confirmed native consent and a tested entered-v1 guard. Set the permanent entered
marker before campaign enrollment. An API-created contact is not native DOI.
The same exclusion workflow can respond when the buyer tag is newly added, so an
already enrolled reader exits after a purchase. Test reentry and scheduled-task
behavior in the actual account; a design diagram is not proof of those results.

The documented automation action is `unsubscribe_from_campaign`, with
`details.campaignId`. It differs from globally unsubscribing the contact. See the
[official automation API](https://developer.systeme.io/reference/api_automationrules_post)
and [native workflow guidance](https://help.systeme.io/article/1542-workflow-feature).

Preserve buyer and entered markers after sequence completion, refund and dispute.
Keep automatic deletion of buyer contacts off. Deleting a contact or its buyer
tag can remove the native entry guard: before marketing is resumed for a recreated
contact, reconcile its authoritative purchase history/ledger and restore the
classification privately. This release does not claim identity matching across
every address a person could use.

## Durable processing and privacy

Apply `scripts/gumroad-buyer-migration.sql` once to the correct existing project.
It is additive and transaction-wrapped, reapplies without resetting existing data,
and enables/forces RLS on all three new tables. `anon`, `authenticated` and PUBLIC
have no table or RPC privileges; only `service_role` can use the bridge functions.
It does not alter subscribers, consent, admin authentication or the guide queue.

Each invocation reads the **newest collection head**, plus at most **one historical
continuation page** when a cursor exists (at most two GETs and twenty merged sales).
Both reads run in parallel; lifetime catalogue size cannot delay head refresh.
It processes at most **one contact job**, using independent leases. Opaque pagination
is persisted; `next_page_url` is never followed or stored. The outbound origin,
path and query keys are fixed/allowlisted. Only the two pinned product IDs
are accepted, and seller/product mismatches or malformed pages stop progress.
New jobs and the next cursor commit in the same transaction.

Only minimal sale/seller/product identifiers, normalized buyer addresses and job
state are stored privately. Original checkout, current account and gift-recipient
addresses are deduplicated to at most three per sale. No address/custom-field,
license, financial/card, health or full webhook/provider payload is retained.
One job per normalized address across all sales prevents concurrent duplicate
classification. Names and consent are never overwritten; Gmail dots/plus parts
are not rewritten.

The contact is looked up exactly; if absent, only email/locale are created. The
buyer tag is added even to an unsubscribed, bounced or unconfirmed record, because
it is **no-send classification**. Those states are never PATCHed/reset. A
duplicate tag is not removed/re-added. An uncertain tag result is read back; if
unconfirmed, it becomes operator-review work rather than a blind replay. Expired
leases also become reconciliation-only; retries are bounded to five attempts and
honor Retry-After. Logs contain generic codes, not addresses, tokens or bodies.

## Validation and operational limits

Run targeted provider/contract tests, the existing guide tests and TypeScript.
The local PGlite harness `work/verify-gumroad-buyers-sql.cjs` checks actual role
denials, atomic progress, deduplication and lease recovery without live data.
Root release checks must still run the full build/test suite before deployment.

Before setting READY, use the real seller token to confirm both product-scoped
collections are accessible and existing creator tests do not become buyer jobs.
Use an owned test contact to verify that buyer tagging stops campaign enrollment,
later DOI signup does not bypass the buyer guard, suppression flags remain intact,
repeated jobs do not resend anything, and queued actions stop as intended. A
synthetic provider fixture or creator test purchase does not prove real payment,
bank payout or a production buyer transition.

Polling is **not instantaneous**. With the two product scans and a race with the
contact worker, even low-volume exclusion can take roughly fifteen minutes; each
queued contact adds another processing interval. An already-dispatched email can
race a purchase. Processing capacity is twelve classified addresses per hour;
multi-address sales can consume more than one job. Head refresh is limited to the
newest ten sales per selected product, so bursts beyond that depend on historical
progress and backlog. Monitor private pending/failed/uncertain counts and oldest-job
age. Stop new marketing entries and related scheduled campaign tasks if the
bridge is unhealthy; do not expose an uncertain backlog as successful exclusion.
Increase processing capacity only after measurement and another budget/timeout
review. Never reset jobs/tags or restart the list as a recovery shortcut.

Routine private diagnostics need only aggregate counts:

```sql
select status,count(*) from public.gumroad_buyer_scans group by status;
select status,count(*),min(created_at) as oldest from public.gumroad_buyer_jobs group by status;
```

For a stop, set both buyer-sync flags false and redeploy, then stop new native
marketing entries and cancel the related scheduled tasks. Do not delete the
ledger or buyer markers. No buyer email or raw order payload belongs in a public
report, repository, screenshot or error response.
