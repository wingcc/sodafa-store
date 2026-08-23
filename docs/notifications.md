# Notification System — Documentation

> **Source of truth:** Current `app/dashboard/pages/Notifications.tsx` visuals (exact, do not redesign) + existing Supabase `notifications` table.  
> All surfaces (Center, Bell/Popup, Settings) share one `useStore` state, one `notifications` table, and one icon system (`notificationVisuals.tsx`).

---

## 1. Data model

**Table:** `public.notifications` (`supabase/migrations/001_initial_schema.sql` + `008_notification_enhancements.sql` + `009_additional_notification_types.sql`)

| column | type | notes |
|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `type` | `notification_type` enum | 20 types: `order` `review` `product` `payment` `shipping` `promotion` `system` `social` `inventory` `security` `account` `message` `achievement` `reminder` `subscription` `support` `analytics` `team` `event` `custom` + legacy aliases `customer`→`social`, `stock`→`inventory` (`notificationVisuals.tsx:24`) |
| `title` | `varchar(255)` |  |
| `message` | `text` | full content |
| `read` | `boolean` | default `false` |
| `starred` | `boolean` | default `false` — **008** |
| `priority` | `notification_priority` enum | `low` `medium` `high` `urgent`, default `medium` — **008** |
| `metadata` | `jsonb` | `{ orderId, customerId, ... }` — **008** |
| `action_url` | `varchar(500)` | e.g. `/dashboard/orders/<id>` |
| `timestamp` | `timestamptz` | `NOW()` |

**No duplicate table.** `008` + `009` are additive and idempotent (`IF NOT EXISTS`, `DO ... EXCEPTION WHEN duplicate_object`, `COMMIT;` for 55P04).

> **Manual step (once):** Supabase Dashboard → SQL Editor → run `008_notification_enhancements.sql` then `009_additional_notification_types.sql` (each contains `COMMIT;` to fix `55P04: unsafe use of new value`).  
> The app has a **runtime fallback** (`lib/db/repositories/notification.ts:26`) so it works before migrations (new-type filters return 0 or fallback to `system`, `starred`/`priority` in-memory), but those fields are only **persisted** after migrations. `type::text` + `invalid input value for enum` handling covers pre-migration `account`..`custom`.

---

## 2. Shared types & visuals (source of truth)

- **DB:** `lib/supabase/types.ts` → `notification_type` (20 values + 2 legacy aliases), `notification_priority`, `NotificationRow/Insert/Update` (`starred/priority/metadata`)
- **App:** `app/dashboard/types/index.ts` → `NotificationType` (20 + 2 legacy), `NotificationPriority`, `Notification { id, type, title, message, read, starred, priority, timestamp, actionUrl?, metadata? }` — full 20 per `Notification Types & Constants` spec
- **Visuals (single source of truth, per spec §4):** `app/dashboard/components/notifications/notificationVisuals.tsx`
  - `getTypeIcon(type,size)` / `getTypeClasses(type)` — `bg-*-50 text-*-600 border-*-200` subtle bg, `rounded-xl border`, icon `600` (Center reference)
  - `getHeaderBg` / `getHeaderIcon` — **same** as Center: `bg-*-50 text-*-700+ border-*-200` transparent/subtle bg, border + icon same family, icon very dark (`700`/`800`), `rounded-xl border` — used by `Header.tsx` popup so Center = Popup = Settings
  - `getPriorityClasses` / `getCategoryLabel` / `formatRelativeTime`
  - **All 20 types** mapped (`order` `#4F46E5` `ShoppingBag`, `review` `#F59E0B` `Star`, `product` `#3B82F6` `Package`, `payment` `#10B981` `CreditCard`, `shipping` `#06B6D4` `Truck`, `promotion` `#EC4899` `Gift`, `system` `#6B7280` `Info`, `social` `#8B5CF6` `User`, `inventory` `#F97316` `TrendingUp`, `security` `#EF4444` `ShieldAlert`, `account` `#6366F1` `Settings`, `message` `#0EA5E9` `MessageSquare`, `achievement` `#F59E0B` `Award`, `reminder` `#8B5CF6` `Calendar`, `subscription` `#059669` `Bell`, `support` `#3B82F6` `Headphones`, `analytics` `#7C3AED` `BarChart3`, `team` `#14B8A6` `UsersRound`, `event` `#F43F5E` `Megaphone`, `custom` `#6B7280` `Plus`)

---

## 3. Repository — `lib/db/repositories/notification.ts`

