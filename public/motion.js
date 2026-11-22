/* Subtle scroll-reveal for the static guide pages (same rules as reveal.ts on the homepage).
   Only content that starts below the first screen is hidden; opacity + transform only (no CLS);
   skipped for reduced-motion users and old browsers. */
(function () {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var fold = window.innerHeight;
  var hidden = [];
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      io.unobserve(el);
      el.setAttribute('data-reveal', 'in');
      var done = function () { el.removeAttribute('data-reveal'); el.removeAttribute('data-reveal-delay'); };
      el.addEventListener('transitionend', done, { once: true });
      setTimeout(done, 1400);
    });
  }, { threshold: 0.15 });
  var targets = [];
  document.querySelectorAll('main .wrap > *').forEach(function (el) {
    if (el.tagName === 'UL' && el.classList.contains('cards')) {
      Array.prototype.forEach.call(el.children, function (li) { targets.push(li); });
    } else {
      targets.push(el);
    }
  });
  var lastParent = null, index = 0;
  targets.forEach(function (el) {
    if (el.getBoundingClientRect().top < fold) return;
    index = el.parentElement === lastParent && el.tagName === 'LI' ? index + 1 : 0;
    lastParent = el.parentElement;
    el.setAttribute('data-reveal', '');
    if (index > 0) el.setAttribute('data-reveal-delay', String(Math.min(index, 4)));
    hidden.push(el);
    io.observe(el);
  });
  window.addEventListener('beforeprint', function () {
    hidden.forEach(function (el) { el.removeAttribute('data-reveal'); });
  });
})();
