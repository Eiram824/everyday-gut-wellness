# Everyday Gut Wellness: DNS and production verification

Prepared: November 14, 2026. DMARC correction recorded November 15, 2026 (Asia/Singapore). Domain: `everydaygutwellness.com`. Registrar and intended authoritative DNS: Porkbun. Website: the existing Netlify project `everyday-gut-wellness`.

This is the configuration checklist. It does not establish that DNS, HTTPS, forwarding, sender authentication, API credentials, or automated email delivery have already been activated. Record actual results in the verification table below.

## Historical baseline — November 14, 2026

The table below preserves the earlier observations. Its report-free DMARC value and pending launch steps are historical; use the November 15 correction and the current instructions in section 3 for email authentication.

| Item | Observed state on November 14, 2026 |
| --- | --- |
| Authoritative nameservers | `curitiba.ns.porkbun.com`, `maceio.ns.porkbun.com`, `fortaleza.ns.porkbun.com`, `salvador.ns.porkbun.com` |
| Root web DNS | Porkbun ALIAS `apex-loadbalancer.netlify.com`; public flattened answers `75.2.60.5` and `99.83.231.61` |
| www DNS | CNAME `everyday-gut-wellness.netlify.app` |
| Incoming email MX | `fwd1.porkbun.com` priority 10 and `fwd2.porkbun.com` priority 20 already exist; do not add duplicates |
| Root SPF | `v=spf1 include:_spf.porkbun.com ~all` already exists; preserve it rather than adding a duplicate |
| DMARC | One `_dmarc` TXT: `v=DMARC1; p=none;`; monitoring policy, not enforcement |
| Systeme.io domain | Last observed dashboard status **Pending**. Corrected the malformed existing CNAME to `si3504776` → `inbound.systeme.io`; all three account-generated CNAMEs now resolve. Dashboard revalidation and verified hello@ sender remain outstanding. |
| Netlify domain attachment | Apex primary and www alias are attached. Actual HTTPS requests work; www responds 301 to the apex. |
| Netlify account DNS instructions | The account's Pending DNS modal confirms `apex-loadbalancer.netlify.com` for root ALIAS/ANAME/flattened CNAME; fallback A `75.2.60.5` |
| HTTPS certificate | Normal certificate-verified HTTPS requests to both names succeed and serve Netlify. |
| Code migration | Custom-domain metadata prepared on the working branch; not reported as live production |
| Porkbun DNS changes | Edited the one malformed Systeme.io CNAME; added one root Google verification TXT with owner approval. Preserved web, mail, DKIM, DMARC and ACME records. |
| Search Console | Custom-domain DNS ownership verified on November 14. Keep the generated Google TXT. Sitemap submission and custom-domain crawl inspection must follow publication of the custom-domain build. |

## DMARC correction — November 15, 2026 (Asia/Singapore)

Systeme.io support identified the missing DMARC reporting address as the remaining account-specific authentication requirement. The existing single `_dmarc` TXT record was edited in Porkbun to this exact value:

    v=DMARC1; p=none; rua=mailto:hello@everydaygutwellness.com

The existing TTL of **600 seconds** was preserved, and the zone still contained **12 records** after the edit. The `p=none` policy is unchanged. The working web, MX, SPF, DKIM, CNAME and other verification records were preserved.

Initial public verification returned the corrected value through Cloudflare DNS-over-HTTPS while Google still served its cached earlier value. At **04:37:41 on November 15 (Asia/Singapore; November 14, 20:37:41 UTC)**, both Google and Cloudflare DNS-over-HTTPS returned exactly one DMARC TXT answer matching the corrected value. All three existing Systeme.io CNAME targets also matched on both resolvers.

The Systeme.io dashboard still showed **Pending**, while its DNS details now showed **Homepage Detected**. This is not yet a confirmed authenticated domain. Keep email automation disabled until the platform accepts the domain and the sender/delivery checks pass.

Keep the working Porkbun nameservers and existing web/mail records. The earlier parking state has been superseded by the actual Netlify HTTPS response.

## Para sa may-ari

Panatilihin ang DNS management sa Porkbun. Magkaibang gawain ang website records, incoming email forwarding, at Systeme.io sending authentication. Hindi kailangang ilipat ang nameservers sa Netlify para gawin ang setup na ito.

Unahin ang website DNS at HTTPS, pagkatapos ang `hello@everydaygutwellness.com` forwarding at sender verification. Saka lamang i-enable ang tested email automation. Habang pending ang sender, dapat gumana pa rin ang instant PDF download at walang mensaheng nagsasabing naipadala na ang email.

## 1. Netlify website records

Naka-attach na ang domain sa existing Netlify project. Gumagana ang HTTPS sa apex at www, at nagre-redirect ang www sa apex. Hindi kailangang idagdag ulit ang mga domain o ulitin ang working DNS setup.

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

Observed on November 14: the `hello` forward already exists under Porkbun **Domain Management → everydaygutwellness.com → Email → Current Forwards**, with the owner's chosen Gmail destination. Do not create it again. For a new installation, use:

| Forward username | Destination |
| --- | --- |
| `hello` | Your chosen Gmail address, entered privately in Porkbun |