```ts
class NotificationRepository {
  findAll(filters: { status?: 'all'|'unread'|'read'|'bookmarked', type?: string, priority?: string, search?: string, limit?: number, offset?: number })
  findById(id)
  create(insert)
  update(id, patch)           // { read?, starred?, priority?, ... }
  markAsRead / markAsUnread / toggleStarred
  markAllAsRead()
  delete / bulkDelete / bulkMarkRead
  getUnreadCount / getStarredCount / getCounts
}
```

- Server-side pagination via `range(offset, offset+limit-1)` + `count: 'exact'`
- `starred`/`priority` filters and `metadata` are resilient to pre-migration DB (in-memory fallback, `Could not find ... column` handled).

---

## 4. API — `app/api/admin/notifications/route.ts` (service-role, bypasses RLS)

| method | query / body | effect |
|---|---|---|
| `GET ?status=all|unread|read|bookmarked&type=...&priority=low|medium|high|urgent&search=...&limit=20&offset=0` | `200 { success, data: NotificationRow[], meta: { total, unreadCount, starredCount, limit, offset } }` |
| `PATCH ?id=ID` + `body: { read?: boolean, starred?: boolean }` (or `?starred=true&read=false`) | update one; legacy `?id` alone → mark read |
| `PUT` | mark all read |
| `POST body: { ids: string[], action: 'delete'|'markRead'|'markUnread' }` | bulk |
| `DELETE ?id=ID` | delete one |

Auth: `middleware.ts` protects `/api/admin/*` (requires `sb-*auth-token` cookie). All handlers use `createAdminClient()`.

**Preferences:** `app/api/admin/notifications/preferences/route.ts` — `GET`/`PUT` 22 keys (`notify_new_orders`, `notify_low_stock`, `notify_new_reviews`, `notify_payments`, `notify_daily_reports`, `notify_system_errors`, `notify_security_events`, `notify_new_customers` + `notify_product`/`notify_shipping`/`notify_promotion`/`notify_social` (008) + `notify_account`/`notify_message`/`notify_achievement`/`notify_reminder`/`notify_subscription`/`notify_support`/`notify_analytics`/`notify_team`/`notify_event`/`notify_custom` (009)). Used by `NotificationService` (22-key `typeMap`) and `NotificationSettings.tsx` (22 toggles).

---

## 5. Store — `app/dashboard/store/useStore.ts` (zustand, single source of truth)

```ts
notifications: Notification[]
unreadNotifications: number      // from meta.unreadCount
starredNotifications: number     // from meta.starredCount
isLoadingNotifications: boolean
notificationsError: string | null
notificationFilters: { type, priority, status, search }
hasMoreNotifications: boolean

fetchNotifications(filters?)   // server-filtered, dedupes by id, updates counts from meta
setNotificationFilters(partial) // resets list + hasMore
markNotificationsRead()       // PUT + optimistic, rollback on error
markNotificationAsRead(id) / markNotificationAsUnread(id)
toggleStarNotification(id)    // PATCH starred, shows toast, rollback on error
deleteNotification(id) / bulkDeleteNotifications(ids) / bulkMarkNotifications(ids, read)
loadMoreNotifications()       // fetch offset = current length, respects active filters
```

All mutations are **optimistic + rollback** and keep `unread/starred` counts in sync. `Header`, `Notifications` page, and any future consumer read the **same** slice — no divergent states.

---

## 6. Service — `lib/services/notificationService.ts` (server-only, 20 types + 2 legacy)

```ts
import { notificationService } from '@/lib/services/notificationService';

await notificationService.create({ type: 'order', title: 'New Order #…', message: '…', actionUrl: '/dashboard/orders/…', priority: 'high', metadata: { orderId } });
await notificationService.createIfEnabled(event); // respects 22 store_settings keys
// convenience (all set correct priority + aliases inventory↔stock, social↔customer)
await notificationService.notifyNewOrder(orderId, orderNumber, customerName, total);
await notificationService.notifyLowStock(productId, name, stock, threshold); // → inventory/high
await notificationService.notifyOutOfStock(productId, name);                // → inventory/urgent
await notificationService.notifyNewReview(reviewId, productName, customerName, rating); // priority by rating
await notificationService.notifyPaymentFailed(orderId, orderNumber, reason); // payment/high
await notificationService.notifySecurityEvent(event, details);               // security/urgent
// all 20 types available: order/review/product/payment/shipping/promotion/system/social/inventory/security/account/message/achievement/reminder/subscription/support/analytics/team/event/custom (+ customer/stock legacy)
```

