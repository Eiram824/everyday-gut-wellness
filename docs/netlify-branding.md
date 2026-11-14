# Production branding

The floating “Powered by Netlify” badge is a platform injection. It is not part of
the React components, footer, CSS, source HTML, or netlify.toml.

For the everyday-gut-wellness Netlify project, keep **Project configuration →
General → Powered by Netlify badge** switched **off**. The corresponding project
setting is built_with_badge_enabled: false. It was disabled on November 14, 2026,
using the already authenticated Netlify API. Readback confirmed the setting and a
fresh public request no longer contained /.netlify/scripts/hud?variant=public.

Do not replace this setting with a visitor-local dismissal, CSS hiding, or a
MutationObserver. Turning off the project setting removes the injected badge for
all visitors and keeps the application layout and dependencies unchanged. Do not
change project visibility or access controls to remove branding.

After a production release, run:

    node scripts/validate-live-branding.mjs

This checks the actual public HTML for the homepage and four legal/editorial
pages. It fails if a page becomes unavailable or contains the Netlify badge loader
or markup. It is separate from build-time validation because the platform inserts
the badge after the build. Browser checks should also verify its absence in the
rendered page at mobile and desktop widths.

Netlify documents that this setting takes effect on the next request, without a
redeploy: [Powered by Netlify badge](https://docs.netlify.com/manage/projects/powered-by-netlify-badge/).
