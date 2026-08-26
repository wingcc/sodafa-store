/**
 * Product Repository
 * Database operations for products and variants
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { ProductInsert, ProductUpdate, ProductVariantInsert, ProductVariantUpdate } from '@/lib/supabase/types';

export class ProductRepository {
  constructor(private supabase: SupabaseClient) {}

  // ─── Products ──────────────────────────────────────────────────

  async findAll(options?: {
    categoryId?: string;
    status?: string;
    featured?: boolean;
    search?: string;
    sortBy?: string;
    limit?: number;
    offset?: number;
    showInStore?: boolean; // filter by ShowInStor boolean column
    tag?: string; // filter by tags array containing this tag
    ads?: boolean; // filter by ADS boolean column
  }) {
    let query = this.supabase.from('products').select('*');

    if (options?.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }
    if (options?.status) {
      query = query.eq('status', options.status);
    }
    if (options?.featured !== undefined) {
      query = query.eq('featured', options.featured);
    }

    // Filter products that should be shown in store (ShowInStor boolean column)
    if (options?.showInStore !== undefined) {
      query = query.eq('ShowInStor', options.showInStore);
    }

    // Filter by ADS flag
    if (options?.ads !== undefined) {
      query = query.eq('ADS', options.ads);
    }

    // Filter by tag (tags is a text[] column)
    if (options?.tag) {
      // Supabase supports contains for Postgres array columns
      query = query.contains('tags', [options.tag]);
    }

    if (options?.search) {
      query = query.or(`name.ilike.%${options.search}%,sku.ilike.%${options.search}%`);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit ?? 10) - 1);
    }

    switch (options?.sortBy) {
      case 'price-high': query = query.order('regular_price', { ascending: false }); break;
      case 'price-low': query = query.order('regular_price', { ascending: true }); break;
      case 'best-selling': query = query.order('total_sold', { ascending: false }); break;
      case 'name': query = query.order('name', { ascending: true }); break;
      default: query = query.order('created_at', { ascending: false });
    }

    return query;
  }

  async findById(id: string) {
    return this.supabase.from('products').select('*').eq('id', id).single();
  }

  async findBySlug(slug: string) {
    return this.supabase.from('products').select('*').eq('slug', slug).single();
  }

  async create(product: ProductInsert) {
    return this.supabase.from('products').insert(product).select().single();
  }

  async update(id: string, updates: ProductUpdate) {
    return this.supabase.from('products').update(updates).eq('id', id).select().single();
  }

  async delete(id: string) {
    return this.supabase.from('products').delete().eq('id', id);
  }

  async updateStock(id: string, quantity: number) {
    return this.supabase.rpc('update_stock', { p_product_id: id, p_quantity: quantity });
  }

  /**
   * Atomically check stock AND decrement in one DB statement.
   * Returns { success, newStock } — never oversells.
   */
  async decrementStock(productId: string, qty: number): Promise<{ success: boolean; newStock: number }> {
    const { data, error } = await this.supabase.rpc('decrement_stock', {
      p_product_id: productId,
      p_qty: qty,
    });
    if (error) return { success: false, newStock: -1 };
    const result = data as number;
    if (result < 0) return { success: false, newStock: -1 };
    return { success: true, newStock: result };
  }

  async getStats() {
    const { data: all, error } = await this.supabase.from('products').select('status, stock, low_stock_threshold');
    if (error) return { data: null, error };

    const total = all.length;
    const active = all.filter(p => p.status === 'active').length;
    const lowStock = all.filter(p => p.stock > 0 && p.stock <= p.low_stock_threshold).length;
    const outOfStock = all.filter(p => p.stock === 0).length;

    return { data: { total, active, lowStock, outOfStock }, error: null };
  }

  // ─── Variants ──────────────────────────────────────────────────

  async findVariants(productId: string) {
    return this.supabase.from('product_variants').select('*').eq('product_id', productId);
  }

  async createVariant(variant: ProductVariantInsert) {
    return this.supabase.from('product_variants').insert(variant).select().single();
  }

  async updateVariant(id: string, updates: ProductVariantUpdate) {
    return this.supabase.from('product_variants').update(updates).eq('id', id).select().single();
  }

  async deleteVariant(id: string) {
    return this.supabase.from('product_variants').delete().eq('id', id);
  }
}