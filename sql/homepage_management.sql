-- ============================================================================
-- SODFA — Homepage Management Schema
-- PostgreSQL (Supabase) — run in Supabase Dashboard → SQL Editor
-- Converts public/json/config.json into database tables managed by the dashboard.
-- ============================================================================

-- ============================================================================
-- 1) HOMEPAGE CONTENT BLOCKS (singleton JSON blocks)
--    Keys: site_info, hero, pricing, about, video, seo, legal, flash, order_steps
-- ============================================================================
create table if not exists public.homepage_content (
  key        text primary key,
  content    jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 2) TESTIMONIALS (homepage reviews section)
-- ============================================================================
create table if not exists public.testimonials (
  id          uuid         primary key default gen_random_uuid(),
  name        text         not null,
  city        text         not null default '',
  initials    text         not null default '',
  rating      numeric(2,1) not null default 5 check (rating >= 0 and rating <= 5),
  comment     text         not null default '',
  is_approved boolean      not null default true,
  sort_order  integer      not null default 0,
  created_at  timestamptz  not null default now()
);

-- ============================================================================
-- 3) FAQ
-- ============================================================================
create table if not exists public.faqs (
  id         uuid        primary key default gen_random_uuid(),
  question   text        not null,
  answer     text        not null default '',
  is_active  boolean     not null default true,
  sort_order integer     not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 4) BENEFITS (benefits section cards)
-- ============================================================================
create table if not exists public.benefits (
  id          uuid        primary key default gen_random_uuid(),
  icon        text        not null default 'shield',
  title       text        not null,
  description text        not null default '',
  col_span    integer     not null default 2,
  is_active   boolean     not null default true,
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now()
);

-- ============================================================================
-- 5) OILS (oils section)
-- ============================================================================
create table if not exists public.oils (
  id          uuid        primary key default gen_random_uuid(),
  display_num text        not null default '',
  image_url   text        not null default '',
  name        text        not null,
  latin_name  text        not null default '',
  points      jsonb       not null default '[]'::jsonb,
  tag         text        not null default '',
  is_active   boolean     not null default true,
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now()
);

-- ============================================================================
-- 6) STATS (animated counters)
-- ============================================================================
create table if not exists public.stats (
  id          uuid        primary key default gen_random_uuid(),
  count_value integer     not null default 0,
  prefix      text        not null default '',
  suffix      text        not null default '',
  label       text        not null default '',
  is_active   boolean     not null default true,
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now()
);

-- ============================================================================
-- 7) TRUST BADGES
-- ============================================================================
create table if not exists public.trust_badges (
  id          uuid        primary key default gen_random_uuid(),
  icon        text        not null default 'shield',
  title       text        not null,
  description text        not null default '',
  is_active   boolean     not null default true,
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now()
);

-- ============================================================================
-- 8) PAGE FEATURES (pageSettings: newsletter, map, leaves, preloader, ...)
-- ============================================================================
create table if not exists public.page_features (
  feature_key text    primary key,
  name        text    not null,
  is_enabled  boolean not null default true,
  sort_order  integer not null default 0
);

-- ============================================================================
-- 9) FLOATING BUTTONS (buttonsSettings: waFab, scrollTop, bell, theme, videoPlay)
-- ============================================================================
create table if not exists public.floating_buttons (
  button_key text    primary key,
  name       text    not null,
  position   text    not null default 'right' check (position in ('left', 'right')),
  is_enabled boolean not null default true,
  sort_order integer not null default 0
);

-- ============================================================================
-- INDEXES
-- ============================================================================
create index if not exists idx_testimonials_sort   on public.testimonials (sort_order);
create index if not exists idx_faqs_sort           on public.faqs (sort_order);
create index if not exists idx_benefits_sort       on public.benefits (sort_order);
create index if not exists idx_oils_sort           on public.oils (sort_order);
create index if not exists idx_stats_sort          on public.stats (sort_order);
create index if not exists idx_trust_badges_sort   on public.trust_badges (sort_order);
create index if not exists idx_page_features_sort  on public.page_features (sort_order);
create index if not exists idx_floating_buttons_sort on public.floating_buttons (sort_order);

-- ============================================================================
-- ROW LEVEL SECURITY
-- NOTE: policies below use auth.role() only — they intentionally do NOT
-- reference admin_users to avoid the infinite-recursion policy error.
-- Public (anon) can read published rows; authenticated users manage everything.
-- ============================================================================

