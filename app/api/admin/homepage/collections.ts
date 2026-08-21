/**
 * Homepage collections registry
 * Maps URL collection names to Supabase tables + editable columns.
 * Used by /api/admin/homepage/[collection] routes.
 */

export interface CollectionConfig {
  table: string;
  // Primary key column ("id" for uuid tables)
  pkColumn: string;
  // Columns the API is allowed to write (whitelist)
  columns: string[];
}

export const COLLECTIONS: Record<string, CollectionConfig> = {
  testimonials: {
    table: 'testimonials',
    pkColumn: 'id',
    columns: ['name', 'city', 'initials', 'rating', 'comment', 'is_approved', 'sort_order'],
  },
  faqs: {
    table: 'faqs',
    pkColumn: 'id',
    columns: ['question', 'answer', 'is_active', 'sort_order'],
  },
  benefits: {
    table: 'benefits',
    pkColumn: 'id',
    columns: ['icon', 'title', 'description', 'col_span', 'is_active', 'sort_order'],
  },
  oils: {
    table: 'oils',
    pkColumn: 'id',
    columns: ['display_num', 'image_url', 'name', 'latin_name', 'points', 'tag', 'is_active', 'sort_order'],
  },
  stats: {
    table: 'stats',
    pkColumn: 'id',
    columns: ['count_value', 'prefix', 'suffix', 'label', 'is_active', 'sort_order'],
  },
  'trust-badges': {
    table: 'trust_badges',
    pkColumn: 'id',
    columns: ['icon', 'title', 'description', 'is_active', 'sort_order'],
  },
  'page-features': {
    table: 'page_features',
    pkColumn: 'feature_key',
    columns: ['name', 'is_enabled', 'sort_order'],
  },
  'floating-buttons': {
    table: 'floating_buttons',
    pkColumn: 'button_key',
    columns: ['name', 'position', 'is_enabled', 'sort_order'],
  },
};

/** Filters an object down to the collection's writable columns. */
export function pickColumns(
  config: CollectionConfig,
  body: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const col of config.columns) {
    if (body[col] !== undefined) out[col] = body[col];
  }
  return out;
}

/** Extracts a human-readable message from an unknown error value. */
export function toErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null && 'message' in err) {
    return String((err as { message: unknown }).message);
  }
  return 'Unexpected server error';
}
