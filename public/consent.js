/*
 * Everyday Gut Wellness: cookie consent + Google Analytics loader.
 *
 * - UK/EU/EEA/Swiss visitors (detected by browser time zone): Analytics stays
 *   OFF until the visitor clicks "Accept" (UK PECR / EU GDPR opt-in).
 * - Everyone else (US, Canada, Australia, ...): Analytics runs by default and
 *   the visitor can turn it off with "Reject" (CCPA-style opt-out).
 * - Uses Google Consent Mode v2. Advertising signals are always denied.
 * - The choice is remembered in localStorage; "Cookie settings" in the footer
 *   reopens the banner via window.egwCookieSettings().
 */
(function () {
  var GA_ID = 'G-JE9KCKNQ54';
  var KEY = 'egw_cookie_consent';

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  function read() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function write(v) {
    try { localStorage.setItem(KEY, v); } catch (e) { /* storage blocked */ }
  }

  var tz = '';
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { /* ignore */ }
  var optInRegion = /^(Europe\/|Atlantic\/(Reykjavik|Canary|Madeira|Azores|Faroe))/.test(tz);

  var stored = read();
  var analyticsAllowed = stored ? stored === 'granted' : !optInRegion;

  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: analyticsAllowed ? 'granted' : 'denied',
    wait_for_update: 500
  });

  var loaded = false;
  function loadAnalytics() {
    if (loaded) return;
    loaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
  }

  // Basic consent mode: Google's script is not even downloaded until allowed.
  if (analyticsAllowed) loadAnalytics();

  function setChoice(granted) {
    write(granted ? 'granted' : 'denied');
    window.gtag('consent', 'update', { analytics_storage: granted ? 'granted' : 'denied' });
    if (granted) {
      loadAnalytics();
    } else {
      // Remove existing Google Analytics cookies for this site.
      document.cookie.split(';').forEach(function (c) {
        var name = c.split('=')[0].trim();
        if (/^_ga/.test(name)) {
          var host = location.hostname.replace(/^www\./, '');
          ['', '; domain=' + host, '; domain=.' + host].forEach(function (d) {
            document.cookie = name + '=; Max-Age=0; path=/' + d;
          });
        }
      });
    }
    hide();
  }

  var banner = null;
  function hide() {
    if (banner) { banner.remove(); banner = null; }
  }

  function show() {
    if (banner) return;
    banner = document.createElement('div');
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie preferences');
    banner.style.cssText = [
      'position:fixed', 'left:16px', 'right:16px', 'bottom:16px', 'z-index:2147483000',
      'max-width:640px', 'margin:0 auto', 'background:#FFFFFF', 'color:#2C2A26',
      'border:1px solid #E5DFD5', 'border-radius:14px', 'box-shadow:0 10px 30px rgba(0,0,0,.18)',
      'padding:16px 18px', "font:14px/1.55 'Plus Jakarta Sans',system-ui,-apple-system,'Segoe UI',sans-serif"
    ].join(';');
    banner.innerHTML =
      '<p style="margin:0 0 12px">We use Google Analytics cookies to see which pages are useful. ' +
      'No advertising cookies. You can change this any time under &ldquo;Cookie settings&rdquo;. ' +
      '<a href="/privacy#cookies" style="color:#14382B;text-decoration:underline">Privacy Policy</a></p>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
      '<button type="button" data-c="reject" style="flex:1 1 140px;min-height:44px;padding:10px 16px;border-radius:999px;border:2px solid #14382B;background:#FFFFFF;color:#14382B;font-weight:700;cursor:pointer">Reject</button>' +
      '<button type="button" data-c="accept" style="flex:1 1 140px;min-height:44px;padding:10px 16px;border-radius:999px;border:2px solid #14382B;background:#14382B;color:#FFFFFF;font-weight:700;cursor:pointer">Accept</button>' +
      '</div>';
    banner.addEventListener('click', function (e) {
      var t = e.target && e.target.getAttribute && e.target.getAttribute('data-c');
      if (t === 'accept') setChoice(true);
      if (t === 'reject') setChoice(false);
    });
    document.body.appendChild(banner);
  }

  window.egwCookieSettings = function () { show(); };

  // Ask once: required in opt-in regions; elsewhere it gives a clear opt-out.
  if (!stored) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', show);
    } else {
      show();
    }
  }
})();
