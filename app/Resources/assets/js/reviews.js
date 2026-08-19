/* ═══════════════════════════════════════════════════════════════
   SODFA — Reviews Carousel   (v4.0.0 — NEW implementation)
   ───────────────────────────────────────────────────────────────
   هذا الملف هو التطبيق الوحيد النشط لقسم آراء الزبونات.
   يحلّ محل الكود القديم بالكامل وهو مستقل تماماً عن app.js.

   • يقرأ البيانات من  window.CONFIG.testimonials
     (يدعم الحقلين `rating` و `stars` كبديل)
   • يولّد بطاقة لكل رأي — ولا يُخفى أي رأي أبداً
   • متجاوب: 3 بطاقات (حاسوب) / 2 (لوحي) / 1 (هاتف)
   • حلقة لا نهائية حقيقية (نظام استنساخ) في الاتجاهين
   • حركة سلسة بـ translate3d + تشغيل تلقائي كل 4 ثوانٍ
   • نجوم ديناميكية تشمل أنصاف النجوم (معرّفات clip فريدة)
   • آمن عند تغيير حجم النافذة وعند إعادة البناء — مع حماية
     ضد التهيئة المزدوجة
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var AUTOPLAY_MS = 4000; // المدة بين كل حركة تلقائية
  var ANIM_MS = 600;      // يجب أن يطابق مدة transition في CSS
  var MAX_WAIT_MS = 8000; // أقصى مدة انتظار لتحميل CONFIG والقسم
  var WAIT_POLL_MS = 120; // فترة إعادة المحاولة

  /* ─── حالة الوحدة (نسخة واحدة فقط) ─── */
  var state = {
    ready: false,          // تم البناء والربط بنجاح
    section: null,         // عنصر #reviews
    viewport: null,        // .tst-viewport
    track: null,           // .tst-track
    prevBtn: null,         // زر السابق
    nextBtn: null,         // زر التالي
    originals: [],         // عناصر البطاقات الأصلية (واحد لكل رأي)
    total: 0,              // عدد الآراء
    visible: 1,            // عدد البطاقات الظاهرة حالياً
    pos: 0,                // الموضع الخطي للبطاقة عند حافة البداية
    animating: false,
    rtl: false,
    seq: 0,                // رقم البناء (لتوليد معرّفات clip فريدة)
    aborted: false,        // لا توجد بيانات → لا داعي لإعادة المحاولة
    autoplayTimer: null,
    resizeTimer: null,
    waitTimer: null
  };

  /* ═══════════════════════ أدوات مساعدة ═══════════════════════ */

  function clamp(v, min, max) { return v < min ? min : (v > max ? max : v); }

  function toNumber(v, fallback) {
    if (v === null || v === undefined || v === '') return fallback;
    var n = Number(v);
    return isNaN(n) ? fallback : n;
  }

  function isRTL() {
    var d = document.documentElement;
    return d.getAttribute('dir') === 'rtl' || d.dir === 'rtl' ||
      (document.body && getComputedStyle(document.body).direction === 'rtl');
  }

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  /* ═══════════════════ توليد النجوم (ديناميكي) ═══════════════════

     5   → ★★★★★
     4.5 → ★★★★½   (4 نجوم كاملة + نصف نجمة)
     4   → ★★★★☆
     3.5 → ★★★½☆
     3   → ★★★☆☆
     لا يتم تقريب 4.5 إلى 4 أو 5 أبداً.                                  */

  var STAR_PATH = 'M12 2l2.9 6.6 7.1.7-5.4 4.8 1.6 7L12 17.4 5.8 21l1.6-7L2 9.3l7.1-.7z';

  function fullStarSVG() {
    return '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="' +
      STAR_PATH + '"/></svg>';
  }

  function emptyStarSVG() {
    return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" stroke-linejoin="round" opacity=".38" aria-hidden="true"><path d="' +
      STAR_PATH + '"/></svg>';
  }

  /* نصف نجمة: النصف الأيسر مملوء والنصف الأيمن فارغ —
     عبر clipPath يقتطع النصف الأيسر من نجمة مملوءة فوق
     نجمة خلفية شفافة. المعرّف فريد لكل بطاقة ولكل نجمة
     حتى لا تتعارض البطاقات المتعددة مع بعضها.              */
  function halfStarSVG(cardId, starIdx) {
    var clipId = 'sodfa-half-' + cardId + '-' + starIdx;
    return '<svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">' +
      '<defs><clipPath id="' + clipId + '"><rect x="0" y="0" width="50%" height="100%"/></clipPath></defs>' +
      '<path d="' + STAR_PATH + '" fill="currentColor" opacity=".22"/>' +
      '<path d="' + STAR_PATH + '" fill="currentColor" clip-path="url(#' + clipId + ')"/></svg>';
  }

  function buildStars(rating, cardId) {
    var val = clamp(toNumber(rating, 0), 0, 5);
    var out = '';
    for (var i = 0; i < 5; i++) {
      var remaining = val - i;
      if (remaining >= 1) out += fullStarSVG();
      else if (remaining >= 0.5) out += halfStarSVG(cardId, i);
      else out += emptyStarSVG();
    }
    return out;
  }

  /* ═══════════════ بناء بطاقة رأي واحدة ═══════════════
     (نفس بنية وتصميم البطاقة السابقة — لا تغيير في المظهر) */

  function cardInnerHTML(t, cardId) {
    // دعم الحقلين: `rating` (الأساس) ثم `stars` كبديل ثم 0
    var rating = (typeof t.rating !== 'undefined' && t.rating !== null)
      ? t.rating
      : (typeof t.stars !== 'undefined' ? t.stars : 0);

    var starsHTML = buildStars(rating, cardId);
    var initial = t.initial || (t.name ? t.name.charAt(0) : '');
    var name = t.name || '';
    var city = t.city || '';
    var text = t.text || '';

    return '<div class="tst-card">' +
      '<span class="quote" aria-hidden="true">”</span>' +
      '<div class="tst-stars">' + starsHTML + '</div>' +
      '<p>' + text + '</p>' +
      '<div class="tst-who">' +
      '<span class="av">' + initial + '</span>' +
      '<div>' +
      '<b class="nm">' + name + '</b>' +
      (city ? '<span class="loc"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" ' +
        'stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>' +
        '<circle cx="12" cy="10" r="3"/></svg>' + city + '</span>' : '') +
      '</div>' +
      '</div>' +
      '</div>';
  }

  /* ═══════════════════ الهندسة والحركة ═══════════════════

     التخطيط:  [استنساخ قبلي (v)] [الأصلية (n)] [استنساخ لاحق (v)]
     الموضع الخطي q يُمثَّل في DOM بالعنصر الأصلي رقم  mod(q, n).
     النافذة المرئية عند الموضع p تعرض [p … p+v-1]، و p ضمن [0, n].
     الحلقة اللانهائية: عند بلوغ p = n ننتقل فوراً (بدون حركة)
     إلى p = 0 لأن المحتوى مطابق، والعكس عند p = 0.                */

  function getVisibleCount() {
    var w = window.innerWidth || document.documentElement.clientWidth;
    if (w >= 1024) return 3;   // حاسوب
    if (w >= 640) return 2;    // لوحي
    return 1;                  // هاتف
  }

  function cardWidthPx() {
    return (state.viewport ? state.viewport.clientWidth : window.innerWidth) / state.visible;
  }

  /* الإزاحة الفعلية للمسار (translate3d) */
  function translateFor(p) {
    var cw = cardWidthPx();
    var offsetCards = p + state.visible;  // المسافة من حافة البداية بعدد البطاقات
    var offsetPx = offsetCards * cw;
    var dir = state.rtl ? 1 : -1;         // RTL تتحرك للتقدم نحو اليمين، وLTR نحو اليسار
    return 'translate3d(' + (dir * offsetPx) + 'px, 0, 0)';
  }

  function applyTransform(animate) {
    if (!state.track) return;
    state.track.style.transform = translateFor(state.pos);
    if (animate) {
      state.track.classList.remove('noanim');
    } else {
      state.track.classList.add('noanim');
      void state.track.offsetWidth; // فرض إعادة التدفق حتى لا تُحرَّك القفزة
      state.track.classList.remove('noanim');
    }
  }

  /* القفزة اللحظية غير المرئية (نفس المحتوى) */
  function jumpTo(p) {
    state.pos = p;
    applyTransform(false);
  }

  /* التحرك خطوة واحدة بالضبط (+1 تالٍ / -1 سابق) */
  function moveBy(delta) {
    if (state.animating || !state.track || state.total < 1) return;

    // الالتفاف اللانهائي: ننتقل إلى الموضع المكافئ أولاً (غير مرئي)
    if (delta > 0 && state.pos === state.total) jumpTo(0);
    else if (delta < 0 && state.pos === 0) jumpTo(state.total);

    var next = state.pos + delta;
    if (next < 0 || next > state.total) return;
    state.pos = next;
    state.animating = true;
    applyTransform(true);
    setTimeout(function () { state.animating = false; }, ANIM_MS + 50);
  }

  /* ═══════════════════ بناء المسار ═══════════════════ */

  function originalIndexAtLinear(q) {
    var n = state.total;
    return ((q % n) + n) % n;
  }

  function buildTrack() {
    var testimonials = window.CONFIG.testimonials;
    state.total = testimonials.length;
    state.visible = getVisibleCount();
    state.track.innerHTML = ''; // تنظيف أي محتوى سابق — بناء نظيف

    // 1) البطاقات الأصلية: رأي واحد لكل بطاقة، الكل موجود في DOM
    state.originals = [];
    testimonials.forEach(function (t, i) {
      var slide = document.createElement('div');
      slide.className = 'tst-slide';
      slide.setAttribute('data-index', String(i));
      slide.innerHTML = cardInnerHTML(t, state.seq + '-' + i);
      state.track.appendChild(slide);
      state.originals.push(slide);
    });

    // 2) استنساخ البداية والنهاية لدعم الحلقة اللانهائية
    var v = state.visible;
    var n = state.total;
    var frag = document.createDocumentFragment();
    var q;

    // استنساخ قبلي: المواضع الخطية [-v … -1]
    for (q = -v; q < 0; q++) {
      frag.appendChild(state.originals[originalIndexAtLinear(q)].cloneNode(true));
    }
    // البطاقات الأصلية
    for (q = 0; q < n; q++) {
      frag.appendChild(state.originals[q]);
    }
    // استنساخ لاحق: المواضع الخطية [n … n+v-1]
    for (q = n; q < n + v; q++) {
      frag.appendChild(state.originals[originalIndexAtLinear(q)].cloneNode(true));
    }
    state.track.appendChild(frag);
  }

  /* ═══════════════════ التشغيل التلقائي ═══════════════════ */

  function startAutoplay() {
    stopAutoplay();
    if (prefersReducedMotion()) return;
    if (state.total < 2) return;
    state.autoplayTimer = setInterval(function () {
      if (!state.animating) moveBy(1);
    }, AUTOPLAY_MS);
  }

  function stopAutoplay() {
    if (state.autoplayTimer) {
      clearInterval(state.autoplayTimer);
      state.autoplayTimer = null;
    }
  }

  /* إعادة ضبط المؤقت بعد أي تفاعل يدوي */
  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  function onPrev() {
    if (state.animating) return;
    moveBy(-1);
    resetAutoplay();
  }

  function onNext() {
    if (state.animating) return;
    moveBy(1);
    resetAutoplay();
  }

  /* ═══════════════════ التهيئة ═══════════════════ */

  function bindButtons() {
    if (state.prevBtn && !state.prevBtn.__rvBound) {
      state.prevBtn.__rvBound = true;
      state.prevBtn.addEventListener('click', onPrev);
    }
    if (state.nextBtn && !state.nextBtn.__rvBound) {
      state.nextBtn.__rvBound = true;
      state.nextBtn.addEventListener('click', onNext);
    }
  }

  function bindHover() {
    if (state.viewport && !state.viewport.__rvBound) {
      state.viewport.__rvBound = true;
      state.viewport.addEventListener('mouseenter', stopAutoplay);
      state.viewport.addEventListener('mouseleave', startAutoplay);
    }
  }

  function teardown() {
    stopAutoplay();
    state.ready = false;
    state.section = null;
    state.viewport = null;
    state.track = null;
    state.originals = [];
    state.animating = false;
  }

  /* تهيئة واحدة فقط — مع دعم إعادة الربط إذا أعاد app.js بناء القسم */
  function initReviews() {
    // حارس التهيئة: نفس القسم ونفس المسار → لا نعيد شيئاً
    if (state.ready) {
      var cur = document.getElementById('reviews');
      if (cur && cur === state.section) return true;
      teardown(); // القسم أُعيد بناؤه → نربط من جديد على DOM الجديد
    }

    var section = document.getElementById('reviews');
    if (!section) return false;
    var viewport = section.querySelector('.tst-viewport');
    var track = section.querySelector('.tst-track');
    if (!viewport || !track) return false;

    var cfg = window.CONFIG;
    if (!cfg || !cfg.testimonials || !cfg.testimonials.length) {
      state.aborted = true;
      console.warn('[reviews.js] لا توجد بيانات آراء في CONFIG — تم تخطي الكاروسيل.');
      return false;
    }

    state.section = section;
    state.viewport = viewport;
    state.track = track;
    state.prevBtn = section.querySelector('#tstPrev') || section.querySelector('.tst-btn');
    state.nextBtn = section.querySelector('#tstNext') || section.querySelector('.tst-btn.solid');
    state.rtl = isRTL();
    state.seq += 1;
    state.aborted = false;

    buildTrack();
    state.pos = 0;
    applyTransform(false);
    bindButtons();
    bindHover();
    startAutoplay();
    state.ready = true;

    console.log('✅ [reviews.js] تم تهيئة الكاروسيل — ' + state.total + ' بطاقة، ' + state.visible + ' ظاهرة، حلقة لا نهائية + تلقائي.');
    return true;
  }

  /* ═══════════════════ الإقلاع بأمان ═══════════════════
     ينتظر: تحميل CONFIG + وجود قسم #reviews + ملء البيانات
     دون إلقاء أي أخطاء، مع مهلة قصوى.                        */

  function boot() {
    if (state.waitTimer) {
      clearInterval(state.waitTimer);
      state.waitTimer = null;
    }
    var deadline = Date.now() + MAX_WAIT_MS;

    function attempt() {
      if (state.aborted) return;
      if (initReviews()) return true;
      if (Date.now() > deadline) {
        console.warn('[reviews.js] انتهت المهلة: CONFIG أو قسم #reviews غير متوفر.');
        return true; // توقف المحاولات
      }
      return false;
    }

    if (attempt()) return;
    state.waitTimer = setInterval(function () {
      if (attempt()) {
        clearInterval(state.waitTimer);
        state.waitTimer = null;
      }
    }, WAIT_POLL_MS);
  }

  /* ═══════════════════ معالجة تغيير الحجم ═══════════════════ */

  function handleResize() {
    if (!state.ready) return;
    clearTimeout(state.resizeTimer);
    state.resizeTimer = setTimeout(function () {
      var newVisible = getVisibleCount();
      if (newVisible !== state.visible) {
        // تغيّر نقطة التوقف → إعادة بناء آمنة مع الحفاظ على الموضع
        var logical = state.pos;
        buildTrack();
        state.pos = clamp(logical, 0, state.total);
        applyTransform(false);
        resetAutoplay();
      } else {
        // نفس نقطة التوقف → إعادة تطبيق الإزاحة فقط (عرض البطاقة تغيّر)
        applyTransform(false);
      }
    }, 180);
  }

  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleResize);

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stopAutoplay();
    else if (state.ready) startAutoplay();
  });

  /* ═══════════════════ الإقلاع ═══════════════════
     عدة مسارات آمنة: فوري، عند جاهزية DOM، وعند
     إشارة app.js  (sodfa:ready) بعد بناء الصفحة.        */

  document.addEventListener('sodfa:ready', boot);
  document.addEventListener('DOMContentLoaded', boot);
  boot();

  /* ═══════════════════ واجهة تصحيح/اختبار ═══════════════════
     أداة صغيرة للتأكد من الحالة أثناء التطوير — تُظهر فقط
     معلومات القراءة ولا تؤثر على عمل الكاروسيل.               */
  window.__reviewsDebug = {
    getState: function () {
      return {
        ready: state.ready,
        total: state.total,
        visible: state.visible,
        pos: state.pos,
        cardsInDOM: state.track ? state.track.children.length : 0,
        originals: state.originals.length,
        rtl: state.rtl
      };
    },
    next: onNext,
    prev: onPrev,
    visibleCount: getVisibleCount
  };
})();