alter table public.homepage_content enable row level security;
alter table public.testimonials     enable row level security;
alter table public.faqs             enable row level security;
alter table public.benefits         enable row level security;
alter table public.oils             enable row level security;
alter table public.stats            enable row level security;
alter table public.trust_badges     enable row level security;
alter table public.page_features    enable row level security;
alter table public.floating_buttons enable row level security;

-- homepage_content: everyone reads, authenticated writes
drop policy if exists homepage_content_public_read on public.homepage_content;
create policy homepage_content_public_read on public.homepage_content
  for select using (true);
drop policy if exists homepage_content_auth_write on public.homepage_content;
create policy homepage_content_auth_write on public.homepage_content
  for all to authenticated using (true) with check (true);

-- testimonials: anon reads approved only; authenticated full access
drop policy if exists testimonials_public_read on public.testimonials;
create policy testimonials_public_read on public.testimonials
  for select using (is_approved = true);
drop policy if exists testimonials_auth_all on public.testimonials;
create policy testimonials_auth_all on public.testimonials
  for all to authenticated using (true) with check (true);

-- faqs
drop policy if exists faqs_public_read on public.faqs;
create policy faqs_public_read on public.faqs
  for select using (is_active = true);
drop policy if exists faqs_auth_all on public.faqs;
create policy faqs_auth_all on public.faqs
  for all to authenticated using (true) with check (true);

-- benefits
drop policy if exists benefits_public_read on public.benefits;
create policy benefits_public_read on public.benefits
  for select using (is_active = true);
drop policy if exists benefits_auth_all on public.benefits;
create policy benefits_auth_all on public.benefits
  for all to authenticated using (true) with check (true);

-- oils
drop policy if exists oils_public_read on public.oils;
create policy oils_public_read on public.oils
  for select using (is_active = true);
drop policy if exists oils_auth_all on public.oils;
create policy oils_auth_all on public.oils
  for all to authenticated using (true) with check (true);

-- stats
drop policy if exists stats_public_read on public.stats;
create policy stats_public_read on public.stats
  for select using (is_active = true);
drop policy if exists stats_auth_all on public.stats;
create policy stats_auth_all on public.stats
  for all to authenticated using (true) with check (true);

-- trust_badges
drop policy if exists trust_badges_public_read on public.trust_badges;
create policy trust_badges_public_read on public.trust_badges
  for select using (is_active = true);
drop policy if exists trust_badges_auth_all on public.trust_badges;
create policy trust_badges_auth_all on public.trust_badges
  for all to authenticated using (true) with check (true);

-- page_features: everyone reads (site behavior), authenticated writes
drop policy if exists page_features_public_read on public.page_features;
create policy page_features_public_read on public.page_features
  for select using (true);
drop policy if exists page_features_auth_write on public.page_features;
create policy page_features_auth_write on public.page_features
  for all to authenticated using (true) with check (true);

-- floating_buttons: everyone reads, authenticated writes
drop policy if exists floating_buttons_public_read on public.floating_buttons;
create policy floating_buttons_public_read on public.floating_buttons
  for select using (true);
drop policy if exists floating_buttons_auth_write on public.floating_buttons;
create policy floating_buttons_auth_write on public.floating_buttons
  for all to authenticated using (true) with check (true);

-- ============================================================================
-- SEED DATA (from public/json/config.json)
-- Safe to re-run: inserts only when the key/row does not exist.
-- ============================================================================

