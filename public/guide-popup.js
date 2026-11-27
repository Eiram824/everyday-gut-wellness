/* Gentle free-guide invitation for the static guide pages.
   Shows once per visitor, after ~30s of reading, half-page scroll, or (desktop) exit intent.
   Never shows to readers who already signed up. The button opens the normal signup form
   on the homepage (/#free-guide), so there is only one form and no third-party script. */
(function () {
  var SEEN = 'egw_guide_popup_seen', SUB = 'gut_reset_subscriber';
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return '1'; } }
  function set(k) { try { localStorage.setItem(k, String(Date.now())); } catch (e) {} }
  if (!/^\/(comfort|guides)\//.test(location.pathname)) return;
  if (get(SEEN) || get(SUB)) return;

  var shown = false, timer, waiting = false;
  function show() {
    if (shown || get(SEEN) || get(SUB)) return;
    // Wait until the cookie banner is answered so the two never stack on top of each other.
    if (!get('egw_cookie_consent')) {
      if (!waiting) { waiting = true; setTimeout(function () { waiting = false; show(); }, 3000); }
      return;
    }
    shown = true; set(SEEN); cleanup();
    var css = document.createElement('style');
    css.textContent =
      '.gp-back{position:fixed;inset:0;background:rgba(20,32,26,.45);z-index:9998;display:flex;align-items:flex-end;justify-content:center;padding:16px}' +
      '@media(min-width:640px){.gp-back{align-items:center}}' +
      '.gp{position:relative;max-width:420px;width:100%;background:#FAF8F5;color:#2C2A26;border:1px solid #E5DFD5;border-radius:16px;padding:24px 22px 20px;box-shadow:0 20px 50px rgba(0,0,0,.25);font-size:15px;line-height:1.5}' +
      '.gp h2{margin:0 0 8px;font-size:21px;line-height:1.25;color:#14382B}' +
      '.gp p{margin:0 0 16px;color:#4A463F}' +
      '.gp a.gp-btn{display:block;text-align:center;background:#14382B;color:#fff;text-decoration:none;font-weight:600;padding:12px 16px;border-radius:12px}' +
      '.gp a.gp-btn:hover{background:#0E281E}' +
      '.gp-x{position:absolute;top:8px;right:10px;background:none;border:0;font-size:24px;line-height:1;color:#6F6A62;cursor:pointer;padding:6px}' +
      '.gp small{display:block;margin-top:10px;color:#6F6A62;font-size:12px;text-align:center}' +
      '@media(prefers-reduced-motion:no-preference){.gp{animation:gpin .35s ease-out}@keyframes gpin{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}}';
    document.head.appendChild(css);
    var back = document.createElement('div');
    back.className = 'gp-back';
    back.innerHTML =
      '<div class="gp" role="dialog" aria-modal="true" aria-labelledby="gp-title">' +
      '<button type="button" class="gp-x" aria-label="Close">&times;</button>' +
      '<h2 id="gp-title">Want a gentle 7-day plan for your gut?</h2>' +
      '<p>Get the free 7-Day Gentle Gut Reset guide: small daily habits, a printable tracker, and no harsh detoxes.</p>' +
      '<a class="gp-btn" href="/#free-guide">Get the free guide</a>' +
      '<small>Free. Unsubscribe from our emails anytime.</small></div>';
    // Keep keyboard focus inside the card and make the page behind it inert while open.
    var hidden = [];
    Array.prototype.forEach.call(document.body.children, function (el) {
      if (!el.inert) { el.inert = true; el.setAttribute('aria-hidden', 'true'); hidden.push(el); }
    });
    var opener = document.activeElement;
    function close() {
      back.remove();
      document.removeEventListener('keydown', onKey);
      hidden.forEach(function (el) { el.inert = false; el.removeAttribute('aria-hidden'); });
      if (opener && opener.focus) opener.focus();
    }
    function onKey(e) {
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') return;
      var f = back.querySelectorAll('button, a[href]'), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (!back.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    }
    back.addEventListener('click', function (e) { if (e.target === back) close(); });
    back.querySelector('.gp-x').addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    document.body.appendChild(back);
    back.querySelector('.gp-btn').focus();
  }
  function onScroll() {
    var h = document.documentElement.scrollHeight - innerHeight;
    if (h > 0 && scrollY / h >= 0.5) show();
  }
  function onLeave(e) { if (!e.relatedTarget && e.clientY <= 0) show(); }
  function cleanup() {
    clearTimeout(timer);
    removeEventListener('scroll', onScroll);
    document.removeEventListener('mouseout', onLeave);
  }
  timer = setTimeout(show, 30000);
  addEventListener('scroll', onScroll, { passive: true });
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) document.addEventListener('mouseout', onLeave);
})();
