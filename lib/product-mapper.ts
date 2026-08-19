/**
 * Product Mapper
 * Maps Supabase ProductRow (database) → public Product type (app/types/product)
 * Pure function — safe to import in both server and client components.
 */

import type { Product } from '@/app/types/product';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseRow = Record<string, any>;

/**
 * Extract images array from the Supabase jsonb column.
 * Supabase images column can be a JSON array of strings or objects.
 */
function extractImages(images: unknown): string[] {
  if (Array.isArray(images)) {
    return images.map((img) => {
      if (typeof img === 'string') return img;
      if (img && typeof img === 'object' && 'src' in img) return String((img as { src: unknown }).src ?? '');
      return '';
    }).filter(Boolean);
  }
  return [];
}

/**
 * Map a Supabase ProductRow to the public Product type.
 * `categoryName` can come from a joined categories table.
 */
export function mapProductRow(row: SupabaseRow, categoryName?: string): Product {
  const images = extractImages(row.images);

  const salePrice = typeof row.sale_price === 'number' ? row.sale_price : null;
  const regularPrice = typeof row.regular_price === 'number' ? row.regular_price : 0;

  const price = salePrice ?? regularPrice;
  const originalPrice = salePrice !== null ? regularPrice : null;

  const stock = typeof row.stock === 'number' ? row.stock : 0;
  const rating = typeof row.rating === 'number' ? row.rating : 0;
  const reviewCount = typeof row.review_count === 'number' ? row.review_count : 0;
  const totalSold = typeof row.total_sold === 'number' ? row.total_sold : 0;

  const tags: string[] = Array.isArray(row.tags) ? row.tags : [];
  const featured = Boolean(row.featured);
  const ads = row.ADS !== undefined ? Boolean(row.ADS) : Boolean(row.ads);
  const showInStore = row.ShowInStor !== undefined ? Boolean(row.ShowInStor) : Boolean(row.showinstor ?? row.showInStore);

  return {
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    price,
    originalPrice,
    image: images[0] ?? undefined,
    imageAlt: String(row.name ?? ''),
    badge: featured ? 'Featured' : (ads ? 'ADS' : (tags.length > 0 ? tags[0] : null)),
    ADS: ads,
    ads,
    ShowInStor: showInStore,
    showInStore,
    inStock: stock > 0,
    tags,
    brand: row.brand ? String(row.brand) : undefined,
    category: categoryName ?? (row.subcategory ? String(row.subcategory) : undefined),
    rating: rating > 0 ? rating : undefined,
    reviews: reviewCount > 0 ? reviewCount : undefined,
    sales: totalSold > 0 ? totalSold : undefined,
    description: String(row.short_description || row.full_description || ''),
    bannerImage: images[1] ?? images[0] ?? undefined,
    bannerImageAlt: String(row.name ?? ''),
    bannerText: String(row.name ?? ''),
    highlights: tags.length > 0 ? tags : undefined,
    images: images.map((src) => ({ src, alt: String(row.name ?? '') })),
  };
}