-- ---- Content blocks ----
insert into public.homepage_content (key, content) values
(
  'site_info',
  '{
    "brandName": "SODFA",
    "logo": "/assets/Image/NavbarLogo.png",
    "navbarLogo": "/assets/Image/NavbarLogo.png",
    "footerLogo": "/assets/Image/FooterLogo.jpg",
    "tagline": "جمال · طبيعة · ثقة",
    "whatsappMain": "+212673932389",
    "whatsappMessage": "أريد طلب سيروم الشعر الطبيعي",
    "whatsappStore": "+212673932389",
    "phoneDisplay": "+212 673-932389",
    "phoneTel": "+212673932389",
    "email": "info@sodfa.com",
    "address": "حي شماعو سلا ، المغرب",
    "addressShort": "حي شماعو سلا، سلا",
    "mapsUrl": "https://www.google.com/maps/place/PHARMACIE+Hay+Chemaou/@34.0686493,-6.7982589,17z",
    "mapsEmbed": "https://maps.google.com/maps?q=PHARMACIE%20Hay%20Chemaou%2C%20Rabat%2C%20Maroc&z=15&output=embed",
    "hoursStore": "من الإثنين إلى السبت · 9:00 ص – 8:00 م",
    "hoursContact": "السبت - الخميس: 9:00 ص - 6:00 م",
    "instagram": "https://www.instagram.com/soodfa2026",
    "facebook": "https://web.facebook.com/profile.php?id=61590754402259",
    "tiktok": "https://www.tiktok.com/@karimayassmin",
    "videoUrl": "/assets/video/sodfa-serum.mp4",
    "benefitsVideoUrl": "/assets/video/sodfa-benefits.mp4"
  }'::jsonb
),
(
  'hero',
  '{
    "badge": "100% طبيعي • غني بالمغذيات",
    "h1a": "استعيدي",
    "hl": "كثافة شعرك",
    "h1b": "بتركيبة طبيعية",
    "lead": "سيروم فريد يجمع بين 16 زيتاً طبيعياً لعلاج التساقط، تغذية البصيلات، ومنح الشعر لمعاناً وكثافة تدوم طويلاً. <b>من الجذور حتى الأطراف، نتائج ملموسة خلال شهر.</b>",
    "rate": "4.9 / 5",
    "trustNote": "تقييم موثّق • نتائج مضمونة من أكثر من 8,500 عميلة وعميل",
    "img": "/assets/Image/product-hero.jpg"
  }'::jsonb
),
(
  'pricing',
  '{ "label": "الثمن اليوم", "current": 190, "old": 280, "currency": "د.م." }'::jsonb
),
(
  'about',
  '{
    "badge": "🌿 المؤسِّسة",
    "eyebrow": "من نحن",
    "title": "وراء كل قطرة، قصة وثقة",
    "p1": "أنا لوجين، بديت SODFA باش نوصّل لكل امرأة عناية طبيعية تستحقها، بجودة ما كتغلطش وثمن في متناول الجميع.",
    "p2": "عندنا الدفع عند الاستلام باش تكوني مطمئنة، وإمكانية الإرجاع باش تشري بثقة كاملة.",
    "founderName": "لوجين",
    "founderLogo": "/assets/Image/founder.png"
  }'::jsonb
),
(
  'video',
  '{
    "eyebrow": "شاهد التركيبة الطبيعية",
    "title": "تعرّف على كيفية عمل سيرومنا الفريد",
    "desc": "رحلة قصيرة من البذرة إلى القطرة — اضغط للتشغيل.",
    "caption": "الفيديو التوضيحي • 45 ثانية",
    "poster": "/assets/Image/HERO-original.png"
  }'::jsonb
),
(
  'seo',
  '{
    "metaTitle": "SODFA — استعيدي كثافة شعرك بتركيبة 100% طبيعية",
    "metaDescription": "سيروم SODFA الطبيعي بأربعة زيوت نادرة لعلاج تساقط الشعر وتغذية البصيلات. نتائج ملموسة خلال شهر. الدفع عند الاستلام وتوصيل سريع لجميع المناطق.",
    "metaKeywords": "سيروم الشعر, زيت أركان, تساقط الشعر, عناية طبيعية بالشعر, SODFA, صودفا, زيت الحبة السوداء",
    "author": "SODFA",
    "robots": "index, follow",
    "siteUrl": "https://www.sodfa.com",
    "ogImage": "/assets/Image/1786724734a9be.png",
    "ogType": "website",
    "ogLocale": "ar_MA",
    "twitterCard": "summary_large_image",
    "indexable": true
  }'::jsonb
),
(
  'legal',
  '{
    "privacy": { "title": "🔒 سياسة الخصوصية", "body": "<p><b>خصوصيتك أولويتنا.</b> نلتزم بحماية بياناتك الشخصية وعدم مشاركتها مع أي طرف ثالث.</p>" },
    "terms":   { "title": "📜 الشروط والأحكام", "body": "<p><b>الطلبات:</b> يتم تأكيد كل طلب عبر مكالمة هاتفية أو واتساب قبل الشحن.</p>" },
    "cookies": { "title": "🍪 سياسة الكوكيز", "body": "<p>نحفظ فقط تفضيلاتك المحلية في جهازك.</p>" }
  }'::jsonb
),
(
  'order_steps',
  '{
    "steps": [
      { "num": "1", "title": "اختاري", "desc": "تصفّحي التشكيلة واختاري اللي عجبك", "mini": "✦ خطوة سهلة" },
      { "num": "2", "title": "اطلبي", "desc": "عمّري معلوماتك ولا تواصلي واتساب", "mini": "✦ رد سريع" },
      { "num": "3", "title": "نأكّدو", "desc": "كنعيّطو ليك باش نأكّدو الطلب", "mini": "✦ مكالمة تأكيد" },
      { "num": "4", "title": "تخلّصي عند الاستلام", "desc": "توصلك لباب دارك، تشوفيها كيفما بغيتي، ومن بعد تخلّصي", "mini": "✦ دفع آمن" }
    ]
  }'::jsonb
)
on conflict (key) do nothing;

