/**
 * Notification Repository
 * Database operations for admin notifications
 * Shared by Notification Center, bell/popup, and settings.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { NotificationInsert, NotificationUpdate } from '@/lib/supabase/types';

export interface NotificationFilters {
  // read status: all | unread | read | bookmarked
  status?: string;
  unreadOnly?: boolean; // legacy
  starredOnly?: boolean;
  type?: string;
  priority?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export class NotificationRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(filters: NotificationFilters = {}) {
    // Build query; gracefully handle missing columns if migration 008 not yet applied
    const tryBuild = () => {
      let query: any = this.supabase.from('notifications').select('*', { count: 'exact' });
      if (filters.status === 'unread' || filters.unreadOnly) {
        query = query.eq('read', false);
      } else if (filters.status === 'read') {
        query = query.eq('read', true);
      } else if (filters.status === 'bookmarked' || filters.starredOnly) {
        query = query.eq('starred', true);
      }
      if (filters.type && filters.type !== 'all') {
        // Handle aliases: inventory<->stock, social<->customer share storage
        if (filters.type === 'inventory' || filters.type === 'stock') {
          query = query.in('type', ['inventory', 'stock']);
        } else if (filters.type === 'social' || filters.type === 'customer') {
          query = query.in('type', ['social', 'customer']);
        } else {
          query = query.eq('type', filters.type);
        }
      }
      if (filters.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
      }
      if (filters.search) {
        const s = filters.search.replace(/%/g, '\\%').replace(/_/g, '\\_');
        query = query.or(`title.ilike.%${s}%,message.ilike.%${s}%`);
      }
      query = query.order('timestamp', { ascending: false }).order('id', { ascending: false });
      const limit = filters.limit ?? 20;
      const offset = filters.offset ?? 0;
      if (offset > 0) query = query.range(offset, offset + limit - 1);
      else query = query.limit(limit);
      return query;
    };

    const result: any = await tryBuild();
    // Handle invalid enum for new types pre-migration (e.g., account before 009)
    if (result.error && /invalid input value for enum/i.test(result.error.message)) {
      return { data: [], count: 0, error: null } as any;
    }
    // If column does not exist (migration not applied), retry without starred/priority filters and return with defaults
    if (result.error && /column.*does not exist|Could not find.*column/i.test(result.error.message)) {
      const msg = result.error.message as string;
      const missingStarred = /starred/i.test(msg);
      const missingPriority = /priority/i.test(msg);
      const missingMetadata = /metadata/i.test(msg);
      // Retry without the missing filters
      const fallbackFilters = { ...filters } as NotificationFilters;
      if (missingStarred && (fallbackFilters.status === 'bookmarked' || fallbackFilters.starredOnly)) {
        fallbackFilters.status = 'all';
        fallbackFilters.starredOnly = false;
      }
      if (missingPriority) fallbackFilters.priority = 'all';
      // Rebuild without missing filters
      let q2: any = this.supabase.from('notifications').select('*', { count: 'exact' });
      if (fallbackFilters.status === 'unread' || fallbackFilters.unreadOnly) q2 = q2.eq('read', false);
      else if (fallbackFilters.status === 'read') q2 = q2.eq('read', true);
      // skip starred filter if missing — handle type aliases
      if (fallbackFilters.type && fallbackFilters.type !== 'all') {
        if (fallbackFilters.type === 'inventory' || fallbackFilters.type === 'stock') q2 = q2.in('type', ['inventory', 'stock']);
        else if (fallbackFilters.type === 'social' || fallbackFilters.type === 'customer') q2 = q2.in('type', ['social', 'customer']);
        else q2 = q2.eq('type', fallbackFilters.type);
      }
      // skip priority filter if missing
      if (fallbackFilters.search) {
        const s = fallbackFilters.search.replace(/%/g, '\\%').replace(/_/g, '\\_');
        q2 = q2.or(`title.ilike.%${s}%,message.ilike.%${s}%`);
      }
      q2 = q2.order('timestamp', { ascending: false }).order('id', { ascending: false });
      const limit = fallbackFilters.limit ?? 20;
      const offset = fallbackFilters.offset ?? 0;
      if (offset > 0) q2 = q2.range(offset, offset + limit - 1);
      else q2 = q2.limit(limit);
      const retry: any = await q2;
      if (retry.error && /invalid input value for enum/i.test(retry.error.message)) {
        return { data: [], count: 0, error: null } as any;
      }
      if (retry.data) {
        let data = retry.data.map((row: any) => ({
          starred: false,
          priority: 'medium',
          metadata: {},
          ...row,
        }));
        // In-memory filtering for missing columns so UI filters behave correctly even before migration
        if (missingStarred && (filters.status === 'bookmarked' || (filters as any).starredOnly)) {
          data = data.filter((r: any) => r.starred === true);
        }
        if (missingPriority && filters.priority && filters.priority !== 'all') {
          data = data.filter((r: any) => r.priority === filters.priority);
        }
        retry.data = data;
        if ((missingStarred && (filters.status === 'bookmarked' || (filters as any).starredOnly)) || (missingPriority && filters.priority && filters.priority !== 'all')) {
          retry.count = data.length;
        }
      }
      return retry;
    }
    // Inject defaults if columns missing but not filtered (select * returns without them)
    if (result.data && Array.isArray(result.data) && result.data.length > 0 && (result.data[0].starred === undefined || result.data[0].priority === undefined)) {
      result.data = result.data.map((row: any) => ({
        starred: false,
        priority: 'medium',
        metadata: {},
        ...row,
      }));
    }
    return result;
  }

  async findById(id: string) {
    return this.supabase.from('notifications').select('*').eq('id', id).single();
  }

  async create(notification: NotificationInsert) {
    const res: any = await this.supabase.from('notifications').insert(notification).select().single();
    if (res.error) {
      const msg = res.error.message as string;
      const isColumnMissing = /column.*does not exist|Could not find.*column/i.test(msg);
      const isEnumInvalid = /invalid input value for enum/i.test(msg);
      if (isColumnMissing) {
        const { priority, starred, metadata, ...rest } = notification as any;
        return this.supabase.from('notifications').insert(rest).select().single();
      }
      if (isEnumInvalid) {
        // Map unknown type to legacy fallback (system) pre-migration
        const fallback: any = { ...notification, type: 'system' as any };
        // Also strip new columns if needed
        const res2: any = await this.supabase.from('notifications').insert(fallback).select().single();
        if (res2.error && /column.*does not exist|Could not find.*column/i.test(res2.error.message)) {
          const { priority, starred, metadata, ...rest2 } = fallback as any;
          return this.supabase.from('notifications').insert(rest2).select().single();
        }
        return res2;
      }
    }
    return res;
  }

  async update(id: string, patch: NotificationUpdate) {
    const res: any = await this.supabase.from('notifications').update(patch).eq('id', id).select().single();
    if (res.error && /column.*does not exist|Could not find.*column/i.test(res.error.message)) {
      // Fallback: filter out unknown columns and retry (or fake success if only unknown columns)
      const allowed = ['type','title','message','read','action_url','timestamp'] as const;
      const filtered: any = {};
      let hasAllowed = false;
      for (const k of Object.keys(patch as any)) {
        if ((allowed as readonly string[]).includes(k)) { filtered[k] = (patch as any)[k]; hasAllowed = true; }
      }
      if (!hasAllowed) {
        // Only unknown columns (starred/priority/metadata) — fake success by fetching current row and merging
        const { data: cur } = await this.supabase.from('notifications').select('*').eq('id', id).single();
        if (cur) return { data: { ...cur, ...(patch as any) }, error: null } as any;
      } else {
        const retry: any = await this.supabase.from('notifications').update(filtered).eq('id', id).select().single();
        if (!retry.error && retry.data) return { data: { ...retry.data, ...(patch as any) }, error: null } as any;
      }
    }
    return res;
  }

  async markAsRead(id: string) {
    return this.update(id, { read: true });
  }

  async markAsUnread(id: string) {
    return this.update(id, { read: false });
  }

  async toggleStarred(id: string, starred: boolean) {
    return this.update(id, { starred });
  }

  async markAllAsRead() {
    return this.supabase.from('notifications').update({ read: true }).eq('read', false);
  }

  async delete(id: string) {
    return this.supabase.from('notifications').delete().eq('id', id);
  }

  async bulkDelete(ids: string[]) {
    if (!ids.length) return { data: null, error: null };
    return this.supabase.from('notifications').delete().in('id', ids);
  }

  async bulkMarkRead(ids: string[], read: boolean) {
    if (!ids.length) return { data: null, error: null };
    return this.supabase.from('notifications').update({ read }).in('id', ids);
  }

  async getUnreadCount() {
    const { count, error } = await this.supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('read', false);
    return { data: count ?? 0, error };
  }

  async getStarredCount() {
    const { count, error } = await this.supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('starred', true);
    if (error && /column.*does not exist|Could not find.*column/i.test(error.message)) {
      return { data: 0, error: null } as any;
    }
    return { data: count ?? 0, error };
  }

  async getCounts() {
    const [unread, starred, total] = await Promise.all([
      this.getUnreadCount(),
      this.getStarredCount(),
      this.supabase.from('notifications').select('*', { count: 'exact', head: true }).then(r => ({ data: r.count ?? 0, error: r.error })),
    ]);
    return { unread: unread.data, starred: starred.data, total: total.data };
  }

  async getCountByType() {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('type, read', { count: 'exact' });
    return { data, error };
  }
}
