/**
 * Category Repository
 * Database operations for categories
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { CategoryInsert, CategoryUpdate } from '@/lib/supabase/types';

export class CategoryRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll() {
    return this.supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });
  }

  async findRoots() {
    return this.supabase
      .from('categories')
      .select('*')
      .is('parent_id', null)
      .eq('status', 'active')
      .order('sort_order', { ascending: true });
  }

  async findChildren(parentId: string) {
    return this.supabase
      .from('categories')
      .select('*')
      .eq('parent_id', parentId)
      .eq('status', 'active')
      .order('sort_order', { ascending: true });
  }

  async findById(id: string) {
    return this.supabase.from('categories').select('*').eq('id', id).single();
  }

  async findBySlug(slug: string) {
    return this.supabase.from('categories').select('*').eq('slug', slug).single();
  }

  async create(category: CategoryInsert) {
    return this.supabase.from('categories').insert(category).select().single();
  }

  async update(id: string, updates: CategoryUpdate) {
    return this.supabase.from('categories').update(updates).eq('id', id).select().single();
  }

  async delete(id: string) {
    return this.supabase.from('categories').delete().eq('id', id);
  }
}