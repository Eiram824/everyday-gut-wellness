# Everyday Gut Wellness: DNS and production verification

Prepared: November 14, 2026. Domain: `everydaygutwellness.com`. Registrar and intended authoritative DNS: Porkbun. Website: the existing Netlify project `everyday-gut-wellness`.

This is the configuration checklist. It does not establish that DNS, HTTPS, forwarding, sender authentication, API credentials, or automated email delivery have already been activated. Record actual results in the verification table below.

## Observed state in this task

| Item | Observed state on November 14, 2026 |
| --- | --- |
| Authoritative nameservers | `curitiba.ns.porkbun.com`, `maceio.ns.porkbun.com`, `fortaleza.ns.porkbun.com`, `salvador.ns.porkbun.com` |
| Root web DNS | Parking A records: `207.207.210.23`, `207.207.210.36`, `207.207.210.50` |
| www DNS | CNAME `uixie.porkbun.com` |
| Incoming email MX | `fwd1.porkbun.com` priority 10 and `fwd2.porkbun.com` priority 20 already exist; do not add duplicates |
| Root SPF | `v=spf1 include:_spf.porkbun.com ~all` already exists; preserve it rather than adding a duplicate |
| DMARC | The public `_dmarc` TXT lookup returned no record; recheck before adding one |
| Systeme.io domain | `everydaygutwellness.com` added to the user's account; status **Pending**, exact CNAME values obtained below |
| Netlify domain attachment | Completed in the existing project: `everydaygutwellness.com` is Primary domain; `www.everydaygutwellness.com` redirects to primary; both are **Pending DNS verification** |
| Netlify account DNS instructions | The account's Pending DNS modal confirms `apex-loadbalancer.netlify.com` for root ALIAS/ANAME/flattened CNAME; fallback A `75.2.60.5` |
| HTTPS certificate | Not provisioned yet while the unchanged parking DNS still points away from Netlify |
| Code migration | Custom-domain metadata prepared on the working branch; not reported as live production |
| Porkbun DNS changes | None performed in this task |

Keep the working Porkbun nameservers. The parking web records above are the records to review for replacement, while existing mail records remain intact.

## Para sa may-ari

Panatilihin ang DNS management sa Porkbun. Magkaibang gawain ang website records, incoming email forwarding, at Systeme.io sending authentication. Hindi kailangang ilipat ang nameservers sa Netlify para gawin ang setup na ito.

Unahin ang website DNS at HTTPS, pagkatapos ang `hello@everydaygutwellness.com` forwarding at sender verification. Saka lamang i-enable ang tested email automation. Habang pending ang sender, dapat gumana pa rin ang instant PDF download at walang mensaheng nagsasabing naipadala na ang email.

## 1. Netlify website records

Naidagdag na ang domain sa existing Netlify project. Sa **Domain management → Production domains**, nakita ang `everydaygutwellness.com` bilang **Primary domain** at ang `www.everydaygutwellness.com` bilang redirect papunta rito. Parehong **Pending DNS verification**. Hindi kailangang idagdag ulit ang mga domain.

Nabuksan na ang **Pending DNS verification** at nakumpirma sa mismong account ang root ALIAS target at fallback A value sa ibaba. Kung magbago ang project infrastructure sa hinaharap, basahin muli ang account-specific instructions. [Netlify external DNS](https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/)

### Recommended standard Porkbun records

| Type | Porkbun Host | Answer / Value | Priority | TTL |
| --- | --- | --- | --- | --- |
| ALIAS — CNAME flattening | Leave blank | `apex-loadbalancer.netlify.com` | Not applicable | Default |
| CNAME | `www` | `everyday-gut-wellness.netlify.app` | Not applicable | Default |

