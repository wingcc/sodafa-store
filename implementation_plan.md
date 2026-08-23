# Shipping Integration Plan — Dashboard + Resources/Shipping

## 1. Analysis Summary

### Dashboard (Primary) — Already Native
- **Routing:** SPA state router `AppDashboard.tsx` `switch(currentPage)` + `useStore.currentPage: PageSection` + `Sidebar` `PageSection='shipping'` under Operations. No Next route per tab; entry `app/dashboard/page.tsx` renders `<App/>`.
- **Layout:** `app/dashboard/layout.tsx` (`'use client'`, auth gate via `createClient().auth.getSession()` + `onAuthStateChange`, ThemeProvider, `.dashboard-root` scope, LTR/RTL).
- **State:** Single zustand `useStore` at `app/dashboard/store/useStore.ts` — shipping slice `shippingZones: ShippingZone[], isLoadingShipping, shippingError, fetchShippingZones, addShippingZone, updateShippingZone, deleteShippingZone` with `ShippingZoneInput` `{name,cities:string[],methods:ShippingMethodInput[]}`. Mappers `mapZone`/`mapMethod`.
- **Types:** `app/dashboard/types/index.ts` `ShippingZone {id,name,cities:string[],methods:ShippingMethod[]}` `ShippingMethod {id,name,price,estimatedDays:string,freeShippingThreshold?:number}` `PageSection` includes `'shipping'`.
- **API:** `app/api/shipping/route.ts` (GET list with methods, POST zone/method via `createServerClient`+`createAdminClient`+`ShippingRepository`) and `app/api/shipping/[id]/route.ts` (GET/PUT/DELETE with method diff-sync). Standard `{success,data,error}` via `lib/api`.
- **DB Schema (2 tables):** `shipping_zones {id,name,cities JSONB,created_at}` + `shipping_methods {id,zone_id,name,price,estimated_days VARCHAR, free_shipping_threshold DECIMAL, created_at}` with FK CASCADE, RLS public read + admin full. Migrations `001_initial_schema.sql` + `005_checkout_and_orders.sql`.
- **UI:** `app/dashboard/pages/Shipping.tsx` ~1100-line monolith, 5 tabs `overview|zones|cities|delivery|settings` with `MoroccoMap` SVG, `Badge/StatCard/RefreshButton`, `ZoneModal/DeleteConfirm/StatusBadge/MethodLine/CityDetails/MethodEditor/SettingsTab/ZoneRow`. Dashboard.css scoped under `.dashboard-root`.
- **Geo:** `app/dashboard/data/moroccoCities.ts` 32 cities + `MOROCCO_BORDER` polygon (28 pts) + `MAP_BOUNDS` + `projectLatLon` + `CITY_ALIASES/normalizeCity`.

### Resources/Shipping (Reference) — Vite SPA
- **Stack:** `youware-react-template` Vite + `react-router-dom` + `zustand` `useDeliveryStore` + `react-hot-toast` + leaflet (empty) — incompatible with Dashboard Next.js SPA routing.
- **Structure:** `DeliveryManager.tsx` shell (sticky header+tabs, Toaster, 5 tabs) + `pages/delivery/{Overview,Zones,Cities,DeliveryMethods,Settings}Tab.tsx` decomposed + `components/{map/MoroccoMap.tsx (empty), ui/{Modal,SearchInput,StatusBadge,TabNavigation,LoadingSpinner}}` + `store/delivery.ts` + `types/delivery.ts` + `data/morocco-cities.ts` (40 cities, name_ar, population) + `api/delivery.ts` (mockZones + `deliveryService` via missing `api/supabase.ts` `getSupabase()`) + `supabase/{schema.sql (3 tables), seed.sql, SETUP.md}` + `index.css` (tailwind+leaflet+pulse) + `package.json`.
- **3-Table Schema:** `delivery_zones {id,name,description,is_active}` + `delivery_cities {id,name,name_ar,zone_id,lat,lng,is_active}` + `delivery_methods {id,city_id,zone_id,name,slug,price,estimated_days INT,estimated_hours,is_active}` — richer (per-city methods, geo, i18n) but incompatible with Dashboard's 2-table JSON-cities model.
- **UX Highlights:** 8-card overview + gradient progress + zones health table; Zones with SearchInput+clear + hover cards + city-chip cross-nav; Cities with Drop-Pin on map; DeliveryMethods global flat table with filters; Settings with connection badge + schema dump; reusable Modal (Esc, blur, body lock).

## 2. Merge / Reuse / Remove / Conflict Map

