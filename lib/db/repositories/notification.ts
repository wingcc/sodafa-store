/**
 * Notification Repository
 * Database operations for admin notifications
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { NotificationInsert } from '@/lib/supabase/types';

export class NotificationRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(unreadOnly: boolean = false) {
    let query = this.supabase.from('notifications').select('*');

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    return query.order('timestamp', { ascending: false });
  }

  async findById(id: string) {
    return this.supabase.from('notifications').select('*').eq('id', id).single();
  }

  async create(notification: NotificationInsert) {
    return this.supabase.from('notifications').insert(notification).select().single();
  }

  async markAsRead(id: string) {
    return this.supabase.from('notifications').update({ read: true }).eq('id', id).select().single();
  }

  async markAllAsRead() {
    return this.supabase.from('notifications').update({ read: true }).neq('read', true);
  }

  async delete(id: string) {
    return this.supabase.from('notifications').delete().eq('id', id);
  }

  async getUnreadCount() {
    const { count, error } = await this.supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('read', false);
    return { data: count ?? 0, error };
  }
}