-- ---- Testimonials ----
insert into public.testimonials (name, city, initials, rating, comment, is_approved, sort_order)
select * from (values
  ('سعاد م.',      'الدار البيضاء', 'س', 5.0, 'الجودة فوق ما توقّعت، والتوصيل كان سريع. خلّصت من بعد ما شفت المنتج بعيني.', true,  0),
  ('نادية ل.',     'الرباط',        'ن', 5.0, 'خدمة راقية وتعامل محترم. السيروم جا بالضبط بحال الوصف.', true,  1),
  ('فاطمة الزهراء','مراكش',         'ف', 4.0, 'كنت خايفة نشري أونلاين، ولكن الدفع عند الاستلام طمّني.', true,  2),
  ('خديجة ب.',     'فاس',           'خ', 5.0, 'السيروم ريحتو زوينة وما كيخليش الشعر دهني. التساقط نقص بزاف.', true,  3),
  ('مريم أ.',      'طنجة',          'م', 4.0, 'طلبت واحد وجاني مغلف بطريقة أنيقة بزاف 🎁', true,  4),
  ('أمينة ر.',     'أكادير',        'أ', 5.0, 'مع SODFA شعري رجع كيتنفس، والقشرة مشات من الأسبوعين اللولين.', true,  5),
  ('سلمى ك.',      'وجدة',          'س', 5.0, 'خدمة العملاء محترمة بزاف، وصلني قبل الموعد.', true,  6),
  ('هدى ع.',       'تطوان',         'ه', 4.0, 'شعري كان خفيف ومتقصف، دابا ولا كثيف ولامع.', true,  7),
  ('رقية ط.',      'القنيطرة',      'ر', 5.0, 'الدفع عند الاستلام خلاني نجرّب بلا خوف.', true,  8),
  ('ليلى م.',      'سلا',           'ل', 4.0, 'ثاني مرة كنعاود نشري. منتوج يستاهل كل درهم.', true,  9),
  ('ياسمين ف.',    'مراكش',         'ي', 4.5, 'تجربة رائعة من أول طلب. كنصح بيه بقوة.', true, 10),
  ('زينب ق.',      'مكناس',         'ز', 3.5, 'المنتج جيد والنتيجة بدأت تظهر شيئاً فشيئاً.', false, 11)
) as seed(name, city, initials, rating, comment, is_approved, sort_order)
where not exists (select 1 from public.testimonials limit 1);

-- ---- FAQs ----
insert into public.faqs (question, answer, is_active, sort_order)
select * from (values
  ('متى ألاحظ النتائج الأولى؟', 'يلاحظ معظم المستخدمين انخفاض التساقط ولمعاناً أوضح خلال أول أسبوعين، بينما تبدأ الفراغات بالامتلاء بشكل ملحوظ بعد شهر إلى شهرين من الاستخدام المنتظم.', true, 0),
  ('هل يناسب السيروم جميع أنواع الشعر؟', 'نعم، تركيبتنا الطبيعية 100% مناسبة لجميع أنواع الشعر، بما في ذلك الشعر المصبوغ والمعالج وفروة الرأس الحساسة.', true, 1),
  ('كيف أستخدم السيروم بطريقة صحيحة؟', 'ضع بضع قطرات على فروة الرأس، دلّك بلطف لمدة دقيقتين، واتركه دون غسل. يُفضَّل استخدامه يومياً قبل النوم.', true, 2),
  ('هل توجد آثار جانبية؟', 'التركيبة خالية من البارابين والسلفات والعطور الصناعية وآمنة للاستخدام اليومي.', true, 3),
  ('هل يمكنني إرجاع المنتج إذا لم أكن راضية؟', 'نعم، يمكنك إرجاع المنتج خلال 48 ساعة من الاستلام إذا كان تالفاً أو مخالفاً للوصف.', true, 4),
  ('هل يمكنني شراء المنتج من المتاجر المحلية؟', 'حالياً، منتجات SODFA متاحة فقط عبر موقعنا الرسمي لضمان الأصالة والجودة.', true, 5)
) as seed(question, answer, is_active, sort_order)
where not exists (select 1 from public.faqs limit 1);