Porkbun supports an ALIAS at the root while retaining MX/TXT records. In its Host field, blank means the root `everydaygutwellness.com`; `www` means `www.everydaygutwellness.com`. Do not put `https://`, a slash, or a page path in DNS answers. [Porkbun record types and fields](https://kb.porkbun.com/article/231-how-to-add-dns-records-on-porkbun)

The `.netlify.app` hostname above is an infrastructure DNS target, not the public canonical URL. It must remain that exact target unless Netlify gives a different one. Do not replace it with the custom domain and create a DNS loop.

### Fallback only if an ALIAS cannot be used

Use a root **A** record with blank Host and `75.2.60.5` only when Netlify's project instructions call for the standard fallback. Use the A option **instead of** the root ALIAS, not in parallel. The recommended ALIAS is available at Porkbun. [Netlify apex options](https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/)

Before editing, record the existing DNS zone. Replace only conflicting web records at the root and `www`, such as parking records pointing to `pixie.porkbun.com`. Preserve email, verification, and unrelated subdomain records. Do not use “reset DNS” or park the domain as a migration shortcut. [Porkbun parking-record conflict guidance](https://kb.porkbun.com/article/239-cname-alias-record-with-that-host-already-exists-error)

If Netlify requests an ownership TXT record, copy its exact Type, Host and Value from that prompt; no ownership token is invented in this document.

## 2. Porkbun free incoming email forwarding

Open Porkbun **Domain Management → everydaygutwellness.com → Email**. Under **Email Hosting and Forwarding → Porkbun Email Forwarding**, create the specific forward:

| Forward username | Destination |
| --- | --- |
| `hello` | Your chosen Gmail address, entered privately in Porkbun |

Create the forward in this screen, not only a DNS record. Verify it appears in **Current Forwards**. Test from an address different from the destination Gmail to avoid forwarding-loop behavior. [Porkbun forwarding setup](https://kb.porkbun.com/article/10-how-to-set-up-email-forwarding-service)

The two MX records below already exist in public DNS. Keep them. Creating the `hello` forwarding address in Porkbun is a separate operation; existing MX answers do not prove that forward exists or works. Check the forwarding setup's SPF record as well:

| Type | Porkbun Host | Answer / Value | Priority |
| --- | --- | --- | --- |
| MX | Leave blank | `fwd1.porkbun.com` | `10` |
| MX | Leave blank | `fwd2.porkbun.com` | `20` |
| TXT | Leave blank | `v=spf1 include:_spf.porkbun.com ~all` | Not applicable |

If these exact records already exist, do not create duplicates. Keep one root SPF record. If another valid SPF policy is already present, review and merge the required providers into one policy rather than adding a second `v=spf1` TXT. Do not mix Porkbun incoming MX with another provider's incoming MX as a way to split addresses. [Porkbun MX and SPF records](https://kb.porkbun.com/article/47-how-to-use-porkbun-email-when-your-dns-is-hosted-elsewhere)

**What forwarding provides:** mail sent to `hello@everydaygutwellness.com` can arrive in Gmail, including sender-verification and support messages. Forwarding does not supply SMTP or make Gmail replies originate from `hello@`. Ordinary Gmail replies show the Gmail address. Authenticated Systeme.io is the proposed outbound campaign sender; verify the real Reply-To route before activation. [Forwarding limitations](https://kb.porkbun.com/article/10-how-to-set-up-email-forwarding-service)

## 3. Systeme.io domain authentication

The domain has now been added in the correct Systeme.io account under **Settings → Products & Marketing → Emails → Domains** and is **Pending**. The following three CNAMEs were obtained from that account, rather than inferred from documentation examples. The platform's setup procedure generates these records under its domain-authentication screen. [Systeme.io domain authentication](https://help.systeme.io/article/316-how-to-authenticate-your-personal-domain-name)

| Purpose | Type | Porkbun Host | Answer / Value |
| --- | --- | --- | --- |
| Provider return-path / authentication | CNAME | `si3504776` | `inbound.systeme.io` |
| DKIM 1 | CNAME | `systemeio1._domainkey` | `key1.systeme.io` |
| DKIM 2 | CNAME | `systemeio2._domainkey` | `key2.systeme.io` |
| Initial report-free DMARC option, only if no policy already exists | TXT | `_dmarc` | `v=DMARC1; p=none;` |

The complete CNAME owner names are `si3504776.everydaygutwellness.com`, `systemeio1._domainkey.everydaygutwellness.com`, and `systemeio2._domainkey.everydaygutwellness.com`. In Porkbun, use only the relative Host labels shown in the table. Do not duplicate the domain suffix. A DMARC record is TXT, not a fourth CNAME.

**Deliberate privacy option:** the report-free DMARC value above omits the personal reporting address shown by the account. It requests no aggregate reports; `rua` is optional under [RFC 7489 section 6.3](https://www.rfc-editor.org/rfc/rfc7489.html#section-6.3). Recheck DNS first. Never replace an existing `quarantine`/`reject` policy or otherwise weaken an existing policy to use this initial option. Keep one DMARC policy at `_dmarc`. After forwarding is verified, the owner may choose a monitored report destination such as `hello@everydaygutwellness.com`; no personal Gmail address is stored in this public document. The initial `p=none` policy is not enforcement and does not guarantee delivery.

No additional root SPF include for Systeme.io is guessed here. Add only records that this account supplies, and reconcile them with the existing Porkbun setup.

## 4. Verify the sender address separately

Once forwarding works, use **Settings → Emails → Verified email addresses → Add new email address** to submit `hello@everydaygutwellness.com`. Open the confirmation arriving through the forward and finish the platform confirmation. Confirm that the sender status becomes **Verified**, that the owned domain is authenticated, and that the campaign sender dropdown offers the address. Domain authentication and address confirmation are separate checks. [Systeme.io sender verification](https://help.systeme.io/article/2070-how-to-confirm-your-email-sender-address)

Use **Everyday Gut Wellness** as the recognizable display name. Test both a real delivered message and a reply. Check original-message headers for the expected SPF/DKIM results and DMARC alignment; do not infer inbox delivery solely from a green DNS check. No live send is established by this checklist.

## 5. Values safe to paste back for verification

Send the following **DNS configuration fields only**:

1. From Netlify: the domain is already attached and its standard DNS values are captured above. After the Porkbun edit, provide the updated **DNS verification** and **HTTPS certificate** status; no repeated domain addition is needed. Copy any new ownership TXT prompt only if one actually appears.
2. From Systeme.io **Domains**: the three CNAME rows are already captured above. Paste their updated verification status and confirm they match. For DMARC, paste the public DNS policy you actually chose; the personal Gmail reporting address is not needed in chat or Git.
3. From Porkbun: the current web records, MX, root SPF TXT, and `_dmarc` records after the edit. DNS values are public; the Gmail forwarding destination can remain private.
4. Status text such as **Pending**, **Verified**, **Authenticated**, or **HTTPS certificate provisioned**, without credentials or unrelated account details.

Do not paste a Systeme.io API key, Netlify token, Porkbun API key, password, login code, private admin key, or Supabase secret. Set the API key directly in the server-only Netlify environment variable documented with the integration.

## Netlify environment variables and tag

Configure the secret in the Netlify project dashboard, never in this document, frontend code, a `VITE_` variable, or chat. Use the exact names below and redeploy after changing runtime configuration.

| Variable | Value or role | Scope and initial state |
| --- | --- | --- |
| `SYSTEME_IO_API_KEY` | Actual Systeme.io API key, entered privately in Netlify | Server-side Functions; mark as secret |
| `SYSTEME_IO_TAG_ID` | Numeric ID of the Systeme.io tag named `gut-reset-lead`; not the tag-name string | Server-side Functions |
| `SYSTEME_IO_ENABLED` | `false` until migration, credentials and contact/tag checks pass | Server-side Functions; safe default `false` |
| `SYSTEME_IO_GUIDE_DELIVERY_READY` | `false` until sender authentication and the guide-delivery rule are verified | Server-side Functions; safe default `false` |
| `SYSTEME_IO_MARKETING_OPT_IN_URL` | Optional tested native double-opt-in form URL for the separate email series | Server-side configuration; the resulting visitor-facing URL is intentionally public |
| `CUSTOM_DOMAIN_REDIRECTS_ENABLED` | `false` before DNS and TLS verification; `true` only for the reviewed production cutover | Build configuration; applies only when `CONTEXT=production` |

The `gut-reset-lead` tag represents a requested-guide fulfillment event. It must not silently enroll someone in the seven-email marketing series. Create the tag in Systeme.io, then obtain its numeric ID for `SYSTEME_IO_TAG_ID`; the name alone is not accepted by the API integration. Keep live automation disabled until the migration and account-level checks pass.

## 6. Production cutover sequence

1. Finish code review, tests and the production build while the current working site stays accessible. Keep forced legacy-host redirects off until the new domain and TLS are verified.
2. Netlify attachment is completed. Keep the apex primary and `www` redirect; apply the already-confirmed account DNS instructions without adding the domains again.
3. Apply only the reviewed Porkbun web records; verify incoming-mail forwarding and preserve its MX/TXT records.
4. Wait for DNS verification and certificate provisioning for both apex and `www`. Inspect the actual browser HTTPS result; do not bypass certificate warnings.
5. Publish the reviewed custom-domain build and verify the canonical site before enabling any forced redirect from the legacy hostname. Set `CUSTOM_DOMAIN_REDIRECTS_ENABLED=true` only after DNS and TLS verification; the build script enables it only in production context. Verify that the host redirect preserves the path and query string and does not affect Deploy Previews.
6. Apply the generated Systeme.io authentication records, confirm `hello@`, and test guide-email automation and marketing-consent separation using owned test addresses.
7. Only enable email delivery after the matching tag rule, sender and content are verified. Tag assignment is not proof that an email was delivered. Keep instant download available if the provider is unconfigured, slow, or failing.

These steps are the proposed operator sequence. Code deployment, DNS changes, migration execution and email tests must each be reported separately with observed evidence.

## 7. Verification record

All rows start **NOT_RUN**. Replace a result only after the actual check, with date/time and evidence.

| Check | Expected result | Status |
| --- | --- | --- |
| Apex and www DNS | Correct authoritative Porkbun answers; no conflicting old web records | NOT_RUN |
| Netlify domain and TLS | Apex primary, both names attached, valid HTTPS certificates | NOT_RUN |
| Homepage | `https://everydaygutwellness.com/` returns HTTP 200 | NOT_RUN |
| Redirects | `www` and enabled legacy-host redirects end at canonical HTTPS once, preserve path/query, no loop | NOT_RUN |
| Initial HTML | Full article; 1 H1, 9 H2, 17 H3; no Loading Guide shell | NOT_RUN |
| Metadata | Canonical/OG/Twitter and editorial JSON-LD use the custom domain; 4 visible FAQs match FAQPage; no Product/Offer objects | NOT_RUN |
| Public utility pages | `/robots.txt`, `/sitemap.xml`, `/privacy.html`, `/terms.html`, `/contact.html`, `/editorial-standards.html` return HTTP 200 | NOT_RUN |
| Sitemap | All canonical locations use the custom domain; admin and subscriber endpoints absent | NOT_RUN |
| Free PDF | `/The-7-Day-Gentle-Gut-Reset-Guide.pdf` returns HTTP 200 and a real PDF; download works on mobile | NOT_RUN |
| Workbook CTA | `https://eiram32.gumroad.com/l/14-day-gut-clarity-workbook` opens the correct $25 product | NOT_RUN |
| Planner CTA | `https://eiram32.gumroad.com/l/ynisjl` opens the correct $30 product | NOT_RUN |
| Backend health | `/health` returns HTTP 200 JSON with `database: connected`; no secret or PII leakage | NOT_RUN |
| Admin protection | Anonymous admin/lead/export requests remain unauthorized after hostname change | NOT_RUN |
| Forwarding | External test to `hello@` reaches the destination; expected verification message accessible | NOT_RUN |
| Sender | Domain authenticated, hello@ verified and selectable; delivered headers and Reply-To inspected | NOT_RUN |
| Lead flow | One durable request, correct Systeme.io contact/tag, no unexpected marketing enrollment, truthful confirmation copy | NOT_RUN |
| Retry and repeat request | Provider failure preserves the request; duplicate/retried form does not cause repeated automation | NOT_RUN |
| Privacy and unsubscribe | No secrets in client bundle; no health tags; marketing suppression/withdrawal preserved | NOT_RUN |

After the custom domain is live, set up its Search Console property and submit the custom-domain sitemap. Monitor indexing and email outcomes separately; domain attachment alone does not prove either.