| Area | Action | Detail |
|------|--------|--------|
| **Routing** | **REUSE Dashboard** | Keep `AppDashboard.tsx` switch + `PageSection='shipping'` + Sidebar (Truck/Operations). **Remove** react-router-dom + DeliveryManager shell. |
| **Layout/Auth** | **REUSE Dashboard** | Keep `layout.tsx` auth gate + `.dashboard-root` scoping + ThemeProvider. Drop Resources Toaster/standalone header. |
| **Store** | **REUSE Dashboard** | Keep single `useStore` shipping slice. **Remove** `useDeliveryStore` (allCities/selectedCity/getStats). Port useful pure helpers (`getCityStatus`, `getStats`) as utils if needed inside Shipping.tsx (already has `zoneStatus/methodOf`). |
| **Types** | **REUSE Dashboard** | Keep `ShippingZone{cities:string[],methods:ShippingMethod[]}`. **Remove** Resources `DeliveryZone/City/DeliveryMethod` 3-table types; incompatible (would require DB migration + rewrite of repo/API). Add optional `freeShippingThreshold` already present. |
| **API/Supabase** | **REUSE Dashboard** | Keep `app/api/shipping` + `ShippingRepository` + `lib/supabase/*` singleton (anon/admin). **Remove** `deliveryService` + missing `api/supabase.ts` `getSupabase()` + mockZones. No new tables. |
| **DB Schema** | **REUSE Dashboard** | Keep 2-table schema (`001_initial_schema.sql`). **Do NOT run** `Resources/supabase/schema.sql` (would create orphan `delivery_*` tables, no data migration, break API). Optional future: migration adding `description/is_active` could be additive. |
| **Geo Data** | **MERGE** | Merge supplemental cities from Resources (population/name_ar) into `dashboard/data/moroccoCities.ts` while **preserving** `MOROCCO_BORDER`, `projectLatLon`, `normalizeCity`/`CITY_ALIASES`. Deduplicate by normalized name. |
| **UI — Tabs** | **ENHANCE in place** | Keep existing 5-tab Shipping.tsx. Backport valuable UX: (1) Overview: gradient progress bar + zones health table (Resources OverviewTab), (2) Zones: SearchInput with clear X, (3) Cities: clearable search + preserved normalizeCity, (4) Settings: threshold note already exists — optionally add schema reference. Drop-Pin deferred (needs per-city lat/lng table, future). |
| **Components** | **PORT + ADAPT** | Add reusable `SearchInput` (with clear X, dashboard palette `#d97706`) under `app/dashboard/components/ui/SearchInput.tsx`. Add reusable `Modal` (Esc, overlay, body lock) under `app/dashboard/components/ui/Modal.tsx` (adapt to dashboard palette `#0b2e22`). Keep existing `MoroccoMap` SVG (leaflet file empty). Keep `Badge/StatCard/RefreshButton`. |
| **Styles** | **SCOPE** | Do NOT copy `index.css` global `@tailwind` + leaflet CSS. Extract only animation utilities (`fadeIn/zoomIn/dropPinPulse/scrollbar`) into `app/dashboard/dashboard.css` under `.dashboard-root` scope. Dashboard already scopes all styles. |
| **Deps** | **REUSE Dashboard** | Dashboard already has `zustand @supabase/supabase-js lucide-react framer-motion`. **Remove** vite-only deps (react-router-dom, headlessui, cannon-es, three, react-leaflet) — not installed in Dashboard. Keep existing deps. |
| **Source dir** | **KEEP as reference** | Leave `app/Resources/Shipping/` untouched as reference (not imported by Dashboard). Add note in this file. No build impact (not under `pages` routing, just data files). |

## 3. Conflicts Resolved
- **Import paths:** `getSupabase from './supabase'` (missing) → `createClient from '@/lib/supabase/client'`.
- **Aliases:** `VITE_SUPABASE_URL` vs `NEXT_PUBLIC_SUPABASE_URL` → next publicConfig.
- **Component names:** `StatusBadge/StatCard/TabNavigation` duplicated → dashboard variants already exist; new `SearchInput/Modal` use unique names.
- **Duplicate types/stores/clients:** Resolved by consolidating on Dashboard variants.
- **Routing:** No new routes; `currentPage='shipping'` remains single Dashboard page; sub-tabs stay client state (`activeTab`).
- **CSS leakage:** Dashboard `.dashboard-root` scoping prevents global bleed; Resources leaflet CSS dropped.
- **Env:** No new vars; reuse existing Supabase URL/anon/service_role.

## 4. Steps Executed
1. Create `app/dashboard/components/ui/SearchInput.tsx` + `Modal.tsx` (scoped, dashboard palette).
2. Merge `morocco-cities.ts` → `moroccoCities.ts` (supplemental cities, keep border/normalizeCity).
3. Enhance `app/dashboard/pages/Shipping.tsx`: add SearchInput to cities search, add progress bar + zones table to overview, scope Resources animations into `dashboard.css`.
4. Verify: `npx tsc --noEmit --skipLibCheck` clean, `npm run build` succeeds, Shipping page mounts under Dashboard routing without new dependencies.
5. `app/Resources/Shipping` left as reference only, not imported.

## 5. Preservation Guarantees
- Dashboard navigation, auth, layouts, APIs, state, Supabase, existing Shipping CRUD (add/update/delete zones+methods) unchanged.
- Shipping UI retains dashboard palette `#0b2e22/#d97706/stone`, responsive grids, MoroccoMap SVG, existing flow.