-- ---- Benefits ----
insert into public.benefits (icon, title, description, col_span, is_active, sort_order)
select * from (values
  ('shield',  'وقف التساقط',  'يقوي الجذور ويمنع التساقط المفرط من أول أسابيع الاستخدام.', 2, true, 0),
  ('droplet', 'علاج القشرة',  'يخفف الحكة ويهدئ فروة الرأس المتهيجة بعمق.', 2, true, 1),
  ('sprout',  'تطويل الشعر',  'يحفز النمو الصحي والسريع لبصيلات خاملة.', 2, true, 2),
  ('sparkle', 'تغذية عميقة',  'يمنح شعرك القوة والكثافة عبر تغذية البصيلات بالفيتامينات والأحماض الدهنية الأساسية.', 3, true, 3),
  ('sun',     'لمعان طبيعي',  'إشراقة ملحوظة ونعومة حريرية دون أي ملمس دهني أو ثِقل على الشعر.', 3, true, 4)
) as seed(icon, title, description, col_span, is_active, sort_order)
where not exists (select 1 from public.benefits limit 1);

-- ---- Oils ----
insert into public.oils (display_num, image_url, name, latin_name, points, tag, is_active, sort_order)
select * from (values
  ('01', '/assets/Image/Argan Oil.jpeg',            'زيت الأركان',              'Argan Oil',                 '["يغذي الشعر بعمق ويقويه","يحمي من أشعة الشمس والعوامل الخارجية","يمنح لمعاناً طبيعياً خلاباً"]'::jsonb, 'الذهب السائل للمغرب', true, 0),
  ('02', '/assets/Image/oils/AlmondOil.png',        'زيت اللوز',                'Almond Oil',                '["يعالج جفاف فروة الرأس","يقوي بصيلات الشعر من الجذور","يمنح نعومة استثنائية"]'::jsonb, 'غني بفيتامين E', true, 1),
  ('03', '/assets/Image/oils/CoconutOil.png',       'زيت جوز الهند',            'Coconut Oil',               '["يرطب بعمق ويمنع الجفاف","يحمي من التقصف والتلف اليومي","يعزز اللمعان الصحي"]'::jsonb, 'ترطيب استوائي عميق', true, 2),
  ('04', '/assets/Image/oils/BlackSeedOil.png',     'زيت الحبة السوداء',        'Black Seed Oil',            '["يعالج القشرة والالتهابات","يحفز نمو الشعر الخفيف","يمنح لمعاناً طبيعياً خلاباً"]'::jsonb, 'سرّ الكثافة القديم', true, 3),
  ('05', '/assets/Image/oils/SesameOil.png',        'زيت الجنجلان',             'Sesame Oil',                '["يرطّب فروة الرأس بعمق","غني بمضادات الأكسدة","يحمي الشعر من العوامل الخارجية"]'::jsonb, 'السمسم البلدي المعصور', true, 4),
  ('07', '/assets/Image/oils/PumpkinSeedOil.png',   'زيت بذور القرع',           'Pumpkin Seed Oil',          '["يحفز نمو الشعر ويقلل التساقط","غني بالزنك والمغنيسيوم","يدعم صحة البصيلات"]'::jsonb, 'سرّ الكثافة الأخضر', true, 5),
  ('08', '/assets/Image/oils/LavenderOil.png',      'زيت الخزامى',              'Lavender Oil',              '["يهدئ فروة الرأس المتهيجة","عطر طبيعي مهدئ","يحارب القشرة بلطف"]'::jsonb, 'هدوء اللافندر', true, 6),
  ('09', '/assets/Image/oils/CastorOil.png',        'زيت الخروع',               'Castor Oil',                '["يكثّف الشعر ويملأ الفراغات","يقوي الجذور والأطراف معاً","غني بفيتامين E"]'::jsonb, 'كثافة تقليدية مجرّبة', true, 7),
  ('11', '/assets/Image/oils/JojobaOil.png',        'زيت الجوجوبا',             'Jojoba Oil',                '["يشبه الزيوت الطبيعية للفروة","ينظم الإفرازات الدهنية","خفيف لا يترك ملمساً دهنياً"]'::jsonb, 'مرآة طبيعية للفروة', true, 8),
  ('13', '/assets/Image/oils/FenugreekOil.png',     'زيت الحلبة',               'Fenugreek Oil',             '["يحدّ من التساقط","يقوي جذور الشعر","يمنح حجماً ملحوظاً"]'::jsonb, 'حكمة الجدات القديمة', true, 9),
  ('14', '/assets/Image/oils/RosemaryOil.png',      'زيت إكليل الجبل',          'Rosemary Oil',              '["ينشط الدورة الدموية في الفروة","يحفز البصيلات الخاملة","يمنع التساقط التدريجي"]'::jsonb, 'منشط النمو الأول', true, 10)
) as seed(display_num, image_url, name, latin_name, points, tag, is_active, sort_order)
where not exists (select 1 from public.oils limit 1);

