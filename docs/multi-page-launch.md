# Six-page publishing storefront

Revision: November 17, 2026.

The homepage is a focused guide hub. The existing fiber, routine, myth and safety content now has dedicated, pre-rendered routes; the workbook comparison has its own storefront. Real links work without SPA navigation, and hydrated navigation updates the page head and supports browser history. Unknown paths retain a 404 response.

## Routes and metadata

`siteConfig.ts` is the source for the six canonical URLs, exact supplied titles/descriptions/H1s, publisher details, revision date and optional `GUMROAD_BUNDLE_URL`. The supplied exact titles take priority over the conflicting generic 50–58-character suggestion. Character count cannot guarantee how a search engine displays a title.

`scripts/prerender.mjs` renders a separate complete HTML document for each route. `lib/page-seo.ts` supplies route-specific metadata and JSON-LD, shared by prerendering and client navigation. Article and medical pages exclude commerce schema. `/workbooks` describes only the two real $25/$30 products; an unavailable bundle is never represented as an active offer. No review, clinical approval, rating, shipping or return policy is invented.

The original NIDDK, MedlinePlus, AJCN 2022 and AJG 2018 references remain available on `/when-to-seek-care`. The numerical +3 to 5g example is distinguished from NIDDK's general advice to introduce fiber gradually. The publisher card states the creator is not a clinician and that these materials have not been independently reviewed by one.

## Free-guide and consent boundaries

The guide modal opens only after an explicit click. The inline form uses the same submission helper. First name and email are required; both an HTTP-success response and literal `success: true` from the existing `/api/subscribe` handler are required before the reader is unlocked. Pending requests, duplicates, aborted requests and unavailable storage have dedicated regression coverage.

The returning-device preference stores only `{ "accessGranted": true }`, with no contact information or Habit Check answers. It is a user-interface convenience, not server authentication. Existing public PDF URLs remain functional for the existing requested-guide emails. Those URLs can still be opened directly by someone who knows them. The initial anonymous page contains no reader or PDF link, but this implementation does not claim DRM or server-protected file delivery.

Guide requests do not grant marketing consent or enroll anyone in the seven-email series. An optional marketing signup link is displayed only when the backend publishes an allowed HTTPS URL for the separate confirmation flow. This refactor does not activate that campaign, change its sender configuration, or remove suppression states.

## Products and planned bundle

The existing Gumroad listings and $25/$30 prices are retained. Pure-code, clearly labelled illustrative previews show fictional entries and sample layouts; they are not claimed to be exact pages or editable versions of the purchased PDFs. No paid PDF is replaced.

The planned bundle is $39 compared with $55 separately. With `GUMROAD_BUNDLE_URL` empty, the card opens a launch-alert dialog instead of navigating to a dummy URL. The bundle, bonus sheet and checkout are not represented as currently available for purchase.

Bundle-alert permission must be a separate durable event even when an email already exists as a guide subscriber. The additive `/api/bundle-interest` endpoint and `scripts/bundle-interest-migration.sql` provide this isolated capture. Existing subscriber rows and guide queues are not repurposed or updated. Duplicate interest requests do not undo a withdrawal or restart delivery.

Before enabling bundle alerts in production:

1. Review and apply the additive migration to the intended Supabase project.
2. Verify forced RLS, denied PUBLIC/anon/authenticated access, and minimal service-role privileges.
3. Deploy the function and routing, then set server-only Production `BUNDLE_LAUNCH_ALERTS_ENABLED=true` and redeploy.
4. Test one owned address, a duplicate and an existing guide subscriber. Confirm only a bundle-interest row is created and that no email or campaign enrollment occurs.

Leave the flag false until these steps pass. The dialog shows an honest unavailable/contact state while capture is disabled. The endpoint records permission; a future launch send, unsubscribe handling and confirmed campaign setup require their own review. No live migration or external email settings are changed by the local refactor.

## Validation and release

Run `npm test`, `npm run typecheck`, and `npm run build`. The test runner explicitly includes `.test.tsx`, which Node's default test discovery omitted. The build validates all six raw HTML documents, exact metadata, visible/schema FAQ agreement, product links/prices, local links/assets, sitemap, robots and absence of public admin implementation or secrets.

The existing 66-test production baseline remains represented, with route/editorial assertions updated for the new architecture and additional interaction/security regressions. Service requests in automated tests are mocked; no tests write to the live database or send emails.

Per the user's critical addendum, no Chrome control, external browser tools or browser viewport checks are used for this refactor. Local SSR, actual event-handler, focus-lifecycle and API tests establish their stated behavior; they do not certify visual rendering, screen-reader output, live DNS/HTTPS, email delivery, Search Console processing, or measured Core Web Vitals. Record those limits in the PR and final report.

The separate draft buyer-exclusion PR remains separate. Do not enable its buyer synchronization or the native marketing campaign as a side effect of merging this frontend refactor.
