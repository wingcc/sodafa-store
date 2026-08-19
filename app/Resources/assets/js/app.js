(function () {
  "use strict";

  /* ═══════════════════════════════════════════════════════════════
     SODFA — السكربت الرئيسي (النسخة المُنظَّفة)
     الإصدار: 2.2.2  |  تاريخ التحديث: 2026-08-16
     ───────────────────────────────────────────────────────────────
     [التغييرات]:
     • تم فصل كل منطق آراء الزبونات إلى ملف منفصل: reviews.js
     • أصبح CONFIG متاحاً على window.CONFIG لاستخدامه من الوحدات الأخرى.
     • يتم إرسال حدث sodfa:ready عند اكتمال بناء الصفحة.
     • تم حذف RENDER.reviews و INIT.reviews بالكامل.
     ═══════════════════════════════════════════════════════════════ */

  var SODFA_VERSION = "2.2.2";
  var CONFIG = null;
  var app = document.getElementById("app");
  var sectionCache = {};
  var sectionList = [];
  var timers = [];
  var countersObs = null;
  var toastOn = true;
  var OILS_COLLAPSED_COUNT = 4;

  /* ─── أدوات مساعدة ─── */
  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function pad2(n) {
    return (n < 10 ? "0" : "") + n;
  }

  /* ─── أدوات آمنة ─── */
  function setText(el, v) {
    if (el && v != null) el.textContent = v;
  }

  function setHTML(el, v) {
    if (el && v != null) el.innerHTML = v;
  }

  function setSrc(el, v) {
    if (el && v) el.src = v;
  }

  /* ─── fillList ─── */
  function fillList(root, html) {
    if (!root) {
      console.warn("fillList: root is null");
      return;
    }
    var el = qs("[data-list]", root);
    if (!el) {
      console.warn("fillList: no [data-list] found in", root);
      return;
    }
    el.innerHTML = html;
    console.log("fillList: added content to", el);
  }

  /* ─── عدادات ─── */
  function safeCountdown(els, target) {
    function tick() {
      var diff = Math.max(0, target - Date.now());
      if (els.d) els.d.textContent = pad2(Math.floor(diff / 86400000));
      if (els.h) els.h.textContent = pad2(Math.floor((diff % 86400000) / 3600000));
      if (els.m) els.m.textContent = pad2(Math.floor((diff % 3600000) / 60000));
      if (els.s) els.s.textContent = pad2(Math.floor((diff % 60000) / 1000));
      return diff;
    }
    tick();
    var t = setInterval(tick, 1000);
    timers.push(t);
    return t;
  }

  function safeDayCountdown(els) {
    function tick() {
      var now = new Date(),
        end = new Date();
      end.setHours(23, 59, 59, 999);
      var diff = Math.max(0, end - now);
      if (els.h) els.h.textContent = pad2(Math.floor(diff / 3600000));
      if (els.m) els.m.textContent = pad2(Math.floor((diff % 3600000) / 60000));
      if (els.s) els.s.textContent = pad2(Math.floor((diff % 60000) / 1000));
    }
    tick();
    var t = setInterval(tick, 1000);
    timers.push(t);
    return t;
  }

  /* ─── دوال الألوان ─── */
  function hexToRgb(h) {
    h = h.replace("#", "");
    if (h.length === 3) h = h.split("").map(function (c) { return c + c; }).join("");
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function rgbToHex(r, g, b) {
    return "#" +
      [r, g, b].map(function (v) {
        return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
      }).join("");
  }

  function mix(a, b, t) {
    var A = hexToRgb(a),
      B = hexToRgb(b);
    return rgbToHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
  }

  function lighten(x, t) { return mix(x, "#ffffff", t); }

  function darken(x, t) { return mix(x, "#000000", t); }

  /* ─── أيقونات النجوم (مستعملة في عدة أقسام) ─── */
  function starSVG(w) {
    return '<svg width="' + w + '" height="' + w + '" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.6 7.1.7-5.4 4.8 1.6 7L12 17.4 5.8 21l1.6-7L2 9.3l7.1-.7z"/></svg>';
  }

  function starMarkup(rating, size, key) {
    var out = "";
    var val = Number(rating) || 0;
    for (var i = 0; i < 5; i++) {
      var remaining = val - i;
      if (remaining >= 1) {
        out += '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.6 7.1.7-5.4 4.8 1.6 7L12 17.4 5.8 21l1.6-7L2 9.3l7.1-.7z"/></svg>';
      } else if (remaining >= 0.5) {
        var clipId = "half-" + key + "-" + i;
        out += '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" aria-hidden="true"><defs><clipPath id="' + clipId + '"><rect x="0" y="0" width="50%" height="100%"></rect></clipPath></defs><path d="M12 2l2.9 6.6 7.1.7-5.4 4.8 1.6 7L12 17.4 5.8 21l1.6-7L2 9.3l7.1-.7z" fill="currentColor" opacity=".22"/><path d="M12 2l2.9 6.6 7.1.7-5.4 4.8 1.6 7L12 17.4 5.8 21l1.6-7L2 9.3l7.1-.7z" fill="currentColor" clip-path="url(#' + clipId + ')"/></svg>';
      } else {
        out += '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity=".38" aria-hidden="true"><path d="M12 2l2.9 6.6 7.1.7-5.4 4.8 1.6 7L12 17.4 5.8 21l1.6-7L2 9.3l7.1-.7z"/></svg>';
      }
    }
    return out;
  }

  var STAR = starSVG(16);
  var CHECK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg>';
  var LEAF = '<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M12 2C6.5 7.5 4.5 11.5 6.3 16c1.5 3.8 5.7 6 5.7 6s4.2-2.2 5.7-6c1.8-4.5-.2-8.5-5.7-14z"/></svg>';
  var FLOWER = '<svg viewBox="0 0 24 24" width="100%" height="100%"><g fill="currentColor"><circle cx="12" cy="5" r="3.1"/><circle cx="18.7" cy="9.9" r="3.1"/><circle cx="16.1" cy="17.6" r="3.1"/><circle cx="7.9" cy="17.6" r="3.1"/><circle cx="5.3" cy="9.9" r="3.1"/></g><circle cx="12" cy="12" r="2.5" fill="#C6A15B"/></svg>';

  var ICONS = {
    cod: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 12h.01M18 12h.01"/></svg>',
    returns: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 8v4l2.5 2.5"/></svg>',
    truck: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>',
    shield: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></svg>',
    droplet: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11z"/></svg>',
    sprout: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 21V9"/><path d="M12 9C12 5 9 3 5 3c0 4 3 6 7 6zM12 13c0-4 3-6 7-6 0 4-3 6-7 6z"/></svg>',
    sparkle: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18"/></svg>',
    sun: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"/></svg>',
    leaf: '<svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 7.5 4.5 11.5 6.3 16c1.5 3.8 5.7 6 5.7 6s4.2-2.2 5.7-6c1.8-4.5-.2-8.5-5.7-14z"/></svg>'
  };

  var BEN_ICONS = {
    shield: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></svg>',
    droplet: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11z"/><path d="M9.5 14a2.5 2.5 0 0 0 2.5 2.5"/></svg>',
    sprout: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 21V9"/><path d="M12 9C12 5 9 3 5 3c0 4 3 6 7 6zM12 13c0-4 3-6 7-6 0 4-3 6-7 6z"/></svg>',
    sparkle: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 3v7a3 3 0 0 0 6 0V3M10 3v18"/><circle cx="17.5" cy="14.5" r="3.5"/><path d="M17.5 8v2M17.5 19v2M23 14.5h-2M14 14.5h-2"/></svg>',
    sun: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"/></svg>'
  };

  /* ─── روابط واتساب ومتفرقات ─── */
  function waLink(num, msg) {
    return "https://wa.me/" + num + (msg ? "?text=" + encodeURIComponent(msg) : "");
  }

  function HREFS(c) {
    return {
      waMain: waLink(c.site.whatsappMain, c.site.whatsappMessage),
      waStore: waLink(c.site.whatsappStore),
      tel: "tel:" + c.site.phoneTel,
      mail: "mailto:" + c.site.email,
      maps: c.site.mapsUrl,
      instagram: c.site.instagram,
      facebook: c.site.facebook,
      tiktok: c.site.tiktok
    };
  }

  function bindHrefs(root, c) {
    var map = HREFS(c);
    qsa("[data-href]", root).forEach(function (el) {
      var v = map[el.getAttribute("data-href")];
      if (v) el.setAttribute("href", v);
    });
  }

  function bindSiteTexts(root, c) {
    qsa("[data-t]", root).forEach(function (el) {
      var v = c.site[el.getAttribute("data-t")];
      if (v != null) el.textContent = v;
    });
  }

  function bindSiteLogos(root, c) {
    qsa("[data-site-logo]", root).forEach(function (img) {
      var type = (img.getAttribute("data-site-logo") || "navbar").toLowerCase();
      var src = "";
      if (type === "footer") {
        src = (c.site && (c.site.footerLogo || c.site.FooterLogo || c.site.footer_logo || c.site.logo)) || "";
      } else {
        src = (c.site && (c.site.NavbarLogo || c.site.navbarLogo || c.site.logo)) || "";
      }
      var wrap = img.closest(".logo") || img.closest(".ft-logo-c");
      if (!src) {
        img.removeAttribute("src");
        if (wrap) wrap.classList.remove("has-logo");
        return;
      }
      img.src = src;
      img.alt = (c.site.brandName || "SODFA");
      if (wrap) wrap.classList.add("has-logo");
    });
  }

  /* ─── مزامنة روابط الناف بار والفوتر مع حالة الأقسام ───
     القائمة (sectionList) هي المرجع المعتمد لمعرفة الأقسام المفعّلة.
     هذا المساعد يخفي تلقائياً روابط الـ navbar (سطح + جوال) والـ
     footer التي تشير إلى قسم معطّل (سواءً من CONFIG أو من لوحة
     الإعدادات)، حتى لا يضغط المستخدم على رابط لم يعد يقود إلى شيء. */
  var SECTION_ID_ALIASES = { home: "hero" }; // #home في الـ HTML يشير إلى قسم الـ hero
  function syncNavLinks() {
    var enabled = {};
    sectionList.forEach(function (s) {
      if (s && s.enabled) enabled[s.id] = true;
    });
    // الـ navbar (سطح + جوال) + الـ footer
    qsa('#nav a[href^="#"], .site-footer a[href^="#"]').forEach(function (a) {
      var href = a.getAttribute("href") || "";
      if (href.charAt(0) !== "#") return;
      var raw = href.slice(1);
      if (!raw) return;
      var sid = SECTION_ID_ALIASES[raw] || raw;
      var on = enabled[sid] === true;
      a.style.display = on ? "" : "none";
      a.setAttribute("aria-disabled", on ? "false" : "true");
    });
  }

  /* ─── إشعارات ─── */
  var toastEl = qs("#toast"),
    toastTxt = qs("#toastTxt"),
    toastT = null;

  function showToast(msg) {
    if (!toastOn) return;
    if (!toastTxt || !toastEl) return;
    toastTxt.textContent = msg;
    toastEl.classList.add("show");
    if (toastT) clearTimeout(toastT);
    toastT = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 3200);
  }

  /* ─── Loading Skeletons ─── */
  function skeletonFor(id) {
    if (id === "hero" || id === "soya-product-hero") return '<div class="sk-wrap"><div class="sk-col"><div class="sk" style="height:26px;width:40%"></div><div class="sk" style="height:56px;width:92%"></div><div class="sk" style="height:18px;width:80%"></div><div class="sk" style="height:48px;width:60%"></div></div><div class="sk sk-arch"></div></div>';
    if (id === "stats" || id === "trust" || id === "benefits" || id === "store") return '<div class="sk-band"><div class="sk" style="height:110px"></div></div>';
    if (id === "footer") return '<div class="sk-band" style="margin:0;border-radius:0"><div class="sk" style="height:220px"></div></div>';
    var cards = { oils: 4, flash: 2, cases: 2, products: 3, faq: 4, order: 4, contact: 2 }[id] || 4;
    var cols = (id === "products" || id === "order") ? "repeat(3,1fr)" : "repeat(2,1fr)";
    var h = (id === "cases" || id === "products" || id === "contact") ? 320 : 190;
    var items = "";
    for (var i = 0; i < cards; i++) items += '<div class="sk" style="height:' + h + 'px"></div>';
    return '<div class="wrap" style="padding:4rem 22px"><div class="sk" style="height:42px;width:55%;margin:0 auto 26px"></div><div class="sk-grid" style="grid-template-columns:' + cols + '">' + items + "</div></div>";
  }

  /* ─── تحميل ملف قسم ─── */
  var FETCH_TIMEOUT = 10000;
  var FETCH_RETRIES = 2;
  var SECTION_CACHE_VERSION = "2";

  function cacheBustUrl(file) {
    var sep = file.indexOf("?") === -1 ? "?" : "&";
    return file + sep + "v=" + SECTION_CACHE_VERSION + "_" + SODFA_VERSION;
  }

  function fetchWithTimeout(url) {
    return new Promise(function (resolve, reject) {
      var ctrl = null;
      if (window.AbortController) ctrl = new AbortController();
      var timer = setTimeout(function () {
        if (ctrl) ctrl.abort();
        reject(new Error("timeout"));
      }, FETCH_TIMEOUT);
      fetch(url, ctrl ? { signal: ctrl.signal } : {})
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.text();
        })
        .then(function (txt) { clearTimeout(timer);
          resolve(txt); })
        .catch(function (err) { clearTimeout(timer);
          reject(err); });
    });
  }

  function cacheGet(id) { try { return sessionStorage.getItem("sodfaSec_" + SECTION_CACHE_VERSION + "_" + id); } catch (e) { return null; } }

  function cacheSet(id, txt) { try { sessionStorage.setItem("sodfaSec_" + SECTION_CACHE_VERSION + "_" + id, txt); } catch (e) {} }

  function fetchSection(s, attempt) {
    attempt = attempt || 0;
    if (sectionCache[s.id]) return Promise.resolve(sectionCache[s.id]);
    return fetchWithTimeout(cacheBustUrl(s.file))
      .then(function (txt) {
        sectionCache[s.id] = txt;
        cacheSet(s.id, txt);
        return txt;
      })
      .catch(function (err) {
        var cached = cacheGet(s.id);
        if (cached) { sectionCache[s.id] = cached; return cached; }
        if (attempt < FETCH_RETRIES) {
          return new Promise(function (resolve, reject) {
            setTimeout(function () {
              fetchSection(s, attempt + 1).then(resolve, reject);
            }, 400 * (attempt + 1));
          });
        }
        err = err || new Error("unknown");
        err.section = s.id;
        throw err;
      });
  }

  function sectionErrorHTML(s, err) {
    var why = err && err.message ? String(err.message) : "";
    var detail = why === "timeout" ? "انتهت مهلة الاتصال — تحققي من الاتصال ثم أعدي المحاولة" :
      (why.indexOf("HTTP ") === 0 ? "الخادم أرجع: " + why + " (الملف غير موجود أو مساره خاطئ)" :
        "تعذر الوصول إلى الملف: " + s.file);
    return '<div class="load-error">تعذر تحميل هذا القسم' +
      '<small style="display:block;margin-top:.4rem;direction:ltr;font-size:.75rem">' + s.file + (why && why !== "timeout" && why.indexOf("HTTP ") !== 0 ? " — " + why : "") + "</small>" +
      '<small style="display:block;margin-top:.2rem;color:var(--accent-deep)">' + detail + "</small>" +
      '<button class="retry-btn" data-retry="' + s.id + '">إعادة المحاولة</button></div>';
  }

  function retrySection(id) {
    var s = null;
    sectionList.forEach(function (x) { if (x.id === id) s = x; });
    if (!s) return;
    var mount = qs('[data-section="' + id + '"]', app);
    if (!mount) return;
    mount.innerHTML = skeletonFor(s.id);
    fetchSection(s)
      .then(function (html) {
        mount.innerHTML = html;
        try {
          if (RENDER[s.id]) RENDER[s.id](mount, CONFIG);
          bindHrefs(mount, CONFIG);
          if (INIT[s.id]) INIT[s.id](mount, CONFIG);
          revealIn(mount);
        } catch (e) {
          console.error("خطأ في تهيئة القسم:", id, e);
        }
        applyStoreFlush();
        updateFallZoneClip();
      })
      .catch(function (err) {
        console.error("فشل تحميل القسم:", id, s.file, err && err.message);
        mount.innerHTML = sectionErrorHTML(s, err);
      });
  }

  /* ─── بناء الصفحة ─── */
  function clearTimers() { timers.forEach(function (t) { clearInterval(t); });
    timers = []; }

  function buildApp() {
    clearTimers();
    if (countersObs) countersObs.disconnect();
    app.innerHTML = "";
    var chain = Promise.resolve();
    sectionList.forEach(function (s) {
      if (!s.enabled) return;
      var mount = document.createElement(s.id === "hero" || s.id === "footer" ? "div" : "section");
      mount.setAttribute("data-section", s.id);
      mount.id = s.id;
      if (s.id === "stats" || s.id === "trust") mount.classList.add("band-wrap");
      mount.innerHTML = skeletonFor(s.id);
      app.appendChild(mount);
      chain = chain.then(function () {
        console.log("⏳ جارٍ تحميل القسم:", s.id);
        return fetchSection(s)
          .then(function (html) {
            console.log("✅ تم تحميل القسم:", s.id);
            mount.innerHTML = html;
            try {
              if (RENDER[s.id]) RENDER[s.id](mount, CONFIG);
              bindHrefs(mount, CONFIG);
              if (INIT[s.id]) INIT[s.id](mount, CONFIG);
              revealIn(mount);
            } catch (e) {
              console.error("❌ خطأ في تهيئة القسم:", s.id, e);
            }
          })
          .catch(function (err) {
            console.error("❌ فشل تحميل القسم:", s.id, s.file, err && err.message);
            mount.innerHTML = sectionErrorHTML(s, err);
          });
      });
    });
    chain.then(function () {
      applyStoreFlush();
      applyPageSettings();
      applyButtonSettings();
      bindGlobalUI();
      syncNavLinks();
      updateFallZoneClip();
      // 🔔 إرسال حدث لإعلام وحدة المراجعات بأن الصفحة جاهزة
      document.dispatchEvent(new CustomEvent('sodfa:ready'));
      console.log("🚀 تم بناء الصفحة بنجاح (الإصدار " + SODFA_VERSION + ")");
    });
  }

  function applyStoreFlush() {
    var last = null;
    sectionList.forEach(function (s) { if (s.enabled && s.id !== "footer") last = s.id; });
    document.documentElement.classList.toggle("store-flush", last === "store");
  }

  app.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-retry]");
    if (btn) retrySection(btn.getAttribute("data-retry"));
  });

  /* ─── Reveal ─── */
  var rvObs = null;

  function revealIn(root) {
    if (!rvObs) {
      rvObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var el = en.target;
          var d = parseInt(el.getAttribute("data-d") || "0", 10);
          setTimeout(function () { el.classList.add("in"); }, d);
          rvObs.unobserve(el);
        });
      }, { threshold: .12 });
    }
    qsa(".rv", root).forEach(function (el) { rvObs.observe(el); });
  }

  /* ─── عدادات الأرقام ─── */
  function initCounters(root) {
    if (countersObs) countersObs.disconnect();
    var fmt = function (n) { return n.toLocaleString("en-US"); };
    countersObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var target = parseInt(el.getAttribute("data-count"), 10);
        var pre = el.getAttribute("data-pre") || "";
        var suf = el.getAttribute("data-suf") || "";
        var t0 = null,
          dur = 1600;
        var step = function (ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1);
          var e = 1 - Math.pow(1 - p, 3);
          el.textContent = pre + fmt(Math.round(target * e)) + suf;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        countersObs.unobserve(el);
      });
    }, { threshold: .6 });
    qsa("[data-count]", root).forEach(function (el) { countersObs.observe(el); });
  }

  /* ═══════════════════════════════════════════════════════════════
     الأزهار/الأوراق المتساقطة
  ═══════════════════════════════════════════════════════════════ */
  function ensureGlobalFallZone() {
    var existing = document.getElementById("fallZone");
    if (existing && existing.parentElement !== document.body) {
      existing.parentElement.removeChild(existing);
      existing = null;
    }
    if (!existing) {
      existing = document.createElement("div");
      existing.id = "fallZone";
      existing.setAttribute("aria-hidden", "true");
      var firstChild = document.body.firstChild;
      if (firstChild) {
        document.body.insertBefore(existing, firstChild);
      } else {
        document.body.appendChild(existing);
      }
    }
    return existing;
  }

  function seedFallZone() {
    var fz = ensureGlobalFallZone();
    if (!fz || fz.dataset.seeded) return;
    for (var i = 0; i < 30; i++) {
      var el = document.createElement("span");
      var flower = i % 4 === 3;
      el.className = "faller " + (flower ? "flower" : "");
      var sz = flower ? 12 + Math.random() * 8 : 14 + Math.random() * 14;
      el.style.width = sz + "px";
      el.style.height = sz + "px";
      el.style.left = (2 + Math.random() * 94) + "%";
      el.style.opacity = (flower ? .35 + Math.random() * .25 : .22 + Math.random() * .28).toFixed(2);
      var dur = 12 + Math.random() * 11;
      el.style.animationDuration = dur + "s";
      el.style.animationDelay = (-Math.random() * dur) + "s";
      el.innerHTML = flower ? FLOWER : LEAF;
      fz.appendChild(el);
    }
    fz.dataset.seeded = "true";
  }

  function updateFallZoneClip() {
    var fz = document.getElementById("fallZone");
    if (!fz) return;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var top = vh;
    var ft = document.getElementById("footer");
    if (ft) {
      var r = ft.getBoundingClientRect();
      if (r.top < vh) top = Math.max(0, r.top);
    }
    fz.style.height = top + "px";
  }

  /* ─── بطاقة زيت واحدة ─── */
  function oilCardHTML(o, delayMs, extra) {
    return '<article class="oil-card' + (extra ? "" : " rv") + '"' + (extra ? "" : ' data-d="' + delayMs + '"') +
      (extra ? ' style="--d:' + delayMs + 'ms"' : '') + '>' +
      '<div class="oil-img"><span class="oil-num">' + o.num + '</span>' +
      '<img loading="lazy" src="' + o.img + '" alt="' + o.name + '"></div>' +
      '<div class="oil-body"><h3>' + o.name + ' <small>' + o.latin + '</small></h3><ul>' +
      o.points.map(function (pt) { return "<li>" + CHECK + pt + "</li>"; }).join("") +
      '</ul><span class="oil-tag">' + o.tag + "</span></div></article>";
  }

  /* ─── RENDER ── (يحتوي على جميع الأقسام ما عدا المراجعات) ─── */
  var RENDER = {
    hero: function (h, c) {
      var d = c.hero;
      setText(qs('[data-el="badge"]', h), d.badge);
      setHTML(qs('[data-el="title"]', h), d.h1a + ' <span class="grad">' + d.hl + "</span> " + d.h1b);
      setHTML(qs('[data-el="lead"]', h), d.lead);
      setText(qs('[data-el="rate"]', h), d.rate);
      setText(qs('[data-el="trustNote"]', h), d.trustNote);
      var stars = "";
      for (var i = 0; i < 5; i++) stars += STAR;
      setHTML(qs('[data-el="stars"]', h), stars);
      setSrc(qs('[data-el="heroImg"]', h), d.img);
    },

    "soya-product-hero": function (h, c) {
      var d = c.hero || {};
      setText(qs('[data-el="badge"]', h), d.badge || "منتج SODFA المميز");
      setHTML(qs('[data-el="title"]', h), (d.h1a || "سيروم") + ' <span class="grad">' + (d.hl || "الشعر الطبيعي") + "</span> " + (d.h1b || "بخلاصة الصويا"));
      setHTML(qs('[data-el="lead"]', h), d.lead || "");
      setText(qs('[data-el="rate"]', h), d.rate || "4.9 / 5");
      setText(qs('[data-el="trustNote"]', h), d.trustNote || "");
      var stars = "";
      for (var i = 0; i < 5; i++) stars += STAR;
      setHTML(qs('[data-el="stars"]', h), stars);
      setSrc(qs('[data-el="heroImg"]', h), d.img || "./assets/Image/product-hero.jpg");
    },

    stats: function (h, c) {
      fillList(h, c.stats.map(function (s, i) {
        return '<div class="stat rv" data-d="' + i * 80 + '"><div class="num"><span data-count="' + s.count + '" data-pre="' + (s.pre || "") + '" data-suf="' + (s.suf || "") + '">0</span></div><div class="lbl">' + s.label + "</div></div>";
      }).join(""));
    },

    trust: function (h, c) {
      fillList(h, c.trust.map(function (t, i) {
        return '<div class="tb-item rv" data-d="' + i * 80 + '"><span class="tb-ic">' + (ICONS[t.icon] || ICONS.leaf) + "</span><div><b>" + t.title + "</b><small>" + t.desc + "</small></div></div>";
      }).join(""));
    },

    flash: function (h, c) {
      fillList(h, c.flash.products.map(function (p, i) {
        return '<div class="fs-card rv" data-d="' + i * 120 + '"><div class="fs-img"><span class="fs-disc">' + p.discount + '</span><img loading="lazy" src="' + p.img + '" alt="' + p.title + '"></div>' +
          '<div class="fs-body"><div><h3>' + p.title + '</h3><div class="fs-rate"><b>' + p.rating + "</b> " + starSVG(14) + " <span>(" + p.reviews + " تقييم)</span></div></div>" +
          '<div><div class="fs-price"><b>' + p.price + "</b>" + (p.oldPrice ? "<s>" + p.oldPrice + "</s>" : "") + "</div>" +
          '<button class="fs-add" data-add="' + p.title + '">أضف إلى السلة</button></div></div></div>';
      }).join(""));
    },

    oils: function (h, c) {
      var delays = [0, 100, 150, 200];
      var all = c.oils || [];
      var first = all.slice(0, OILS_COLLAPSED_COUNT);
      var rest = all.slice(OILS_COLLAPSED_COUNT);
      fillList(h, first.map(function (o, i) {
        return oilCardHTML(o, delays[i] != null ? delays[i] : i * 100, false);
      }).join(""));
      var moreList = qs("[data-list-more]", h);
      if (moreList) {
        moreList.innerHTML = rest.map(function (o, i) {
          return oilCardHTML(o, Math.min(i * 55, 660), true);
        }).join("");
      }
    },

    benefits: function (h, c) {
      var delays = [0, 80, 160, 120, 200];
      fillList(h, c.benefits.map(function (b, i) {
        return '<div class="ben w' + b.span + ' rv" data-d="' + (delays[i] != null ? delays[i] : 0) + '"><span class="ghost">' + pad2(i + 1) + '</span><div class="ic">' + (BEN_ICONS[b.icon] || ICONS.leaf) + "</div><h3>" + b.title + "</h3><p>" + b.desc + "</p></div>";
      }).join(""));
      var vid = qs("#benefitsVideo", h);
      var band = qs("#benefitsBand", h);
      if (vid && c.site.benefitsVideoUrl) {
        vid.src = c.site.benefitsVideoUrl;
        vid.addEventListener("canplay", function () {
          vid.classList.add("ready");
          if (band) band.classList.add("video-on");
          vid.play().catch(function () {});
        });
        vid.addEventListener("error", function () { vid.style.display = "none"; });
      } else if (vid) vid.style.display = "none";
    },

    video: function (h, c) {
      var v = c.video || {};
      setText(qs('[data-el="eyebrow"]', h), v.eyebrow);
      setText(qs('[data-el="title"]', h), v.title);
      setText(qs('[data-el="desc"]', h), v.desc);
      setText(qs('[data-el="caption"]', h), v.caption);
      setSrc(qs('[data-el="poster"]', h), v.poster || c.hero.img);
    },

    cases: function (h, c) {
      fillList(h, c.cases.map(function (cs, i) {
        return '<article class="case rv" data-d="' + i * 120 + '"><div class="ba" data-ba>' +
          '<img class="after" src="' + cs.after + '" alt="' + (cs.afterAlt || "بعد الاستخدام") + '">' +
          '<img class="before" src="' + cs.before + '" alt="' + (cs.beforeAlt || "قبل الاستخدام") + '">' +
          '<span class="tag b">' + cs.beforeTag + '</span><span class="tag a">' + cs.afterTag + "</span>" +
          '<div class="handle"><div class="knob" tabindex="0" aria-label="اسحب للمقارنة"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/></svg></div></div>' +
          '<span class="hint"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/></svg>اسحب للمقارنة</span>' +
          '</div><div class="case-body"><div class="who"><h3>' + cs.name + "</h3><span>" + cs.period + "</span></div>" +
          '<blockquote>"' + cs.quote + '"</blockquote>' +
          '<div class="stars">' + starSVG(15) + starSVG(15) + starSVG(15) + starSVG(15) + starSVG(15) + "</div></div></article>";
      }).join(""));
    },

    about: function (h, c) {
      var d = c.about || {};
      var founder = c.founder || {};
      var aboutImg = qs('[data-el="aboutImg"]', h);
      var founderLogo = founder.logo || d.img || "";
      if (aboutImg) {
        if (founderLogo) {
          aboutImg.src = founderLogo;
          aboutImg.alt = founder.name ? ("مؤسس — " + founder.name) : "مؤسِّسة SODFA";
        } else {
          aboutImg.removeAttribute("src");
          aboutImg.alt = "مؤسِّسة SODFA";
        }
      }
      setText(qs('[data-el="badge"]', h), d.badge);
      setText(qs('[data-el="eyebrow"]', h), d.eyebrow);
      setText(qs('[data-el="title"]', h), d.title);
      setHTML(qs('[data-el="p1"]', h), (d.p1 || "").replace(/كريمة/, "<b>كريمة</b>"));
      setHTML(qs('[data-el="p2"]', h), (d.p2 || "").replace(/الدفع عند الاستلام/, "<b>الدفع عند الاستلام</b>").replace(/إمكانية الإرجاع/, "<b>إمكانية الإرجاع</b>"));
      setText(qs('[data-el="sig"]', h), founder.name || d.sig || "");
    },

    products: function (h, c) {
      var delays = [0, 100, 200];
      fillList(h, c.products.map(function (p, i) {
        return '<div class="pd-card rv" data-d="' + (delays[i] != null ? delays[i] : i * 100) + '"><div class="pd-img"><span class="pd-label">' + p.label + '</span><img loading="lazy" src="' + p.img + '" alt="' + p.title + '"></div>' +
          '<div class="pd-body"><h3>' + p.title + "</h3><p>" + p.desc + '</p><div class="pd-price">' + p.price + "</div>" +
          '<button class="pd-btn" data-order="' + p.title + '">اطلبي الآن</button></div></div>';
      }).join(""));
    },

    // ملاحظة: تم حذف RENDER.reviews بالكامل.

    faq: function (h, c) {
      fillList(h, c.faq.map(function (f, i) {
        return '<div class="faq-item rv" data-d="' + i * 60 + '"><button class="faq-q">' + f.q + '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button><div class="faq-a"><p>' + f.a + "</p></div></div>";
      }).join(""));
    },

    order: function (h, c) {
      fillList(h, c.orderSteps.map(function (s, i) {
        return '<div class="step-card rv" data-d="' + i * 100 + '"><div class="step-num">' + s.num + "</div><h3>" + s.title + "</h3><p>" + s.desc + '</p><span class="mini">' + s.mini + "</span></div>";
      }).join(""));
    },

    /* عرض السعر (قابل للتعديل بالكامل من CONFIG.pricing) */
    cta: function (h, c) {
      var block = qs('[data-el="ctaPrice"]', h);
      if (!block) return;
      var p = (c && c.pricing) || null;
      if (!p) return;
      if (p.label    != null) setText(qs('[data-el="priceLabel"]',    block), p.label);
      if (p.current  != null) setText(qs('[data-el="priceCurrent"]',  block), p.current);
      if (p.old      != null) setText(qs('[data-el="priceOld"]',      block), p.old);
      if (p.currency != null) {
        setText(qs('[data-el="priceCurrency"]', block), p.currency);
        // وحدة العملة القديمة تستخدم نفس النص ما لم يرد الحقل "oldCurrency"
        var oldUnit = qs('.cta-price-old-unit', block);
        if (oldUnit) setText(oldUnit, p.oldCurrency || p.currency);
      }
    },

    store: function (h, c) {
      bindSiteTexts(h, c);
      var frame = qs("#mapFrame", h);
      if (frame) frame.src = c.site.mapsEmbed;
    },

    contact: function (h, c) {
      bindSiteTexts(h, c);
    },

    footer: function (h, c) {
      bindSiteTexts(h, c);
    }
  };

  /* ─── INIT ── (تم حذف INIT.reviews) ─── */
  var INIT = {
    hero: function (h) {
      var sd = qs("#scrollDownBtn", h);
      if (sd) sd.addEventListener("click", function () {
        var first = null;
        qsa("[data-section]", app).forEach(function (el) {
          if (el.getAttribute("data-section") === "hero") return;
          if (!first) first = el;
        });
        if (first) first.scrollIntoView({ behavior: "smooth" });
      });
      var tilt = qs("#heroTilt", h);
      if (tilt && window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
        var sec = h;
        sec.addEventListener("mousemove", function (e) {
          var r = sec.getBoundingClientRect();
          var rx = ((e.clientY - r.top) / r.height - .5) * -7;
          var ry = ((e.clientX - r.left) / r.width - .5) * 7;
          tilt.style.transform = "rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg)";
        });
        sec.addEventListener("mouseleave", function () { tilt.style.transform = "rotateX(0deg) rotateY(0deg)"; });
      }
    },

    stats: function (h) { initCounters(h); },

    flash: function (h, c) {
      safeCountdown({
        d: qs('[data-fs="d"]', h),
        h: qs('[data-fs="h"]', h),
        m: qs('[data-fs="m"]', h),
        s: qs('[data-fs="s"]', h)
      }, Date.now() + (c.flash.hours || 60) * 3600 * 1000);
      qsa(".fs-add", h).forEach(function (b) {
        b.addEventListener("click", function () { showToast('تمت إضافة "' + b.getAttribute("data-add") + '" إلى السلة ✓'); });
      });
    },

    oils: function (h) {
      var more = qs("[data-more]", h);
      var btn = qs("[data-oils-toggle]", h);
      var label = qs("[data-oils-label]", h);
      if (!more || !btn) return;
      var hasExtra = qsa(".oil-card", more).length > 0;
      if (!hasExtra) {
        btn.style.display = "none";
        more.style.display = "none";
        return;
      }
      var COLLAPSED_TXT = "إظهار المزيد من الزيوت";
      var EXPANDED_TXT = "إخفاء الزيوت";
      var ANIM_MS = 780;
      var expanded = false;

      function reduceMotion() {
        return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      }

      function pinButton(ms) {
        if (reduceMotion()) return;
        var target = btn.getBoundingClientRect().top;
        var t0 = performance.now();

        function frame(t) {
          var y = btn.getBoundingClientRect().top;
          var d = y - target;
          if (d > 1 || d < -1) {
            try { window.scrollBy({ top: d, left: 0, behavior: "instant" }); } catch (e) { window.scrollBy(0, d); }
          }
          if (t - t0 < ms) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      }

      function showInitialOils() {
        expanded = false;
        btn.setAttribute("aria-expanded", "false");
        more.classList.remove("open");
        more.setAttribute("aria-hidden", "true");
        if (label) label.textContent = COLLAPSED_TXT;
      }

      function toggleOils() {
        expanded = !expanded;
        btn.setAttribute("aria-expanded", expanded ? "true" : "false");
        more.classList.toggle("open", expanded);
        more.setAttribute("aria-hidden", expanded ? "false" : "true");
        if (label) label.textContent = expanded ? EXPANDED_TXT : COLLAPSED_TXT;
        pinButton(ANIM_MS + 60);
      }
      btn.addEventListener("click", toggleOils);
      showInitialOils();
    },

    cases: function (h) {
      qsa("[data-ba]", h).forEach(function (sl) {
        var dragging = false;
        var setFromX = function (x) {
          var r = sl.getBoundingClientRect();
          var p = ((x - r.left) / r.width) * 100;
          p = Math.max(6, Math.min(94, p));
          sl.style.setProperty("--pos", p + "%");
          sl.classList.add("used");
        };
        sl.addEventListener("pointerdown", function (e) { dragging = true;
          sl.setPointerCapture(e.pointerId);
          setFromX(e.clientX); });
        sl.addEventListener("pointermove", function (e) { if (dragging) setFromX(e.clientX); });
        ["pointerup", "pointercancel"].forEach(function (ev) { sl.addEventListener(ev, function () { dragging = false; }); });
        var knob = qs(".knob", sl);
        knob.addEventListener("keydown", function (e) {
          var cur = parseFloat(getComputedStyle(sl).getPropertyValue("--pos")) || 50;
          if (e.key === "ArrowLeft") { sl.style.setProperty("--pos", Math.max(6, cur - 4) + "%");
            e.preventDefault(); }
          if (e.key === "ArrowRight") { sl.style.setProperty("--pos", Math.min(94, cur + 4) + "%");
            e.preventDefault(); }
          sl.classList.add("used");
        });
      });
    },

    products: function (h) {
      qsa(".pd-btn", h).forEach(function (b) {
        b.addEventListener("click", function () {
          window.open(waLink(CONFIG.site.whatsappMain, "أريد طلب: " + b.getAttribute("data-order")), "_blank");
        });
      });
    },

    // حُذف INIT.reviews بالكامل.

    faq: function (h) {
      qsa(".faq-item", h).forEach(function (item) {
        var q = qs(".faq-q", item),
          a = qs(".faq-a", item);
        q.addEventListener("click", function () {
          var open = item.classList.contains("open");
          qsa(".faq-item.open", h).forEach(function (o) { o.classList.remove("open");
            qs(".faq-a", o).style.maxHeight = null; });
          if (!open) { item.classList.add("open");
            a.style.maxHeight = a.scrollHeight + "px"; }
        });
      });
    },

    video: function (h) {
      var player = qs("#player", h);
      if (!player) return;
      player.addEventListener("click", function () { openVideoModal(); });
      player.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault();
          openVideoModal(); } });
    },

    cta: function (h) {
      safeDayCountdown({ h: qs('[data-cd="h"]', h), m: qs('[data-cd="m"]', h), s: qs('[data-cd="s"]', h) });
    },

    contact: function (h) {
      var form = qs("#contactForm", h);
      if (form) form.addEventListener("submit", function (e) {
        e.preventDefault();
        var btn = qs("#ctSend", h);
        if (btn) {
          btn.textContent = "✓ تم الإرسال";
          btn.classList.add("sent");
        }
        showToast("تم إرسال رسالتك بنجاح! سنتواصل معك قريباً 🌿");
        form.reset();
        setTimeout(function () {
          if (btn) {
            btn.textContent = "إرسال الرسالة";
            btn.classList.remove("sent");
          }
        }, 3000);
      });
    },

    footer: function (h) {
      var form = qs('[data-form="newsletter"]', h);
      if (form) form.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = qs('[data-el="nlEmail"]', h),
          btn = qs('[data-el="nlBtn"]', h);
        if (!input.value) return;
        btn.textContent = "✓ تم الاشتراك";
        showToast("تم اشتراكك في النشرة البريدية بنجاح 🌿");
        setTimeout(function () { btn.textContent = "اشتركي الآن";
          input.value = ""; }, 3000);
      });
      qsa("[data-legal]", h).forEach(function (btn) {
        btn.addEventListener("click", function () {
          var d = CONFIG.legal[btn.getAttribute("data-legal")];
          if (!d || !pageOn("legalModal")) return;
          qs("#legalTitle").textContent = d.title;
          qs("#legalBody").innerHTML = d.body;
          qs("#legalModal").classList.add("open");
          document.body.style.overflow = "hidden";
        });
      });
    }
  };

  /* ─── نوافذ عامة ─── */
  function openVideoModal() {
    if (!pageOn("videoModal")) return;
    var modal = qs("#videoModal");
    var holder = qs("#videoHolder"),
      sub = qs("#vmSub"),
      steps = qs("#vmSteps"),
      title = qs("#vmTitle");
    if (CONFIG.site.videoUrl && CONFIG.site.videoUrl.trim() !== "") {
      title.textContent = "الفيديو التوضيحي";
      sub.style.display = "none";
      steps.style.display = "none";
      holder.style.display = "block";
      holder.innerHTML = '<video src="' + CONFIG.site.videoUrl + '" controls autoplay playsinline></video>';
    } else {
      title.textContent = "كيف تعمل تركيبة SODFA؟";
      sub.style.display = "";
      steps.style.display = "";
      holder.style.display = "none";
      holder.innerHTML = "";
    }
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeVideoModal() { qs("#videoModal").classList.remove("open");
    document.body.style.overflow = "";
    qs("#videoHolder").innerHTML = ""; }
  qsa('#videoModal [data-close]').forEach(function (c) { c.addEventListener("click", closeVideoModal); });

  function openContact() {
    if (!pageOn("contactModal")) return;
    qs("#contactModal").classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeContact() { qs("#contactModal").classList.remove("open");
    document.body.style.overflow = ""; }
  qsa('[data-close-contact]').forEach(function (c) { c.addEventListener("click", closeContact); });
  qsa("#legalModal [data-close-legal]").forEach(function (c) { c.addEventListener("click", function () { qs("#legalModal").classList.remove("open");
      document.body.style.overflow = ""; }); });

  /* ─── إعدادات الأقسام / العناصر / الأزرار ─── */
  var PAGE_SETTINGS_DEFAULT = [
    { id: "newsletter", name: "النشرة البريدية", enabled: true },
    { id: "contact", name: "عمود التواصل (فوتر)", enabled: true },
    { id: "map", name: "خريطة الموقع", enabled: true },
    { id: "legal", name: "روابط الخصوصية / الشروط", enabled: true },
    { id: "footer", name: "تذييل الصفحة", enabled: true },
    { id: "leaves", name: "الأوراق المتساقطة", enabled: true },
    { id: "videoModal", name: "نافذة الفيديو", enabled: true },
    { id: "contactModal", name: "نافذة التواصل", enabled: true },
    { id: "legalModal", name: "نافذة الخصوصية / الشروط / الكوكيز", enabled: true },
    { id: "toast", name: "رسائل الإشعارات", enabled: true },
    { id: "preloader", name: "شاشة التحميل", enabled: true },
    { id: "scrollDown", name: "زر النزول للأسفل", enabled: true },
    { id: "scrollIndicator", name: "مؤشر التمرير", enabled: true },
    { id: "scrollProgress", name: "شريط تقدم التمرير", enabled: true },
    { id: "socialIcons", name: "أيقونات التواصل الاجتماعي", enabled: true }
  ];

  var BUTTONS_SETTINGS_DEFAULT = [
    { id: "waFab", name: "زر الواتساب العائم", position: "right", enabled: true },
    { id: "scrollTop", name: "زر العودة للأعلى", position: "left", enabled: true },
    { id: "bell", name: "زر الجرس (الإعدادات)", position: "right", enabled: false },
    { id: "theme", name: "استوديو الألوان", position: "right", enabled: false },
    { id: "videoPlay", name: "زر تشغيل الفيديو", position: "left", enabled: true }
  ];

  var STATE_VERSION = "4";

  (function () {
    var v = null;
    try { v = localStorage.getItem("sodfaStateVersion"); } catch (e) {}
    if (v !== STATE_VERSION) {
      try {
        localStorage.removeItem("sodfaSections");
        localStorage.removeItem("sodfaPage");
        localStorage.removeItem("sodfaPageSettings");
        localStorage.removeItem("sodfaButtons");
        localStorage.setItem("sodfaStateVersion", STATE_VERSION);
        console.log("🗑️ تم مسح الإعدادات المحفوظة القديمة (الإصدار الجديد " + STATE_VERSION + ")");
      } catch (e) {}
    }
  })();

  function loadSettingsDefaults() {
    return {
      page: (CONFIG && CONFIG.pageSettings && CONFIG.pageSettings.length) ? CONFIG.pageSettings : PAGE_SETTINGS_DEFAULT,
      buttons: (CONFIG && CONFIG.buttonsSettings && CONFIG.buttonsSettings.length) ? CONFIG.buttonsSettings : BUTTONS_SETTINGS_DEFAULT
    };
  }

  var pageState = loadState("sodfaPage", loadSettingsDefaults().page);
  var btnState = loadState("sodfaButtons", loadSettingsDefaults().buttons);

  function loadState(key, defaults) {
    try {
      var saved = JSON.parse(localStorage.getItem(key));
      if (saved && saved.length) {
        var out = [];
        defaults.forEach(function (d) {
          var found = null;
          saved.forEach(function (s) { if (s.id === d.id) found = s; });
          var o = {};
          for (var k in d) o[k] = (found && found[k] !== undefined) ? found[k] : d[k];
          out.push(o);
        });
        return out;
      }
    } catch (e) {}
    return defaults.map(function (s) { var o = {};
      for (var k in s) o[k] = s[k]; return o; });
  }

  function saveState(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }

  function pageOn(id) {
    for (var i = 0; i < pageState.length; i++) if (pageState[i].id === id) return pageState[i].enabled;
    return true;
  }

  function applyPageSettings() {
    pageState.forEach(function (s) {
      var on = s.enabled;
      switch (s.id) {
        case "leaves":
          document.body.classList.toggle("no-leaves", !on);
          var fz = ensureGlobalFallZone();
          if (fz) fz.style.display = on ? "" : "none";
          break;
        case "scrollProgress": { var pg = qs("#progress"); if (pg) pg.style.display = on ? "" : "none"; break; }
        case "map":
          var sb = qs("#storeBand");
          if (sb) sb.classList.toggle("map-off", !on);
          break;
        case "toast":
          toastOn = on;
          break;
        case "preloader": { var pl = qs("#preloader"); if (pl) pl.style.display = on ? "" : "none"; break; }
        default:
          qsa('[data-page="' + s.id + '"]').forEach(function (el) { el.style.display = on ? "" : "none"; });
      }
    });
  }

  function applyButtonSettings() {
    var sides = { left: [], right: [] };
    var bottomMap = {};
    qsa(".fbtn").forEach(function (el) { el.style.display = "none"; });
    btnState.forEach(function (s) {
      var el = qs('.fbtn[data-btn="' + s.id + '"]');
      if (!el || !s.enabled) return;
      var side = s.position === "left" ? "left" : "right";
      sides[side].push({ el: el, id: s.id });
    });
    ["left", "right"].forEach(function (side) {
      var other = side === "left" ? "right" : "left";
      sides[side].forEach(function (item, i) {
        var bot = 22 + i * 74;
        item.el.style.display = "";
        item.el.style[side] = "22px";
        item.el.style[other] = "auto";
        item.el.style.bottom = bot + "px";
        bottomMap[item.id] = bot;
      });
    });
    [
      ["theme", qs("#tPanel")],
      ["bell", qs("#bellPanel")]
    ].forEach(function (p) {
      var st = null;
      btnState.forEach(function (s) { if (s.id === p[0]) st = s; });
      var panel = p[1];
      if (!panel) return;
      if (!st || !st.enabled) return;
      var side = st.position === "left" ? "left" : "right";
      var other = side === "left" ? "right" : "left";
      panel.style[side] = "22px";
      panel.style[other] = "auto";
      var b = bottomMap[st.id];
      if (b != null) panel.style.bottom = (b + 70) + "px";
    });
  }

  /* ─── واجهة لوحة الجرس ─── */
  function renderSecMgr() {
    var mgr = qs("#secMgr");
    if (!mgr) return;
    mgr.innerHTML = "";
    sectionList.forEach(function (item, idx) {
      var row = document.createElement("div");
      row.className = "sec-row" + (item.enabled ? "" : " off");
      row.innerHTML = '<input type="checkbox" ' + (item.enabled ? "checked" : "") + ' aria-label="تفعيل ' + item.id + '">' +
        '<span class="s-name">' + sectionName(item.id) + "</span>" +
        '<span class="s-ord">' +
        '<button data-mv="-1" aria-label="تحريك لأعلى"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M18 15l-6-6-6 6"/></svg></button>' +
        '<button data-mv="1" aria-label="تحريك لأسفل"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg></button>' +
        "</span>";
      qs("input", row).addEventListener("change", function (e) {
        sectionList[idx].enabled = e.target.checked;
        saveState("sodfaSections", sectionList);
        buildApp();
        renderSecMgr();
      });
      qsa("[data-mv]", row).forEach(function (b) {
        b.addEventListener("click", function () {
          var dir = parseInt(b.getAttribute("data-mv"), 10);
          var ni = idx + dir;
          if (ni < 0 || ni >= sectionList.length) return;
          var t = sectionList[idx];
          sectionList[idx] = sectionList[ni];
          sectionList[ni] = t;
          saveState("sodfaSections", sectionList);
          buildApp();
          renderSecMgr();
        });
      });
      mgr.appendChild(row);
    });
  }

  function sectionName(id) {
    var names = { hero: "الواجهة الرئيسية", "soya-product-hero": "هيرو منتج الصويا", stats: "شريط الإحصائيات", trust: "شارات الثقة", flash: "التخفيضات السريعة", oils: "المكونات (الزيوت)", benefits: "مميزات السيروم", video: "الفيديو", cases: "النتائج قبل/بعد", about: "من نحن (قصتنا)", products: "منتجاتنا (المتجر)", faq: "الأسئلة الشائعة", order: "طريقة الطلب", cta: "العرض النهائي", store: "زيارة المتجر", contact: "التواصل", footer: "تذييل الصفحة" };
    // تم حذف "reviews" من القائمة لأنها أصبحت وحدة مستقلة.
    return names[id] || id;
  }

  function renderPageMgr() {
    var mgr = qs("#pageMgr");
    if (!mgr) return;
    mgr.innerHTML = "";
    pageState.forEach(function (item, idx) {
      var row = document.createElement("div");
      row.className = "sec-row" + (item.enabled ? "" : " off");
      row.innerHTML = '<input type="checkbox" ' + (item.enabled ? "checked" : "") + ' aria-label="تفعيل ' + item.id + '">' + '<span class="s-name">' + item.name + "</span>";
      qs("input", row).addEventListener("change", function (e) {
        pageState[idx].enabled = e.target.checked;
        saveState("sodfaPage", pageState);
        applyPageSettings();
        renderPageMgr();
      });
      mgr.appendChild(row);
    });
  }

  function renderBtnMgr() {
    var mgr = qs("#btnMgr");
    if (!mgr) return;
    mgr.innerHTML = "";
    btnState.forEach(function (item, idx) {
      var row = document.createElement("div");
      row.className = "sec-row" + (item.enabled ? "" : " off");
      row.innerHTML = '<input type="checkbox" ' + (item.enabled ? "checked" : "") + ' aria-label="تفعيل ' + item.id + '">' +
        '<span class="s-name">' + item.name + "</span>" +
        '<span class="pos-seg">' +
        '<button data-pos="right" class="' + (item.position !== "left" ? "active" : "") + '">يمين</button>' +
        '<button data-pos="left" class="' + (item.position === "left" ? "active" : "") + '">يسار</button>' +
        "</span>";
      qs("input", row).addEventListener("change", function (e) {
        btnState[idx].enabled = e.target.checked;
        saveState("sodfaButtons", btnState);
        applyButtonSettings();
        renderBtnMgr();
      });
      qsa("[data-pos]", row).forEach(function (b) {
        b.addEventListener("click", function () {
          btnState[idx].position = b.getAttribute("data-pos");
          saveState("sodfaButtons", btnState);
          applyButtonSettings();
          renderBtnMgr();
        });
      });
      mgr.appendChild(row);
    });
  }

  var bellFab = qs("#bellFab"),
    bellPanel = qs("#bellPanel");
  var tFab = qs("#tFab"),
    tPanel = qs("#tPanel");
  if (bellFab && bellPanel && tPanel) bellFab.addEventListener("click", function () { bellPanel.classList.toggle("open");
    tPanel.classList.remove("open"); });
  var bellClose = qs("#bellClose");
  if (bellClose && bellPanel) bellClose.addEventListener("click", function () { bellPanel.classList.remove("open"); });
  var openThemeFromBell = qs("#openThemeFromBell");
  if (openThemeFromBell && tPanel) openThemeFromBell.addEventListener("click", function () { bellPanel.classList.remove("open");
    tPanel.classList.add("open"); });

  qs("#resetAll").addEventListener("click", function () {
    var defs = loadSettingsDefaults();
    sectionList = CONFIG.sections.map(function (s) { return { id: s.id, file: s.file, enabled: s.enabled }; });
    pageState = defs.page.map(function (s) { var o = {};
      for (var k in s) o[k] = s[k]; return o; });
    btnState = defs.buttons.map(function (s) { return { id: s.id, name: s.name, position: s.position, enabled: s.enabled }; });
    saveState("sodfaSections", sectionList);
    saveState("sodfaPage", pageState);
    saveState("sodfaButtons", btnState);
    buildApp();
    renderSecMgr();
    renderPageMgr();
    renderBtnMgr();
    showToast("تمت استعادة جميع الإعدادات الافتراضية");
  });

  /* ─── استوديو الألوان ─── */
  var THEME_PRESETS = [
    { name: "زمردي فاخر", p: "#1E7A57", a: "#C6A15B", b: "#F7F3E8" },
    { name: "غابة عميقة", p: "#0F5132", a: "#D4AF37", b: "#F1F5EC" },
    { name: "نعناعي منعش", p: "#3BA98C", a: "#E0B06B", b: "#F0FAF5" },
    { name: "زيتوني دافئ", p: "#7A8450", a: "#C9A15B", b: "#F7F4EA" },
    { name: "تيل ملكي", p: "#0E7C7B", a: "#E3BE6C", b: "#EFF7F6" }
  ];

  var curTheme = null;
  var rootS = document.documentElement.style;
  var colP = qs("#colP"),
    colA = qs("#colA"),
    colB = qs("#colB");
  var valP = qs("#valP"),
    valA = qs("#valA"),
    valB = qs("#valB");
  var presetsWrap = qs("#tpPresets");

  function applyTheme(t, save) {
    curTheme = t;
    var p = t.p,
      a = t.a,
      b = t.b;
    rootS.setProperty("--brand", p);
    rootS.setProperty("--brand-deep", mix(p, "#04140e", .86));
    rootS.setProperty("--brand-deep2", mix(p, "#04140e", .68));
    rootS.setProperty("--brand-soft", lighten(p, .72));
    rootS.setProperty("--brand-tint", mix(b, lighten(p, .85), .5));
    var pr = hexToRgb(p);
    rootS.setProperty("--brand-glow", "rgba(" + pr[0] + "," + pr[1] + "," + pr[2] + ",0.3)");
    rootS.setProperty("--accent", a);
    rootS.setProperty("--accent-soft", lighten(a, .38));
    rootS.setProperty("--accent-deep", darken(a, .3));
    rootS.setProperty("--bg", b);
    rootS.setProperty("--bg2", mix(b, lighten(p, .55), .38));
    rootS.setProperty("--card", mix(b, "#ffffff", .72));
    rootS.setProperty("--ink", mix(p, "#06140e", .86));
    rootS.setProperty("--muted", mix(p, "#5a6b5f", .55));
    var lr = hexToRgb(mix(p, "#17402f", .5));
    rootS.setProperty("--line", "rgba(" + lr[0] + "," + lr[1] + "," + lr[2] + ",0.15)");
    colP.value = p;
    colA.value = a;
    colB.value = b;
    valP.textContent = p;
    valA.textContent = a;
    valB.textContent = b;
    qsa(".tp-preset", presetsWrap).forEach(function (btn) {
      var i = +btn.getAttribute("data-i"),
        ps = THEME_PRESETS[i];
      btn.classList.toggle("active", ps.p === curTheme.p && ps.a === curTheme.a && ps.b === curTheme.b);
    });
    if (save) { try { localStorage.setItem("sodfaTheme", JSON.stringify(t)); } catch (e) {} }
  }

  THEME_PRESETS.forEach(function (ps, i) {
    var btn = document.createElement("button");
    btn.className = "tp-preset";
    btn.setAttribute("data-i", i);
    btn.innerHTML = '<i style="background:linear-gradient(135deg,' + ps.p + " 55%, " + ps.a + ' 55%)"></i>' + ps.name;
    btn.addEventListener("click", function () { applyTheme({ p: ps.p, a: ps.a, b: ps.b }, true); });
    presetsWrap.appendChild(btn);
  });

  colP.addEventListener("input", function () { applyTheme({ p: colP.value, a: curTheme.a, b: curTheme.b }, false); });
  colA.addEventListener("input", function () { applyTheme({ p: curTheme.p, a: colA.value, b: curTheme.b }, false); });
  colB.addEventListener("input", function () { applyTheme({ p: curTheme.p, a: curTheme.a, b: colB.value }, false); });
  [colP, colA, colB].forEach(function (inp) { inp.addEventListener("change", function () { try { localStorage.setItem("sodfaTheme", JSON.stringify(curTheme)); } catch (e) {} }); });

  qs("#tpReset").addEventListener("click", function () { applyTheme({ p: THEME_PRESETS[0].p, a: THEME_PRESETS[0].a, b: THEME_PRESETS[0].b }, true); });

  if (tFab && tPanel) tFab.addEventListener("click", function () { tPanel.classList.toggle("open");
    bellPanel.classList.remove("open"); });
  var tpClose = qs("#tpClose");
  if (tpClose && tPanel) tpClose.addEventListener("click", function () { tPanel.classList.remove("open"); });

  var savedTheme = null;
  try { savedTheme = JSON.parse(localStorage.getItem("sodfaTheme")); } catch (e) {}
  applyTheme(savedTheme && savedTheme.p ? savedTheme : { p: THEME_PRESETS[0].p, a: THEME_PRESETS[0].a, b: THEME_PRESETS[0].b }, false);

  /* ─── ربط عناصر الواجهة الثابتة ─── */
  function bindGlobalUI() {
    bindHrefs(document, CONFIG);
    bindSiteTexts(qs("#contactModal"), CONFIG);
    qsa("[data-open-contact]").forEach(function (b) {
      if (b._bound) return;
      b._bound = true;
      b.addEventListener("click", function (e) { e.preventDefault();
        openContact(); });
    });
    var cForm = qs("#cForm");
    if (cForm && !cForm._bound) {
      cForm._bound = true;
      var cfSend = qs("#cfSend"),
        cfOrig = cfSend.innerHTML;
      cForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!cForm.checkValidity()) { cForm.reportValidity(); return; }
        cfSend.disabled = true;
        cfSend.textContent = "جارٍ الإرسال...";
        setTimeout(function () {
          cfSend.classList.add("sent");
          cfSend.innerHTML = "✓ تم إرسال رسالتك بنجاح";
          showToast("تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.");
          cForm.reset();
          setTimeout(function () { cfSend.classList.remove("sent");
            cfSend.innerHTML = cfOrig;
            cfSend.disabled = false;
            closeContact(); }, 1800);
        }, 900);
      });
    }
  }

  /* ─── التنقل والقوائم + قصّ طبقة الأزهار ─── */
  var navEl = qs("#nav"),
    prog = qs("#progress"),
    topBtn = qs("#topBtn");
  var fzClipTick = false;

  function onScroll() {
    if (navEl) navEl.classList.toggle("scrolled", window.scrollY > 10);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (prog) prog.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
    if (topBtn) topBtn.classList.toggle("show", window.scrollY > 600);
    if (!fzClipTick) {
      fzClipTick = true;
      requestAnimationFrame(function () { fzClipTick = false;
        updateFallZoneClip(); });
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { updateFallZoneClip(); });
  if (topBtn) topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

  var burger = qs("#burger"),
    mMenu = qs("#mMenu");
  if (burger && mMenu) burger.addEventListener("click", function () { burger.classList.toggle("open");
    mMenu.classList.toggle("open"); });
  if (mMenu) qsa("a,button", mMenu).forEach(function (a) { a.addEventListener("click", function () { burger.classList.remove("open");
      mMenu.classList.remove("open"); }); });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeVideoModal();
      closeContact();
      qs("#legalModal").classList.remove("open");
      document.body.style.overflow = "";
      tPanel.classList.remove("open");
      bellPanel.classList.remove("open");
    }
  });

  /* ─── SEO ─── */
  function applySeo() {
    var s = CONFIG.seo;
    if (!s) return;
    document.title = s.title;

    function meta(attr, key, val) {
      if (!val) return;
      var el = document.head.querySelector("meta[" + attr + '="' + key + '"]');
      if (!el) { el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el); }
      el.setAttribute("content", val);
    }
    meta("name", "description", s.description);
    meta("name", "keywords", s.keywords);
    meta("name", "author", s.author);
    meta("name", "robots", s.robots);
    meta("property", "og:title", s.title);
    meta("property", "og:description", s.description);
    meta("property", "og:image", s.ogImage);
    meta("property", "og:type", s.ogType || "website");
    meta("property", "og:locale", s.ogLocale);
    meta("property", "og:url", s.siteUrl);
    meta("name", "twitter:card", s.twitterCard);
    meta("name", "twitter:title", s.title);
    meta("name", "twitter:description", s.description);
    meta("name", "twitter:image", s.ogImage);
    var can = document.head.querySelector('link[rel="canonical"]');
    if (!can) { can = document.createElement("link");
      can.rel = "canonical";
      document.head.appendChild(can); }
    can.href = s.siteUrl;
  }

  /* ─── الإقلاع ─── */
  fetch("./assets/json/config.json")
    .then(function (res) {
      if (!res.ok) throw new Error("config");
      return res.json();
    })
    .then(function (cfg) {
      CONFIG = cfg;
      window.CONFIG = CONFIG; // 🔑 جعلها متاحة عالمياً لوحدة المراجعات وغيرها
      var defs = loadSettingsDefaults();
      pageState = loadState("sodfaPage", defs.page);
      btnState = loadState("sodfaButtons", defs.buttons);
      console.info("SODFA v" + SODFA_VERSION + " — النسخة المُنظَّفة (بدون مراجعات)");
      document.documentElement.setAttribute("data-sodfa-version", SODFA_VERSION);
      applySeo();
      bindSiteLogos(document, CONFIG);
      seedFallZone();
      updateFallZoneClip();

      var savedSections = null;
      try { savedSections = JSON.parse(localStorage.getItem("sodfaSections")); } catch (e) {}
      if (savedSections && savedSections.length) {
        var cfgIndex = {};
        CONFIG.sections.forEach(function (f, i) { cfgIndex[f.id] = i; });
        var placed = {};
        var ordered = [];
        savedSections.forEach(function (s) {
          var f = CONFIG.sections.find(function (x) { return x.id === s.id; });
          if (f && !placed[f.id]) {
            ordered.push({ id: f.id, file: f.file, enabled: s.enabled !== false });
            placed[f.id] = true;
          }
        });
        CONFIG.sections.forEach(function (f) {
          if (placed[f.id]) return;
          var idx = ordered.findIndex(function (o) { return cfgIndex[o.id] > cfgIndex[f.id]; });
          var item = { id: f.id, file: f.file, enabled: f.enabled };
          if (idx === -1) ordered.push(item);
          else ordered.splice(idx, 0, item);
          placed[f.id] = true;
        });
        sectionList = ordered;
      } else {
        sectionList = CONFIG.sections.map(function (s) { return { id: s.id, file: s.file, enabled: s.enabled }; });
      }

      buildApp();
      renderSecMgr();
      renderPageMgr();
      renderBtnMgr();
      bindSiteLogos(document, CONFIG);
      setTimeout(function () { qs("#preloader").classList.add("done"); }, 500);
    })
    .catch(function (err) {
      console.error("فشل تحميل ملف الإعدادات config.json:", err && err.message);
      var msg = 'تعذر تحميل ملف الإعدادات config.json';
      if (location.protocol === "file:") {
        msg += '<br>الموقع لا يعمل عند فتح الملف مباشرة من الجهاز (file://)<br>افتحي المشروع عبر خادم محلي:<br><small style="color:#999;direction:ltr">python -m http.server</small><br><small style="color:#999">أو Live Server في VS Code</small>';
      } else {
        msg += '<br>تأكدي من وجود الملف في المسار الصحيح:<br><small style="color:#999;direction:ltr">assets/json/config.json</small>';
      }
      app.innerHTML = '<div class="load-error" style="padding:6rem 1rem">' + msg + '<br><button class="retry-btn" data-retry-config>إعادة المحاولة</button></div>';
      qs("#preloader").classList.add("done");
    });

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-retry-config]");
    if (btn) location.reload();
  });

})();