-- ---- Stats ----
insert into public.stats (count_value, prefix, suffix, label, is_active, sort_order)
select * from (values
  (8500, '+', '',  'عميلة وعميل سعداء',        true, 0),
  (97,   '',  '%', 'نسبة الرضا عن النتائج',     true, 1),
  (4,    '',  '',  'زيوت نادرة معصورة على البارد', true, 2),
  (30,   '',  '',  'يوماً لظهور النتائج الأولى', true, 3)
) as seed(count_value, prefix, suffix, label, is_active, sort_order)
where not exists (select 1 from public.stats limit 1);

-- ---- Trust badges ----
insert into public.trust_badges (icon, title, description, is_active, sort_order)
select * from (values
  ('cod',     'الدفع عند الاستلام', 'ماتخلّصيش حتى تشوفي السلعة', true, 0),
  ('returns', 'إرجاع مجاني',        'خلال 48 ساعة بلا أسئلة',     true, 1),
  ('truck',   'توصيل سريع',         '24 إلى 48 ساعة',             true, 2),
  ('shield',  'جودة مضمونة',        'منتجات مختارة بعناية',       true, 3)
) as seed(icon, title, description, is_active, sort_order)
where not exists (select 1 from public.trust_badges limit 1);

-- ---- Page features ----
insert into public.page_features (feature_key, name, is_enabled, sort_order) values
  ('newsletter',      'النشرة البريدية',                        true, 0),
  ('contact',         'عمود التواصل (فوتر)',                    true, 1),
  ('map',             'خريطة الموقع',                           true, 2),
  ('legal',           'روابط الخصوصية / الشروط',                true, 3),
  ('footer',          'تذييل الصفحة',                           true, 4),
  ('leaves',          'الأوراق المتساقطة',                      true, 5),
  ('videoModal',      'نافذة الفيديو',                          true, 6),
  ('contactModal',    'نافذة التواصل',                          true, 7),
  ('legalModal',      'نافذة الخصوصية / الشروط / الكوكيز',      true, 8),
  ('toast',           'رسائل الإشعارات',                        true, 9),
  ('preloader',       'شاشة التحميل',                           true, 10),
  ('scrollDown',      'زر النزول للأسفل',                       true, 11),
  ('scrollIndicator', 'مؤشر التمرير',                           true, 12),
  ('scrollProgress',  'شريط تقدم التمرير',                      true, 13),
  ('socialIcons',     'أيقونات التواصل الاجتماعي',              true, 14)
on conflict (feature_key) do nothing;

-- ---- Floating buttons ----
insert into public.floating_buttons (button_key, name, position, is_enabled, sort_order) values
  ('waFab',     'زر الواتساب العائم',   'right', true, 0),
  ('scrollTop', 'زر العودة للأعلى',     'left',  true, 1),
  ('bell',      'زر الجرس (الإعدادات)', 'right', true, 2),
  ('theme',     'استوديو الألوان',      'right', true, 3),
  ('videoPlay', 'زر تشغيل الفيديو',     'left',  true, 4)
on conflict (button_key) do nothing;

-- ============================================================================
-- DONE ✓
-- ============================================================================
