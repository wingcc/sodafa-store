# Dashboard Architecture Separation — Implementation Plan

## Current Architecture Analysis

### Project Structure Summary

The project is a Next.js 16 app (App Router, Tailwind CSS v4, React 19) with three areas:

| Area | Routes | Layout |
|------|--------|--------|
| Landing Page | `/` | Root `layout.tsx` → `Providers` → `PageShell` → `MainContent` |
| Store | `/store`, `/store/[id]` | Root `layout.tsx` → `Providers` → Store pages |
| Dashboard | `/dashboard` | Root `layout.tsx` → `Providers` → Dashboard `layout.tsx` |
| Other Website | `/checkout`, `/contact`, `/login`, `/register`, `/order-confirmation`, `/track-order` | Root layout |

### Key Problems Identified

1. **Shared Root Layout**: The Dashboard inherits `lang="ar" dir="rtl"` from the root `<html>`, but the Dashboard layout overrides this with `dir="ltr"` on its container div. This is fragile.

2. **Global CSS Leakage**: Three CSS sources load globally for ALL pages:
   - [globals.css](file:///c:/Users/Readcode/Desktop/my-beauty-store/sodafa-store/app/globals.css) — Tailwind v4, fonts, theme variables, scrollbar styling
   - [style.css](file:///c:/Users/Readcode/Desktop/my-beauty-store/sodafa-store/app/Resources/assets/css/style.css) (~83KB) — Full SODFA website styles with `* { margin:0; padding:0 }`, `body { ... }`, `a`, `button`, `h1-h3` element selectors, etc. This is a **website-only** stylesheet that leaks into the Dashboard.
   - [tailwind.css](file:///c:/Users/Readcode/Desktop/my-beauty-store/sodafa-store/app/styles/tailwind.css) — Located in `app/styles/` but only imported by `app/styles/index.css` which is **never imported** by any file (dead code). Contains dashboard-related `.sidebar-link`, `.chart-tooltip` classes mixed with website utilities.

3. **Provider Pollution**: The root [providers.tsx](file:///c:/Users/Readcode/Desktop/my-beauty-store/sodafa-store/app/providers.tsx) wraps everything in `UIProvider` (cart/search/checkout state), `ThemeProvider`, and `LanguageProvider`. It already conditionally hides website modals for dashboard routes, but the Dashboard still gets all providers.

4. **Duplicate Sidebar**: The dashboard `layout.tsx` renders `<Sidebar />` and then `AppDashboard.tsx` renders `<DashboardLayout>` which renders `<Sidebar />` again along with `<Header />`.

---

## Proposed Changes

### 1. Website Route Group `(website)/`

Move all non-dashboard routes into a `(website)` route group. This creates a clean layout boundary.

> [!IMPORTANT]
> Route groups don't change URLs. `/store` stays `/store`, `/contact` stays `/contact`, etc.

#### [NEW] `app/(website)/layout.tsx`
- Website-specific layout wrapper
- Imports and renders the website-specific providers (UIProvider, LanguageProvider, ThemeProvider)
- Renders `CartDrawer`, `SearchDialog`, `CheckoutFormModal`, `FloatingWhatsappButton`
- Sets `dir="rtl"` on the wrapper (not on `<html>`)

#### [MOVE] Website routes into `(website)/`
Move these directories/files into `app/(website)/`:
- `page.tsx` → `(website)/page.tsx`
- `App.tsx` → `(website)/App.tsx`
- `store/` → `(website)/store/`
- `checkout/` → `(website)/checkout/`
- `contact/` → `(website)/contact/`
- `order-confirmation/` → `(website)/order-confirmation/`
- `track-order/` → `(website)/track-order/`
- `login/` → `(website)/login/`
- `register/` → `(website)/register/`
- `resend-confirmation/` → `(website)/resend-confirmation/`
- `not-found.tsx` → `(website)/not-found.tsx`

Directories that are NOT routes but shared code (components, contexts, sections, hooks, etc.) remain in `app/`.

---

### 2. Separate CSS Responsibilities

#### [MODIFY] `app/globals.css`
Keep only truly global concerns:
- `@import "tailwindcss"`
- Font-face declarations (Inter, Amiri, Tajawal)
- Tailwind `@theme inline` block
- `:root` and `.dark` CSS variables
- Minimal base layer (body background/color, `overflow-x: hidden`)
- Accordion keyframes and utilities

**Remove from globals.css:**
- `@import "./Resources/assets/css/style.css"` — This is website-only
- Scrollbar styles (will be duplicated into website and dashboard separately)
- Toast styles (website-only)
- `.animate-fade-up` (website-only)

#### [NEW] `app/(website)/website.css`
- `@import "../Resources/assets/css/style.css"`
- Scrollbar styles (website variant with green thumb)
- Toast notification styles
- `.animate-fade-up`

This file will be imported in `app/(website)/layout.tsx`.

#### [NEW] `app/dashboard/dashboard.css`
- Dashboard-specific scrollbar styles
- Any dashboard-specific utility classes from `tailwind.css` (`.sidebar-link`, `.chart-tooltip`)
- Dashboard CSS variables/overrides if needed

---

### 3. Simplify Root Layout

#### [MODIFY] `app/layout.tsx`
- Remove website-specific providers from the root
- Keep only: HTML structure, global CSS import, fonts, `ToastSettingsProvider`, `ToastProvider`
- Remove hard-coded `lang="ar" dir="rtl"` from `<html>` — the website layout will set direction

> [!WARNING]
> The root `<html>` currently has `lang="ar" dir="rtl"`. The Dashboard uses `dir="ltr"`. After refactoring:
> - Root `<html>` will have no `dir` attribute (default LTR)
> - The website layout wrapper will set `dir="rtl"` on its container
> - The dashboard layout will use `dir="ltr"` explicitly

#### [MODIFY] `app/providers.tsx`
- Remove the `isDashboard` conditional logic
- Remove website-only imports (CartDrawer, SearchDialog, etc.)
- Simplify to only contain providers that are genuinely global (Toast)
- Or remove entirely if no truly global providers remain beyond Toast

---

### 4. Fix Dashboard Layout Duplication

#### [MODIFY] `app/dashboard/layout.tsx`
- Import `dashboard.css`
- Already has Sidebar and auth check — keep as-is
- Wrap children in a `.dashboard-root` container for CSS scoping

#### [MODIFY] `app/dashboard/AppDashboard.tsx`
- Remove the duplicate `<DashboardLayout>` wrapper (which renders a second Sidebar)
- Keep only the page-switching logic with Header rendered directly

#### [MODIFY] `app/dashboard/components/layout/DashboardLayout.tsx`
- Refactor to render only Header + main content area (remove Sidebar since layout.tsx already renders it)
- Or remove this component if AppDashboard can use Header directly

---

### 5. Provider Separation

| Provider | Scope | Where |
|----------|-------|-------|
| `ToastSettingsProvider` | Global | Root `layout.tsx` |
| `ToastProvider` | Global | Root `layout.tsx` |
| `UIProvider` (cart, search, checkout, mobile menu) | Website only | `(website)/layout.tsx` |
| `ThemeProvider` (brand colors, dark mode) | Website + Dashboard shared | Root `layout.tsx` |
| `LanguageProvider` | Website only | `(website)/layout.tsx` |

> [!NOTE]
> The `ThemeProvider` manages brand colors used by both website and dashboard (via CSS variables like `--color-gold`, etc.), so it stays global. If the dashboard doesn't use `useTheme()` or these CSS variables, it can be moved to website-only. Let me know your preference.

---

### 6. Files Summary

#### Files to Create
| File | Purpose |
|------|---------|
| `app/(website)/layout.tsx` | Website-specific layout with RTL, providers, modals |
| `app/(website)/website.css` | Website-specific styles (Resources CSS import, scrollbar, toast) |
| `app/dashboard/dashboard.css` | Dashboard-scoped styles |

#### Files to Move (rename path)
| From | To |
|------|-----|
| `app/page.tsx` | `app/(website)/page.tsx` |
| `app/App.tsx` | `app/(website)/App.tsx` |
| `app/store/` | `app/(website)/store/` |
| `app/checkout/` | `app/(website)/checkout/` |
| `app/contact/` | `app/(website)/contact/` |
| `app/order-confirmation/` | `app/(website)/order-confirmation/` |
| `app/track-order/` | `app/(website)/track-order/` |
| `app/login/` | `app/(website)/login/` |
| `app/register/` | `app/(website)/register/` |
| `app/resend-confirmation/` | `app/(website)/resend-confirmation/` |
| `app/not-found.tsx` | `app/(website)/not-found.tsx` |

#### Files to Modify
| File | Change |
|------|--------|
| `app/layout.tsx` | Simplify — remove website providers, adjust html attributes |
| `app/globals.css` | Remove website-only imports and styles |
| `app/providers.tsx` | Simplify or remove — move website providers to website layout |
| `app/dashboard/layout.tsx` | Import dashboard.css, add `.dashboard-root` wrapper |
| `app/dashboard/AppDashboard.tsx` | Fix duplicate Sidebar/DashboardLayout issue |
| `app/dashboard/components/layout/DashboardLayout.tsx` | Remove Sidebar (already in layout.tsx) |

---

## Open Questions

> [!IMPORTANT]
> **ThemeProvider scope**: The `ThemeProvider` sets CSS variables (`--color-darkGreen`, `--color-gold`, etc.) and manages light/dark mode. The Dashboard [loading.tsx](file:///c:/Users/Readcode/Desktop/my-beauty-store/sodafa-store/app/dashboard/loading.tsx) uses `var(--color-mediumGreen)` and `var(--color-gold)`. Should the ThemeProvider remain global (serving both website and dashboard), or should the dashboard use its own hard-coded color values from [colors.ts](file:///c:/Users/Readcode/Desktop/my-beauty-store/sodafa-store/app/dashboard/theme/colors.ts)?

> [!IMPORTANT]
> **Dashboard DashboardLayout + Sidebar duplication**: Currently `layout.tsx` renders `<Sidebar />` and then `AppDashboard.tsx` wraps content in `<DashboardLayout>` which also renders `<Sidebar />`. This appears to result in **two sidebars**. Should I:
> 1. Keep Sidebar only in `layout.tsx` (the Next.js route layout) and remove it from `DashboardLayout.tsx`?
> 2. Or move all UI (Sidebar + Header) into `DashboardLayout.tsx` and make `layout.tsx` minimal (just auth + CSS)?

---

## Verification Plan

### Automated Tests
```bash
npm run lint
npm run build
```

### Manual Verification
After build succeeds:
- Verify `/` (Landing Page) loads correctly with RTL, Arabic fonts, all sections
- Verify `/store` loads with products, Navbar, Footer
- Verify `/dashboard` loads with LTR, Sidebar, Header, auth check
- Verify no CSS leakage: Dashboard should not have SODFA website styles; website should not have dashboard styles
- Verify route navigation between areas works correctly
