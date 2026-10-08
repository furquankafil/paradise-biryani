/* Paradise Biryani — frontend logic (vanilla JS, no cart/checkout) */
(function () {
  'use strict';

  /* ============ CONFIG — change in one place ============ */
  var WA_NUMBER = '917607833473';
  var PHONE_PRIMARY = '+917607833473';
  // Final deployment URL for QR. Falls back to current page URL automatically.
  var SITE_MENU_URL = (typeof window !== 'undefined' && window.location.href.indexOf('file:') !== 0)
    ? window.location.href.split('#')[0]
    : 'https://paradisebiryani.example.com/#menu';

  var WA_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4 0-.5.1-.7l.4-.5c.1-.2.1-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.2-.7.4-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.9 2.9 4.6 4 .6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2 0-.1-.2-.2-.5-.3z"/></svg>';

  function rs(num) { return '\u20B9' + num; }
  function fmt(n) { return n.toLocaleString('en-IN'); }

  /* ============ MENU DATA — exact items & prices ============ */
  var MENU = [
    { id: 'cb-quarter', name: 'Chicken Biryani — Quarter', cat: 'biryani', catLabel: 'BIRYANI', price: 70,
      desc: 'Fragrant basmati rice layered with aromatic spices and tender chicken.',
      img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800&auto=format&fit=crop' },
    { id: 'cb-half', name: 'Chicken Biryani — Half / Haaf', cat: 'biryani', catLabel: 'BIRYANI', price: 110,
      desc: 'A generous half portion — double rice, double flavour, extra juicy chicken.',
      img: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=800&auto=format&fit=crop' },
    { id: 'cb-full', name: 'Chicken Biryani — Full', cat: 'biryani', catLabel: 'BIRYANI', price: 200,
      desc: 'Full royal handi portion. Perfect for big hunger or sharing with family.',
      img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=800&auto=format&fit=crop' },
    { id: 'cb-coroma', name: 'Chicken Coroma Biryani', cat: 'biryani', catLabel: 'BIRYANI', price: 160,
      desc: 'Rich coroma-style biryani with creamy masala and slow-cooked chicken.',
      img: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=800&auto=format&fit=crop' },
    { id: 'alfaham', name: 'Alfaham Chicken', cat: 'alfaham', catLabel: 'ALFAHAM', price: 160,
      desc: 'Grilled Alfaham chicken with charred, smoky skin and juicy inside.',
      img: 'https://images.unsplash.com/photo-1594221708779-94832f4320d1?q=80&w=800&auto=format&fit=crop' },
    { id: 'seekh-paratha', name: 'Seekh Kabab with Paratha', cat: 'seekh-paratha', catLabel: 'SEEKH PARATHA', price: 120,
      desc: 'Smoky seekh kebabs served hot with soft, flaky paratha.',
      img: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=800&auto=format&fit=crop' },
    { id: 'chicken-fry', name: 'Chicken Fry — 1 Kg', cat: 'fry', catLabel: 'FRY', price: 480,
      desc: 'Crispy golden fried chicken, full 1 kg — crunchy outside, juicy inside.',
      img: 'https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=800&auto=format&fit=crop' },
    { id: 'lassi', name: 'Lassi', cat: 'lassi', catLabel: 'LASSI', price: 35,
      desc: 'Traditional chilled lassi — thick, creamy and refreshing.',
      img: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=800&auto=format&fit=crop' },
    { id: 'shahi-tukda', name: 'Shahi Tukda', cat: 'dessert', catLabel: 'DESSERT', price: 30,
      desc: 'Royal bread dessert with creamy milk, nuts and sweet garnish.',
      img: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=800&auto=format&fit=crop' }
  ];

  // Independent quantity state per item (default 1, min 1)
  var qty = {};
  MENU.forEach(function (m) { qty[m.id] = 1; });

  function waLinkFor(item, q) {
    var total = item.price * q;
    var msg = 'Hello Paradise Biryani, I want to order:\n' +
      item.name + '\nQuantity: ' + q + '\nPrice: \u20B9' + item.price +
      ' each\nTotal: \u20B9' + total;
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);
  }

  var grid = document.getElementById('menuGrid');
  var emptyMsg = document.getElementById('menuEmpty');

  function cardHTML(item) {
    return (
      '<article class="menu-card" data-cat="' + item.cat + '" data-id="' + item.id + '">' +
        '<div class="menu-img">' +
          '<span class="cat-badge">' + item.catLabel + '</span>' +
          '<img src="' + item.img + '" alt="' + item.name + ' at Paradise Biryani" loading="lazy" decoding="async" width="800" height="500" onerror="this.onerror=null;this.src=\'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800&auto=format&fit=crop\'" />' +
          '<span class="price-tag">' + rs(item.price) + '</span>' +
        '</div>' +
        '<div class="menu-body">' +
          '<h3>' + item.name + '</h3>' +
          '<p class="desc">' + item.desc + '</p>' +
          '<div class="qty-row">' +
            '<div class="qty-ctrl" role="group" aria-label="Quantity for ' + item.name + '">' +
              '<button type="button" class="qty-btn" data-act="dec" data-id="' + item.id + '" aria-label="Decrease quantity">\u2212</button>' +
              '<span class="qty-val" id="qv-' + item.id + '" aria-live="polite">1</span>' +
              '<button type="button" class="qty-btn" data-act="inc" data-id="' + item.id + '" aria-label="Increase quantity">+</button>' +
            '</div>' +
            '<span class="qty-label">QTY</span>' +
            '<span class="item-total">Total: <strong id="qt-' + item.id + '">' + rs(item.price) + '</strong></span>' +
          '</div>' +
          '<a class="buy-btn" id="qb-' + item.id + '" target="_blank" rel="noopener" href="' + waLinkFor(item, 1) + '">' + WA_ICON + ' BUY NOW ON WHATSAPP</a>' +
          '<p class="per-unit">' + rs(item.price) + ' / quantity &bull; tap + / \u2212 to update total</p>' +
        '</div>' +
      '</article>'
    );
  }

  function runIdle(fn) {
    if ('requestIdleCallback' in window) requestIdleCallback(fn, { timeout: 1200 });
    else setTimeout(fn, 1);
  }
  function renderMenu() {
    if (!grid) return;
    grid.innerHTML = MENU.map(cardHTML).join('');
    // cardIn is CSS-gated to fine pointers only; no JS animation
    // cleanup needed, so filtering never restarts motion.
  }
  // HANG FIX: hero paints first, menu renders idle — no first-load block.
  if (grid && 'requestIdleCallback' in window) runIdle(renderMenu);
  else renderMenu();

  // Quantity events (event delegation — no reload, per-item independent)
  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.qty-btn') : null;
    if (!btn) return;
    var id = btn.getAttribute('data-id');
    var item = MENU.find(function (m) { return m.id === id; });
    if (!item) return;
    var cur = qty[id] || 1;
    if (btn.getAttribute('data-act') === 'inc') cur = cur + 1;
    else cur = Math.max(1, cur - 1); // minimum 1
    qty[id] = cur;
    var qv = document.getElementById('qv-' + id);
    var qt = document.getElementById('qt-' + id);
    var qb = document.getElementById('qb-' + id);
    if (qv) qv.textContent = cur;
    if (qt) qt.textContent = rs(fmt(item.price * cur));
    if (qb) qb.href = waLinkFor(item, cur);
  });

  /* ============ FILTERS ============ */
  var filters = document.querySelectorAll('.filter');
  filters.forEach(function (f) {
    f.addEventListener('click', function () {
      filters.forEach(function (x) { x.classList.remove('active'); x.setAttribute('aria-selected', 'false'); });
      f.classList.add('active');
      f.setAttribute('aria-selected', 'true');
      var cat = f.getAttribute('data-filter');
      var cards = grid.querySelectorAll('.menu-card');
      var visible = 0;
      cards.forEach(function (c) {
        var show = cat === 'all' || c.getAttribute('data-cat') === cat;
        c.style.animation = 'none'; // stop cardIn re-firing on display toggle
        c.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      if (emptyMsg) emptyMsg.classList.toggle('hidden', visible > 0);
    });
  });

  /* ============ GALLERY ============ */
  var GALLERY = [
    { src: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=1000&auto=format&fit=crop', alt: 'Chicken biryani bowl with long basmati rice', cap: 'Chicken Biryani' },
    { src: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=1000&auto=format&fit=crop', alt: 'Biryani handi with spices and fried onions', cap: 'Dum Biryani Handi' },
    { src: 'https://images.unsplash.com/photo-1594221708779-94832f4320d1?q=80&w=800&auto=format&fit=crop', alt: 'Grilled Alfaham chicken plated', cap: 'Alfaham Chicken' },
    { src: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=800&auto=format&fit=crop', alt: 'Seekh kebab skewers over flame', cap: 'Seekh Kebab' },
    { src: 'https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=800&auto=format&fit=crop', alt: 'Crispy fried chicken pieces', cap: 'Chicken Fry' },
    { src: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=800&auto=format&fit=crop', alt: 'Chilled creamy lassi in glass', cap: 'Chilled Lassi' },
    { src: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=800&auto=format&fit=crop', alt: 'Shahi Tukda dessert with nuts', cap: 'Shahi Tukda' },
    { src: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop', alt: 'Kebabs grilling — restaurant presentation', cap: 'From The Grill' }
  ];
  var gg = document.getElementById('galleryGrid');
  function renderGallery() {
    if (!gg || gg.dataset.done) return;
    gg.dataset.done = '1';
    gg.innerHTML = GALLERY.map(function (g, i) {
      return '<figure data-idx="' + i + '"><img src="' + g.src + '" alt="' + g.alt + '" loading="lazy" decoding="async" width="800" height="600" /><figcaption>' + g.cap + '</figcaption></figure>';
    }).join('');
  }
  // HANG FIX: gallery renders only when scrolled near, not on first load.
  if (gg && 'IntersectionObserver' in window) {
    var gio = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) { renderGallery(); gio.disconnect(); }
      });
    }, { rootMargin: '400px 0px' });
    gio.observe(gg);
  } else {
    runIdle(renderGallery);
  }

  // Lightbox
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var cur = 0;
  function openLb(i) {
    cur = (i + GALLERY.length) % GALLERY.length;
    lbImg.src = GALLERY[cur].src;
    lbImg.alt = GALLERY[cur].alt;
    lb.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
  function closeLb() { lb.classList.add('hidden'); document.body.style.overflow = ''; }
  if (gg) gg.addEventListener('click', function (e) {
    var fig = e.target.closest ? e.target.closest('figure') : null;
    if (fig) openLb(parseInt(fig.getAttribute('data-idx'), 10));
  });
  var lbClose = document.getElementById('lbClose');
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');
  if (lbClose) lbClose.addEventListener('click', closeLb);
  if (lbPrev) lbPrev.addEventListener('click', function (ev) { ev.stopPropagation(); openLb(cur - 1); });
  if (lbNext) lbNext.addEventListener('click', function (ev) { ev.stopPropagation(); openLb(cur + 1); });
  if (lb) lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (lb.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') openLb(cur - 1);
    if (e.key === 'ArrowRight') openLb(cur + 1);
  });

  /* ============ HEADER / NAV (rAF-throttled: no per-frame class churn) ============ */
  var header = document.getElementById('siteHeader');
  var ticking = false;
  function applyScrolled() { header.classList.toggle('scrolled', window.scrollY > 30); ticking = false; }
  function onScroll() {
    if (!ticking) {
      ticking = true;
      if ('requestAnimationFrame' in window) requestAnimationFrame(applyScrolled);
      else applyScrolled();
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  applyScrolled();

  var mobileNav = document.getElementById('mobileNav');
  var ham = document.getElementById('hamburger');
  function setNav(open) {
    mobileNav.classList.toggle('hidden', !open);
    ham.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  ham.addEventListener('click', function () { setNav(true); });
  document.getElementById('closeNav').addEventListener('click', function () { setNav(false); });
  mobileNav.querySelectorAll('[data-close-nav]').forEach(function (el) { el.addEventListener('click', function () { setNav(false); }); });
  mobileNav.querySelectorAll('.mob-link').forEach(function (a) { a.addEventListener('click', function () { setNav(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !mobileNav.classList.contains('hidden')) setNav(false); });

  /* ============ REVEAL ON SCROLL ============ */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Temporary diagnostic (Step 1/3): ?nomotion=1 disables the whole reveal
  // system (elements stay visible) so motion vs layout causes can be isolated.
  var noMotion = /(?:\?|&)nomotion=1(?:&|$)/.test(window.location.search);
  if (noMotion) document.documentElement.classList.add('debug-no-motion');
  var reveals = document.querySelectorAll('.reveal');
  if (reduced || noMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (r) { r.classList.add('visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        // One-time reveal: class is added once and never removed (no scroll toggling).
        if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (r) { io.observe(r); });
  }

  /* ============ LAZY MAP (heaviest embed — load only near viewport) ============ */
  var lazyMap = document.querySelector('.js-lazy-map');
  function loadMap() {
    if (!lazyMap || lazyMap.dataset.loaded) return;
    lazyMap.dataset.loaded = '1';
    if (lazyMap.dataset.src) lazyMap.src = lazyMap.dataset.src;
  }
  if (lazyMap && 'IntersectionObserver' in window) {
    var mio = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) { loadMap(); mio.disconnect(); }
      });
    }, { rootMargin: '500px 0px' });
    mio.observe(lazyMap);
  } else {
    window.addEventListener('load', loadMap, { once: true });
  }

  /* ============ QR CODE (real, scannable — lazy, non-blocking) ============ */
  var qrImg = document.getElementById('qrImg');
  function loadQR() {
    if (!qrImg || qrImg.dataset.loaded) return;
    qrImg.dataset.loaded = '1';
    qrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&color=0a0705&data=' + encodeURIComponent(SITE_MENU_URL);
  }
  if (qrImg && 'IntersectionObserver' in window) {
    var qio = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) { loadQR(); qio.disconnect(); }
      });
    }, { rootMargin: '400px 0px' });
    qio.observe(qrImg);
  } else if (qrImg) {
    runIdle(loadQR);
  }
  var copyBtn = document.getElementById('copyLink');
  var copyMsg = document.getElementById('copyMsg');
  if (copyBtn) copyBtn.addEventListener('click', function () {
    var done = function () { if (copyMsg) copyMsg.textContent = 'Link copied — share it anywhere.'; };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(SITE_MENU_URL).then(done, function () { if (copyMsg) copyMsg.textContent = SITE_MENU_URL; });
    } else if (copyMsg) copyMsg.textContent = SITE_MENU_URL;
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
