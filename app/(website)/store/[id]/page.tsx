import type { Product } from '../../../types/product';
import { notFound } from 'next/navigation';
import ProductDetailClient from './components/ProductDetailClient';
import { createAdminClient } from '@/lib/supabase/admin';
import { mapProductRow } from '@/lib/product-mapper';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  let product: Product | null = null;

  try {
    const supabase = createAdminClient();

    // All store links are generated with the product's UUID `id`
    // (e.g. /store/20000000-0000-0000-0000-000000000003), so try fetching by
    // `id` first, then fall back to `slug` for any legacy slug-based URLs.
    let row: Record<string, unknown> | null = null;

    const { data: byId, error: byIdError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (byId && !byIdError) {
      row = byId as Record<string, unknown>;
    }

    if (!row) {
      const { data: bySlug, error: bySlugError } = await supabase
        .from('products')
        .select('*')
        .eq('slug', id)
        .single();

      if (bySlug && !bySlugError) {
        row = bySlug as Record<string, unknown>;
      }
    }

    if (row) {
      // Fetch category name
      const catId = row.category_id as string | null;
      let categoryName: string | undefined;
      if (catId) {
        const { data: cat } = await supabase.from('categories').select('name').eq('id', catId).single();
        categoryName = cat ? (cat as { name: string }).name : undefined;
      }
      product = mapProductRow(row, categoryName);
    }
  } catch (err) {
    console.error('Failed to fetch product:', err);
  }

  if (!product) {
    // No matching product in Supabase — render the 404 page.
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