Already wired in `app/api/orders/route.ts`, `app/api/orders/[id]/route.ts`, `app/api/reviews/route.ts`, `app/api/products/[id]/route.ts`.

**Global (public) — from ANY page, including store/home (client):**

```ts
// Any client component, store page, home page, or plain script
import { sendNotification, notify } from '@/lib/notifications/client';

// Generic — all 20 types (old+new), full control
await sendNotification({
  type: 'promotion', // order|customer|stock|review|payment|system|product|shipping|promotion|social|inventory|security|account|message|achievement|reminder|subscription|support|analytics|team|event|custom
  title: 'Flash sale live!',
  message: '20% off accessories — 24h',
  priority: 'high', // low|medium|high|urgent
  starred: false,
  actionUrl: '/store', // or /dashboard/...
  metadata: { coupon: 'FLASH20' },
});

// Convenience wrappers (20 + 2 legacy)
await notify.order('New order', 'Customer ...');
await notify.product('Back in stock!', 'Argan Oil is back');
await notify.promotion('Sale!', '20% off');
await notify.security('New login', 'Paris, France');
await notify.account('Profile updated', 'Password changed');
await notify.message('New DM', 'Sarah: is this available?');
```

Server components / API routes can still use `notificationService` directly (service_role, no fetch):

```ts
import { notificationService } from '@/lib/services/notificationService';
await notificationService.createIfEnabled({ type: 'security', title: 'New login', message: 'Paris — Safari', priority: 'urgent', actionUrl: '/dashboard/settings/security', metadata: { ip: '…' } });
```

**Public API:** `POST /api/notifications` (no admin auth, service_role internally, validates 20 types)

```bash
curl -X POST /api/notifications -H 'Content-Type: application/json' \
  -d '{"type":"product","title":"Back in stock!","message":"Argan Oil is back","priority":"medium","actionUrl":"/store/products/123"}'
# → 201 { success:true, data:{ id, type, title, ... } }
# → 200 { success:true, data:{ skipped:true } } if type disabled in Settings (22 keys)
# Works from store/home: fetch('/api/notifications', {method:'POST', body: JSON.stringify({type:'account', title:'...', message:'...'})})
```

---

## 7. UI — `app/dashboard/pages/Notifications.tsx` (exact visual reference, not redesigned)

- **Visuals preserved exactly** from the mock design: gradient header, 4 stat cards, search + `all|unread|read|bookmarked` + **type (22 options: 20 + 2 legacy `customer`/`stock` tagged)** + priority selects, select mode + bulk bar, cards with `typeColor`/`priorityColor`/`getTypeIcon` (all 20 via `notificationVisuals` — `rounded-xl border`, `bg-*-50` subtle, `border-*-200` + `text-*-600` dark icon, same family), unread blue dot + `starred` amber star, expandable `Full message` + `metadata` + `View details`.
- **No mock data.** `generateMockNotifications` removed. Data from `useStore` sorted unread-first. Filters **server-side** (debounced 350 ms, alias-aware `inventory`↔`stock`, `social`↔`customer`).

**Header / Bell / Popup — `app/dashboard/components/layout/Header.tsx`**

- **Same icon style as Center** per spec: `w-8 h-8 rounded-xl border` `bg-*-50` subtle + `border-*-200` + `text-*-700` very dark icon via `getTypeClasses`/`getTypeIcon` (all 20 types, aliases handled). No white-on-solid — transparent/subtle bg, border+icon same color family, `rounded-xl`, same proportions as Center.
- Bell badge = `unreadNotifications` (single source). Popup `rounded-2xl` `max-h-[360px]` 5 recent, loading/empty, `starred` dot, click marks read + `setCurrentPage(actionUrl)`, `Mark all read`/`View all` synced. Fetches on mount.

**Settings — `app/dashboard/pages/settings/NotificationSettings.tsx`**

- **22 toggles** (8 + 14 new) — each `w-10 h-10 rounded-xl border` `bg-*-50 text-*-600 border-*-200` **same as Center** via `getTypeClasses`/`getTypeIcon`, `rounded-xl border`. First line **short type only** (`getCategoryLabel` → `Orders`/`Inventory`/…), second line **detailed** (`PREFERENCES[].label` → `New Order Notifications` — the previous first-line text, per spec). Backed by `GET/PUT /api/admin/notifications/preferences` (22 keys, seeded `007`+`008`+`009`). Aliases share prefs as above.