The forward is configured in this screen, not only in DNS. Actual external delivery to it remains an inbox test; test from an address different from the destination Gmail to avoid forwarding-loop behavior. [Porkbun forwarding setup](https://kb.porkbun.com/article/10-how-to-set-up-email-forwarding-service)

The two MX records below already exist in public DNS. Keep them. Creating the `hello` forwarding address in Porkbun is a separate operation; existing MX answers do not prove that forward exists or works. Check the forwarding setup's SPF record as well:

| Type | Porkbun Host | Answer / Value | Priority |
| --- | --- | --- | --- |
| MX | Leave blank | `fwd1.porkbun.com` | `10` |
| MX | Leave blank | `fwd2.porkbun.com` | `20` |
| TXT | Leave blank | `v=spf1 include:_spf.porkbun.com ~all` | Not applicable |

If these exact records already exist, do not create duplicates. Keep one root SPF record. If another valid SPF policy is already present, review and merge the required providers into one policy rather than adding a second `v=spf1` TXT. Do not mix Porkbun incoming MX with another provider's incoming MX as a way to split addresses. [Porkbun MX and SPF records](https://kb.porkbun.com/article/47-how-to-use-porkbun-email-when-your-dns-is-hosted-elsewhere)

**What forwarding provides:** mail sent to `hello@everydaygutwellness.com` can arrive in Gmail, including sender-verification and support messages. Forwarding does not supply SMTP or make Gmail replies originate from `hello@`. Ordinary Gmail replies show the Gmail address. Authenticated Systeme.io is the proposed outbound campaign sender; verify the real Reply-To route before activation. [Forwarding limitations](https://kb.porkbun.com/article/10-how-to-set-up-email-forwarding-service)

## 3. Systeme.io domain authentication

The domain is in the correct Systeme.io account under **Settings → Products & Marketing → Emails → Domains**. The November 15 dashboard check still showed **Pending**, with **Homepage Detected** in its DNS details. The following three account-generated CNAMEs already resolve publicly. Preserve them and recheck authentication after the corrected DMARC value is visible to the provider. [Systeme.io domain authentication](https://help.systeme.io/article/316-how-to-authenticate-your-personal-domain-name)

| Purpose | Type | Porkbun Host | Answer / Value |
| --- | --- | --- | --- |
| Provider return-path / authentication | CNAME | `si3504776` | `inbound.systeme.io` |
| DKIM 1 | CNAME | `systemeio1._domainkey` | `key1.systeme.io` |
| DKIM 2 | CNAME | `systemeio2._domainkey` | `key2.systeme.io` |
| DMARC value required by Systeme.io support for this account | TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:hello@everydaygutwellness.com` |

The complete CNAME owner names are `si3504776.everydaygutwellness.com`, `systemeio1._domainkey.everydaygutwellness.com`, and `systemeio2._domainkey.everydaygutwellness.com`. In Porkbun, use only the relative Host labels shown in the table. Do not duplicate the domain suffix. A DMARC record is TXT, not a fourth CNAME.

**Account-specific DMARC requirement:** Systeme.io support explicitly required the reporting address above for this account, consistent with its [domain authentication instructions](https://help.systeme.io/article/316-how-to-authenticate-your-personal-domain-name). Keep the existing single `_dmarc` TXT record with that exact value; do not restore the earlier report-free value or add a second policy. Reports are addressed to the owned business mailbox `hello@everydaygutwellness.com`. This edit retains the existing `p=none` policy, which is monitoring rather than enforcement and does not guarantee inbox delivery. A future change to `quarantine` or `reject` requires a separate alignment review. Registrar credentials and changes to 2FA are not required for this DNS edit.

No additional root SPF include for Systeme.io is guessed here. Add only records that this account supplies, and reconcile them with the existing Porkbun setup.

## 4. Verify the sender address separately

The November 15 dashboard already shows `hello@everydaygutwellness.com` as **Verified** after the owner's completed confirmation. Reuse that address; do not add or confirm it again. The remaining checks are that the owned domain becomes authenticated and the campaign sender dropdown offers the address. For a genuinely new sender address, use **Settings → Emails → Verified email addresses → Add new email address** and complete its own confirmation. Domain authentication and address confirmation are separate checks. [Systeme.io sender verification](https://help.systeme.io/article/2070-how-to-confirm-your-email-sender-address)

Use **Everyday Gut Wellness** as the recognizable display name. Test both a real delivered message and a reply. Check original-message headers for the expected SPF/DKIM results and DMARC alignment; do not infer inbox delivery solely from a green DNS check. No live send is established by this checklist.

## 5. Values safe to paste back for verification

Send the following **DNS configuration fields only**:

1. From Netlify: the domain is already attached and its standard DNS values are captured above. After the Porkbun edit, provide the updated **DNS verification** and **HTTPS certificate** status; no repeated domain addition is needed. Copy any new ownership TXT prompt only if one actually appears.
2. From Systeme.io **Domains**: the three CNAME rows are already captured above. Record their verification status and confirm they match. For DMARC, verify one `_dmarc` TXT with the exact support-required value `v=DMARC1; p=none; rua=mailto:hello@everydaygutwellness.com`, then record the platform's authentication result separately. The private Gmail forwarding destination is not needed in chat or Git.
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

This reusable table remains the production cutover checklist. The latest audit separately records public DNS/HTTPS/utility-page/health/admin/Gumroad passes and local build/browser passes. NOT_RUN below must not be interpreted as a completed live email or post-merge check.

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

The Search Console domain property is verified. After the custom-domain build is published, submit its sitemap and inspect the custom-domain homepage. Monitor indexing and email outcomes separately; ownership verification alone does not prove either.
