// app/dashboard/pages/store-manager/homepage/services/homepageContentService.ts
// Client-side access to the homepage management backend:
//   /api/admin/homepage/content            (singleton JSON blocks)
//   /api/admin/homepage/[collection]       (list tables CRUD)
// All routes are protected by middleware and use the server-side admin client.

// ---------------------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------------------

async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`GET ${url} failed (${res.status})`);
  const json = await res.json();
  return json?.data as T;
}

async function apiWrite<T>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.error?.message || `${method} ${url} failed (${res.status})`);
  }
  const json = await res.json();
  return json?.data as T;
}

// ---------------------------------------------------------------------------
// Content blocks (homepage_content)
// ---------------------------------------------------------------------------
export type ContentKey =
  | 'site_info'
  | 'hero'
  | 'pricing'
  | 'about'
  | 'video'
  | 'seo'
  | 'legal'
  | 'order_steps';

export async function fetchContentBlock<T>(key: ContentKey, fallback: T): Promise<T> {
  try {
    const data = await apiGet<T | null>(`/api/admin/homepage/content?key=${key}`);
    if (!data || typeof data !== 'object' || Array.isArray(data)) return fallback;
    return { ...(fallback as object), ...data } as T;
  } catch (err) {
    console.error(`Failed to load content block "${key}":`, err);
    return fallback;
  }
}

export async function saveContentBlock<T extends object>(key: ContentKey, content: T): Promise<void> {
  await apiWrite('PUT', '/api/admin/homepage/content', { key, content });
}

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------
export type CollectionName =
  | 'testimonials'
  | 'faqs'
  | 'benefits'
  | 'oils'
  | 'stats'
  | 'trust-badges'
  | 'page-features'
  | 'floating-buttons';

export async function fetchCollection<T>(collection: CollectionName): Promise<T[]> {
  try {
    return await apiGet<T[]>(`/api/admin/homepage/${collection}`);
  } catch (err) {
    console.error(`Failed to load collection "${collection}":`, err);
    return [];
  }
}

export async function createCollectionItem<T>(
  collection: CollectionName,
  item: Record<string, unknown>
): Promise<T> {
  return apiWrite<T>('POST', `/api/admin/homepage/${collection}`, item);
}

export async function updateCollectionItem<T>(
  collection: CollectionName,
  id: string,
  patch: Record<string, unknown>
): Promise<T> {
  return apiWrite<T>('PATCH', `/api/admin/homepage/${collection}/${encodeURIComponent(id)}`, patch);
}

export async function deleteCollectionItem(
  collection: CollectionName,
  id: string
): Promise<void> {
  await apiWrite('DELETE', `/api/admin/homepage/${collection}/${encodeURIComponent(id)}`);
}