---

## 8. Synchronization & states

- **One store, one table.** Marking read in popup → `store` updates → badge, Center, and DB all reflect. Deleting in Center → popup and badge update. No separate states.
- **Loading:** `isLoadingNotifications` → `NotificationsLoadingPage` skeleton (initial) + `Loader2` for `Load more`.
- **Empty:** `BellOff` + “No notifications found” / “Try adjusting your filters”.
- **Error:** `notificationsError` banner with `Retry` → `fetchNotifications({limit:20,offset:0})`.
- **Pagination:** `hasMoreNotifications = combined.length < total` (from `meta.total`), `loadMoreNotifications` dedupes by `id`, preserves `type/priority/status/search`.

---

## 9. Global triggers — from **any** page/script (dashboard, store, home)

**From a client component (store, home, dashboard):**

```ts
import { sendNotification, notify } from '@/lib/notifications/client';

// One-liner, anywhere
await sendNotification({ type: 'product', title: 'Argan Oil is back!', message: '100% natural', priority: 'medium', actionUrl: '/store/products/123', metadata: { productId: '123' } });

// Or use the convenience map (12 types, old+new)
await notify.order('New order #1234', 'Customer Fatima — 249 MAD');
await notify.inventory('Low stock', 'Lotion — 5 left');
await notify.security('New login', 'Paris — iPhone');
```

**From a server component / API route / script (service_role):**

```ts
import { notificationService } from '@/lib/services/notificationService';
await notificationService.createIfEnabled({ type: 'promotion', title: 'Flash sale live', message: '20% off — 24h', priority: 'high', actionUrl: '/dashboard/coupons' });
// Or plain fetch to the public endpoint (works server or client):
await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'order', title: '...', message: '...' }) });
```

**Hook for dashboard CRUD:**

```ts
import { useNotifications } from '@/lib/notifications/useNotifications';
const { notifications, unreadCount, starredCount, send, markRead, toggleStar, remove, loadMore } = useNotifications();
await send({ type: 'shipping', title: 'Shipped!', message: 'TRK-...', priority: 'medium' });
```

---

## 10. Files changed

- `supabase/migrations/008_notification_enhancements.sql` + `009_additional_notification_types.sql` **(new)** — 20 types + `priority`/`starred`/`metadata`, 22 prefs, 34 seed rows; run in order, each has `COMMIT;` for `55P04` fix (`type::text` guard)
- `lib/supabase/types.ts` — 22-value `notification_type` (20 + 2 legacy) + `notification_priority` + `starred/priority/metadata`
- `app/dashboard/types/index.ts` — `NotificationType` 20 + 2 legacy + `NotificationPriority`
- `lib/db/repositories/notification.ts` — alias-aware `inventory↔stock`/`social↔customer`, `priority/starred` filters, `invalid input value for enum` fallback, `type::text` guard for 55P04
- `app/api/notifications/route.ts` **(new, public)** — `POST` global sender (any page/store/home/scripts), validates 20 types / 4 priorities, `createIfEnabled` (22 prefs)
- `app/api/admin/notifications/route.ts` + `preferences/route.ts` — 22 keys, resilient
- `lib/services/notificationService.ts` + `lib/notifications/client.ts`/`useNotifications.ts` **(new)** — 20 types, `notify.*` wrappers for all, `sendNotification` global
- `app/dashboard/store/useStore.ts` — `starred/notificationsError`, alias-aware filters, optimistic/bulk
- `app/dashboard/components/notifications/notificationVisuals.tsx` **(new, single source)** — 20-type `getTypeIcon`/`getTypeClasses` `bg-*-50 text-*-600 border-*-200` `rounded-xl border`, dark icon, `getHeaderBg`/`getHeaderIcon` same as Center per spec, `formatRelativeTime`
- `app/dashboard/pages/Notifications.tsx` — preserved, 22-type filter, alias-aware
- `app/dashboard/components/layout/Header.tsx` — `w-8 h-8 rounded-xl border ${getHeaderBg}` dark icon, same family as Center
- `app/dashboard/pages/settings/NotificationSettings.tsx` — 22 toggles, `w-10 h-10 rounded-xl border ${getTypeClasses}` dark icon, first line short `getCategoryLabel`, second line detailed `label` per spec
- `app/dashboard/data/mockData.ts`, `app/dashboard/i18n/useTranslation.ts`

Run `npx tsc --noEmit --skipLibCheck` → **0 errors**.
