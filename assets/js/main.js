/* noullet.tech - i18n, theme, navigation. No dependencies, no cookies. */
(function () {
  'use strict';

  var LANGS = ['en', 'de', 'fr', 'fi', 'lu'];
  // Luxembourgish is shown as LU, but its ISO 639 code (for lang/hreflang) is lb
  var ISO = { lu: 'lb' };
  var root = document.documentElement;
  var I18N = (window.I18N = window.I18N || {});

  function store(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* private mode */ }
  }

  /* ------------------------------ i18n ------------------------------ */
  // English is authored in index.html and harvested here; other languages
  // live in assets/js/i18n/<lang>.js and fall back to English per key.
  var textNodes = Array.prototype.slice.call(document.querySelectorAll('[data-i18n]'));
  var attrNodes = Array.prototype.slice.call(document.querySelectorAll('[data-i18n-attr]'));
  var en = {};

  function attrPairs(el) {
    return el.getAttribute('data-i18n-attr').split(';').map(function (pair) {
      var i = pair.indexOf(':');
      return { attr: pair.slice(0, i).trim(), key: pair.slice(i + 1).trim() };
    });
  }

  textNodes.forEach(function (el) {
    var k = el.getAttribute('data-i18n');
    if (!(k in en)) en[k] = el.tagName === 'TITLE' ? el.textContent : el.innerHTML;
  });
  attrNodes.forEach(function (el) {
    attrPairs(el).forEach(function (p) {
      if (!(p.key in en)) en[p.key] = el.getAttribute(p.attr);
    });
  });
  I18N.en = en;

  // Resolves with the dictionary, or null if the file could not be loaded
  function loadDict(lang) {
    return new Promise(function (resolve) {
      if (I18N[lang]) return resolve(I18N[lang]);
      var s = document.createElement('script');
      s.src = 'assets/js/i18n/' + lang + '.js';
      s.onload = function () { resolve(I18N[lang] || null); };
      s.onerror = function () { s.remove(); resolve(null); };
      document.head.appendChild(s);
    });
  }

  var current = null;

  function render(lang, dict) {
    textNodes.forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      var v = k in dict ? dict[k] : en[k];
      if (el.tagName === 'TITLE') document.title = v;
      else el.innerHTML = v;
    });
    attrNodes.forEach(function (el) {
      attrPairs(el).forEach(function (p) {
        el.setAttribute(p.attr, p.key in dict ? dict[p.key] : en[p.key]);
      });
    });
    root.lang = ISO[lang] || lang;
    root.setAttribute('data-lang', lang);
    document.querySelectorAll('.lang-switch button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang));
    });
    current = lang;
  }

  // Resolves true if the language was applied. If its file can't be loaded,
  // the current language stays (English on first load) instead of silently mixing.
  function applyLang(lang) {
    if (LANGS.indexOf(lang) < 0) lang = 'en';
    return loadDict(lang).then(function (dict) {
      if (dict) render(lang, dict);
      else if (!current) render('en', en);
      root.classList.remove('i18n-pending');
      return !!dict;
    });
  }

  function setUrlLang(lang) {
    if (!history.replaceState) return;
    var url = new URL(location.href);
    if (lang === 'en') url.searchParams.delete('lang'); else url.searchParams.set('lang', lang);
    history.replaceState(null, '', url.pathname + url.search + url.hash);
  }

  document.querySelectorAll('.lang-switch button').forEach(function (b) {
    b.addEventListener('click', function () {
      var lang = b.getAttribute('data-lang');
      applyLang(lang).then(function (ok) {
        if (!ok) return;
        store('kn-lang', lang);
        setUrlLang(lang); // keep shared links in sync with the chosen language
      });
    });
  });

  applyLang(root.getAttribute('data-lang') || 'en').then(function () {
    // Fetch the other languages in the background so switching is instant
    var idle = window.requestIdleCallback || function (fn) { setTimeout(fn, 1500); };
    idle(function () { LANGS.forEach(function (l) { if (l !== 'en') loadDict(l); }); });
  });

  /* ------------------------------ Theme ------------------------------ */
  var themeBtn = document.querySelector('.theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      store('kn-theme', next);
    });
  }

  /* ------------------------------ Navigation ------------------------------ */
  var header = document.querySelector('.site-header');
  var nav = document.getElementById('site-nav');
  var navToggle = document.querySelector('.nav-toggle');

  function setNav(open) {
    nav.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  }
  if (nav && navToggle) {
    navToggle.addEventListener('click', function () { setNav(!nav.classList.contains('open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setNav(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setNav(false); });
  }

  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if ('IntersectionObserver' in window) {
    var links = {};
    nav.querySelectorAll('a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        Object.keys(links).forEach(function (id) { links[id].classList.toggle('active', id === entry.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { spy.observe(s); });

    /* ------------------------------ Reveal on scroll ------------------------------ */
    var reveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          reveal.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    document.querySelectorAll('.reveal').forEach(function (el) { reveal.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ------------------------------ Orbit labels light up under passing dots ------------------------------ */
  // Measures where each ring's dot really is (from the ring's current rotation) and marks the label
  // it is under. Exact in every language/size; ~12 checks per second is plenty for these slow rings.
  (function () {
    var visual = document.querySelector('.hero-visual');
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!visual || !window.requestAnimationFrame || !window.DOMMatrixReadOnly) return;
    var rings = [1, 2, 3].map(function (n) { return visual.querySelector('.orbit-' + n); });
    var nodes = Array.prototype.slice.call(visual.querySelectorAll('.node'));
    var onScreen = true, last = 0;

    function dotPositions() {
      var box = visual.getBoundingClientRect(), cx = box.left + box.width / 2, cy = box.top + box.height / 2;
      return rings.map(function (ring, i) {
        var m = new DOMMatrixReadOnly(getComputedStyle(ring).transform);
        var angle = Math.atan2(m.b, m.a), r = ring.offsetWidth / 2;
        return { x: cx + r * Math.sin(angle), y: cy - r * Math.cos(angle), ring: i + 1 };
      });
    }

    function update() {
      if (rings[0].offsetWidth === 0) return;
      var dots = dotPositions();
      nodes.forEach(function (node) {
        var b = node.getBoundingClientRect(), hit = 0;
        dots.forEach(function (d) {
          if (d.x > b.left - 2 && d.x < b.right + 2 && d.y > b.top - 2 && d.y < b.bottom + 2) hit = d.ring;
        });
        node.classList.toggle('lit', hit > 0);
        node.classList.toggle('lit-blue', hit === 2);
        node.classList.toggle('lit-orange', hit === 3);
      });
    }

    // Reduced motion: the dots stay at their start positions, so one check (plus on resize) suffices.
    if (reduce) {
      update();
      window.addEventListener('resize', update);
      return;
    }

    function tick(now) {
      if (onScreen && now - last > 80) {
        last = now;
        update();
      }
      requestAnimationFrame(tick);
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) { onScreen = entries[0].isIntersecting; }).observe(visual);
    }
    requestAnimationFrame(tick);
  })();

  // Print: make sure everything is visible
  window.addEventListener('beforeprint', function () {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
  });
})();
