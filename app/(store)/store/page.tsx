import React from 'react';
import type { Product } from '../../types/product';
import StoreClient from './components/StoreClient';
import { createAdminClient } from '@/lib/supabase/admin';
import { mapProductRow } from '@/lib/product-mapper';

export const metadata = {
  title: 'WellnessMarket Store — Shop Body Wellness Products',
  description: 'Browse 2,400+ verified wellness products. Filter by category, price, and brand. Free shipping on orders over $49.',
};

export default async function StorePage() {
  // Fetch products from Supabase on the server (admin client safe in server components)
  let products: Product[] = [];

  try {
    const supabase = createAdminClient();

    const { data: rows, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .order('total_sold', { ascending: false });

    if (!error && rows) {
      // Fetch categories for category name mapping
      const { data: categories } = await supabase.from('categories').select('id, name');
      const categoryMap = new Map<string, string>();
      (categories ?? []).forEach((c: { id: string; name: string }) => {
        categoryMap.set(c.id, c.name);
      });

      products = rows.map((row: Record<string, unknown>) => {
        const rowData = row as Record<string, unknown>;
        const catId = rowData.category_id as string | null;
        const catName = catId ? categoryMap.get(catId) : undefined;
        return mapProductRow(rowData, catName);
      });
    }
  } catch (err) {
    console.error('Failed to fetch products:', err);
  }

  return <StoreClient initialProducts={products} />;
}