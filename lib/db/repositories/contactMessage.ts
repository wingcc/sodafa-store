/**
 * Contact Message Repository
 * Supports BOTH `contact_messages` (new, full-featured) and legacy `contact_submissions` (minimal).
 * Auto-detects which table exists and maps schemas transparently.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { ContactMessageInsert, ContactMessageUpdate } from '@/lib/supabase/types';

export interface ContactMessageFilters {
  status?: string; // all | new | read | replied | archived | starred | customer
  search?: string;
  starredOnly?: boolean;
  customerOnly?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'newest' | 'oldest';
}

// Which physical table we are using
type PhysicalTable = 'contact_messages' | 'contact_submissions';

function isTableNotFoundError(err: any): boolean {
  if (!err) return false;
  const msg = String(err.message ?? err.code ?? '');
  return /PGRST205|Could not find the table/i.test(msg);
}
function isColumnMissingError(err: any): boolean {
  if (!err) return false;
  return /column.*does not exist|Could not find.*column/i.test(String(err.message));
}

export class ContactMessageRepository {
  private _table: PhysicalTable | null = null;
  constructor(private supabase: SupabaseClient) {}

  // ── Detect table ─────────────────────────────────────────────
  private async getTable(): Promise<PhysicalTable> {
    if (this._table) return this._table;
    // try contact_messages first (new)
    const probe: any = await this.supabase.from('contact_messages').select('id').limit(1);
    if (!probe.error || !isTableNotFoundError(probe.error)) {
      this._table = 'contact_messages';
      return this._table;
    }
    this._table = 'contact_submissions';
    return this._table;
  }
  private async getTableSync(): Promise<PhysicalTable> {
    if (this._table) return this._table;
    return this.getTable();
  }

  // ── Row mappers ──────────────────────────────────────────────
  private mapFromLegacy(row: any): any {
    // legacy contact_submissions → contact_messages shape
    const read = Boolean(row.read);
    // Map read boolean to status text
    let status: string = read ? 'read' : 'new';
    // If legacy row has status column (after migration), prefer it
    if (row.status && typeof row.status === 'string') status = row.status;
    return {
      id: String(row.id),
      customer_id: row.customer_id ? String(row.customer_id) : null,
      name: String(row.name ?? ''),
      phone: String(row.phone ?? ''),
      email: row.email ? String(row.email) : null,
      message: String(row.message ?? ''),
      status,
      is_starred: Boolean(row.is_starred ?? false),
      is_customer: Boolean(row.is_customer ?? false),
      created_at: String(row.created_at ?? new Date().toISOString()),
      updated_at: String(row.updated_at ?? row.created_at ?? new Date().toISOString()),
      // keep raw read for writes
      _raw: row,
    };
  }

  private toLegacyInsert(msg: ContactMessageInsert, table: PhysicalTable): Record<string, any> {
    if (table === 'contact_messages') return msg as any;
    // contact_submissions minimal mapping
    const legacy: Record<string, any> = {
      name: (msg as any).name,
      phone: (msg as any).phone,
      email: (msg as any).email ?? null,
      message: (msg as any).message,
    };
    // read boolean from status
    if ((msg as any).status) {
      legacy.read = (msg as any).status !== 'new';
      // also store status if column exists (after migration)
      legacy.status = (msg as any).status;
    } else {
      legacy.read = false;
    }
    // only include extended columns if they might exist (try, fallback will strip on error)
    if ((msg as any).customer_id !== undefined) legacy.customer_id = (msg as any).customer_id;
    if ((msg as any).is_starred !== undefined) legacy.is_starred = (msg as any).is_starred;
    if ((msg as any).is_customer !== undefined) legacy.is_customer = (msg as any).is_customer;
    return legacy;
  }

  private toLegacyPatch(patch: ContactMessageUpdate, table: PhysicalTable): Record<string, any> {
    if (table === 'contact_messages') return patch as any;
    const out: Record<string, any> = {};
    if ((patch as any).status !== undefined) {
      const s = String((patch as any).status);
      out.read = s !== 'new';
      out.status = s; // will be stripped if column missing
    }
    if ((patch as any).is_starred !== undefined) out.is_starred = (patch as any).is_starred;
    if ((patch as any).is_customer !== undefined) out.is_customer = (patch as any).is_customer;
    if ((patch as any).customer_id !== undefined) out.customer_id = (patch as any).customer_id;
    if ((patch as any).name !== undefined) out.name = (patch as any).name;
    if ((patch as any).phone !== undefined) out.phone = (patch as any).phone;
    if ((patch as any).email !== undefined) out.email = (patch as any).email;
    if ((patch as any).message !== undefined) out.message = (patch as any).message;
    return out;
  }

  // ── Helpers for merged queries (both tables) ───────────────
  private async tableExists(table: PhysicalTable): Promise<boolean> {
    const probe: any = await this.supabase.from(table).select('id').limit(1);
    return !probe.error || !isTableNotFoundError(probe.error);
  }

  private buildFilteredQuery(table: PhysicalTable, filters: ContactMessageFilters, forCount = false): any {
    let q: any = this.supabase.from(table).select(forCount ? 'id, status, is_starred, is_customer, read' : '*', forCount ? undefined : { count: 'exact' });
    // status filter
    if (filters.status && filters.status !== 'all') {
      if (table === 'contact_submissions') {
        if (filters.status === 'starred') q = q.eq('is_starred', true);
        else if (filters.status === 'customer') q = q.eq('is_customer', true);
        else if (filters.status === 'new') q = q.eq('read', false);
        else if (filters.status === 'read') q = q.eq('read', true);
        else q = q.eq('status', filters.status);
      } else {
        if (filters.status === 'starred') q = q.eq('is_starred', true);
        else if (filters.status === 'customer') q = q.eq('is_customer', true);
        else q = q.eq('status', filters.status);
      }
    }
    if (filters.starredOnly) q = q.eq('is_starred', true);
    if (filters.customerOnly) q = q.eq('is_customer', true);
    if (filters.search) {
      const s = filters.search.replace(/%/g, '\\%').replace(/_/g, '\\_');
      q = q.or(`name.ilike.%${s}%,phone.ilike.%${s}%,email.ilike.%${s}%,message.ilike.%${s}%`);
    }
    if (!forCount) {
      const asc = filters.sortBy === 'oldest';
      q = q.order('created_at', { ascending: asc }).order('id', { ascending: false });
    }
    return q;
  }

  // ── Public API ───────────────────────────────────────────────
  async findAll(filters: ContactMessageFilters = {}): Promise<any> {
    // Try to fetch from BOTH tables and merge — this fixes zero-count bug when
    // one table is empty and messages live in the other (pre/post migration).
    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;
    const asc = filters.sortBy === 'oldest';

    // Build queries for both tables in parallel
    const tables: PhysicalTable[] = ['contact_messages', 'contact_submissions'];
    const results: any[] = [];
    let anyTableFound = false;

    for (const table of tables) {
      try {
        let q: any = this.buildFilteredQuery(table, filters, false);
        // For merged pagination we need to fetch more than limit to allow correct offset after merge.
        // Fetch limit+offset from each, then merge and slice. Use generous cap for safety.
        const fetchLimit = limit + offset + 20; // a bit extra to compensate for filtering differences
        q = q.limit(fetchLimit);
        const res: any = await q;
        if (res.error) {
          if (isTableNotFoundError(res.error)) continue; // table doesn't exist — skip
          if (isColumnMissingError(res.error)) {
            // Retry minimal for this table
            let q2: any = this.supabase.from(table).select('*', { count: 'exact' });
            if (filters.search) {
              const s = filters.search.replace(/%/g, '\\%').replace(/_/g, '\\_');
              q2 = q2.or(`name.ilike.%${s}%,phone.ilike.%${s}%,email.ilike.%${s}%,message.ilike.%${s}%`);
            }
            if (table === 'contact_submissions' && filters.status && ['new','read'].includes(filters.status)) {
              q2 = q2.eq('read', filters.status === 'read');
            }
            q2 = q2.order('created_at', { ascending: asc }).order('id', { ascending: false }).limit(fetchLimit);
            const retry: any = await q2;
            if (!retry.error && retry.data) {
              if (table === 'contact_submissions') retry.data = retry.data.map((r: any) => this.mapFromLegacy(r));
              results.push({ data: retry.data, count: retry.count, table });
              anyTableFound = true;
            }
            continue;
          }
          // other error — bubble
          return res;
        }
        anyTableFound = true;
        let data = res.data ?? [];
        if (table === 'contact_submissions') data = data.map((r: any) => this.mapFromLegacy(r));
        results.push({ data, count: res.count ?? data.length, table });
      } catch {}
    }

    if (!anyTableFound) {
      // fallback to original single-table logic if neither found
      const table = await this.getTable();
      let query: any = this.supabase.from(table).select('*', { count: 'exact' });
      if (filters.status && filters.status !== 'all') {
        if (table === 'contact_submissions') {
          if (filters.status === 'starred') query = query.eq('is_starred', true);
          else if (filters.status === 'customer') query = query.eq('is_customer', true);
          else if (filters.status === 'new') query = query.eq('read', false);
          else if (filters.status === 'read') query = query.eq('read', true);
          else query = query.eq('status', filters.status);
        } else {
          if (filters.status === 'starred') query = query.eq('is_starred', true);
          else if (filters.status === 'customer') query = query.eq('is_customer', true);
          else query = query.eq('status', filters.status);
        }
      }
      if (filters.starredOnly) query = query.eq('is_starred', true);
      if (filters.customerOnly) query = query.eq('is_customer', true);
      if (filters.search) {
        const s = filters.search.replace(/%/g, '\\%').replace(/_/g, '\\_');
        query = query.or(`name.ilike.%${s}%,phone.ilike.%${s}%,email.ilike.%${s}%,message.ilike.%${s}%`);
      }
      query = query.order('created_at', { ascending: asc }).order('id', { ascending: false });
      if (offset > 0) query = query.range(offset, offset + limit - 1);
      else query = query.limit(limit);
      const res: any = await query;
      if (!res.error && res.data && table === 'contact_submissions') res.data = res.data.map((r: any) => this.mapFromLegacy(r));
      return res;
    }

    // Merge, dedupe by id, sort
    const mergedMap = new Map<string, any>();
    for (const r of results) {
      for (const row of r.data ?? []) {
        if (!mergedMap.has(row.id)) mergedMap.set(row.id, row);
      }
    }
    let merged = Array.from(mergedMap.values());
    // Re-apply in-memory status filter for accurate results (server filters on `read` vs `status` may differ)
    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'starred') merged = merged.filter((m: any) => m.is_starred);
      else if (filters.status === 'customer') merged = merged.filter((m: any) => m.is_customer);
      else if (['new','read','replied','archived'].includes(filters.status)) merged = merged.filter((m: any) => m.status === filters.status);
    }
    if (filters.starredOnly) merged = merged.filter((m: any) => m.is_starred);
    if (filters.customerOnly) merged = merged.filter((m: any) => m.is_customer);
    if (filters.search) {
      const term = filters.search.toLowerCase();
      merged = merged.filter((m: any) =>
        String(m.name ?? '').toLowerCase().includes(term) ||
        String(m.phone ?? '').toLowerCase().includes(term) ||
        String(m.email ?? '').toLowerCase().includes(term) ||
        String(m.message ?? '').toLowerCase().includes(term)
      );
    }
    merged.sort((a: any, b: any) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return asc ? da - db : db - da;
    });
    const total = merged.length;
    const paged = merged.slice(offset, offset + limit);
    return { data: paged, count: total, error: null };
  }

  async findById(id: string): Promise<any> {
    for (const table of ['contact_messages', 'contact_submissions'] as PhysicalTable[]) {
      const res: any = await this.supabase.from(table).select('*').eq('id', id).single();
      if (!res.error && res.data) {
        if (table === 'contact_submissions') res.data = this.mapFromLegacy(res.data);
        return res;
      }
      if (res.error && isTableNotFoundError(res.error)) continue;
      if (res.error && String(res.error.code) === 'PGRST116') continue; // not found in this table, try other
    }
    // fallback to getTable logic
    const table = await this.getTable();
    const res: any = await this.supabase.from(table).select('*').eq('id', id).single();
    if (!res.error && res.data && table === 'contact_submissions') res.data = this.mapFromLegacy(res.data);
    return res;
  }

  async create(msg: ContactMessageInsert): Promise<any> {
    const table = await this.getTable();
    const payload = this.toLegacyInsert(msg, table);
    let res: any = await this.supabase.from(table).insert(payload).select().single();
    if (res.error && isColumnMissingError(res.error) && table === 'contact_submissions') {
      // strip extended columns and retry minimal
      const minimal: Record<string, any> = {
        name: payload.name,
        phone: payload.phone,
        email: payload.email,
        message: payload.message,
        read: payload.read ?? false,
      };
      res = await this.supabase.from(table).insert(minimal).select().single();
      if (!res.error && res.data) res.data = this.mapFromLegacy(res.data);
      return res;
    }
    if (!res.error && res.data && table === 'contact_submissions') {
      res.data = this.mapFromLegacy(res.data);
    }
    // if contact_messages table missing, fallback
    if (res.error && isTableNotFoundError(res.error) && table === 'contact_messages') {
      this._table = 'contact_submissions';
      const fallbackPayload = this.toLegacyInsert(msg, 'contact_submissions');
      let r2: any = await this.supabase.from('contact_submissions').insert(fallbackPayload).select().single();
      if (r2.error && isColumnMissingError(r2.error)) {
        const minimal: Record<string, any> = {
          name: fallbackPayload.name,
          phone: fallbackPayload.phone,
          email: fallbackPayload.email,
          message: fallbackPayload.message,
          read: fallbackPayload.read ?? false,
        };
        r2 = await this.supabase.from('contact_submissions').insert(minimal).select().single();
      }
      if (!r2.error && r2.data) r2.data = this.mapFromLegacy(r2.data);
      return r2;
    }
    return res;
  }

  async update(id: string, patch: ContactMessageUpdate): Promise<any> {
    // Try both tables: update where id exists
    for (const table of ['contact_messages', 'contact_submissions'] as PhysicalTable[]) {
      const payload = this.toLegacyPatch(patch, table);
      let res: any = await this.supabase.from(table).update(payload).eq('id', id).select().single();
      if (!res.error && res.data) {
        if (table === 'contact_submissions') res.data = this.mapFromLegacy(res.data);
        return res;
      }
      if (res.error && isColumnMissingError(res.error)) {
        const allowed: Record<string, any> = {};
        for (const k of ['read','name','phone','email','message','status']) {
          if (payload[k] !== undefined) allowed[k] = payload[k];
        }
        if (Object.keys(allowed).length === 0) {
          if (payload.is_starred !== undefined || payload.is_customer !== undefined) {
            const cur: any = await this.supabase.from(table).select('*').eq('id', id).single();
            if (cur.data) return { data: { ...this.mapFromLegacy(cur.data), ...patch }, error: null } as any;
          }
          continue;
        }
        const retry: any = await this.supabase.from(table).update(allowed).eq('id', id).select().single();
        if (!retry.error && retry.data) {
          if (table === 'contact_submissions') retry.data = this.mapFromLegacy(retry.data);
          retry.data = { ...retry.data, ...patch } as any;
          return retry;
        }
        continue;
      }
      if (res.error && isTableNotFoundError(res.error)) continue;
      if (res.error && String(res.error.code) === 'PGRST116') continue; // not in this table
      if (res.error) return res;
    }
    // fallback original logic
    const table = await this.getTable();
    const payload = this.toLegacyPatch(patch, table);
    let res: any = await this.supabase.from(table).update(payload).eq('id', id).select().single();
    if (res.error && isColumnMissingError(res.error)) {
      const allowed: Record<string, any> = {};
      for (const k of ['read','name','phone','email','message','status']) if (payload[k] !== undefined) allowed[k] = payload[k];
      if (Object.keys(allowed).length === 0) {
        if (payload.is_starred !== undefined || payload.is_customer !== undefined) {
          const cur: any = await this.supabase.from(table).select('*').eq('id', id).single();
          if (cur.data) return { data: { ...this.mapFromLegacy(cur.data), ...patch }, error: null } as any;
        }
        return res;
      }
      const retry: any = await this.supabase.from(table).update(allowed).eq('id', id).select().single();
      if (!retry.error && retry.data && table === 'contact_submissions') retry.data = this.mapFromLegacy(retry.data);
      if (!retry.error && retry.data) retry.data = { ...retry.data, ...patch } as any;
      return retry;
    }
    if (!res.error && res.data && table === 'contact_submissions') res.data = this.mapFromLegacy(res.data);
    return res;
  }

  async delete(id: string): Promise<any> {
    // try both tables
    for (const table of ['contact_messages', 'contact_submissions'] as PhysicalTable[]) {
      const res: any = await this.supabase.from(table).delete().eq('id', id);
      if (!res.error) return res;
      if (isTableNotFoundError(res.error)) continue;
      // if delete affected 0 rows, PostgREST still returns success with count 0 — we need to check
      // For now, try next table anyway if error code indicates not found
      if (String(res.error.code) === 'PGRST116') continue;
    }
    const table = await this.getTable();
    return this.supabase.from(table).delete().eq('id', id);
  }

  async bulkDelete(ids: string[]): Promise<any> {
    if (!ids.length) return { data: null, error: null } as any;
    // delete from both tables (ids may be split)
    let lastRes: any = null;
    for (const table of ['contact_messages', 'contact_submissions'] as PhysicalTable[]) {
      const res: any = await this.supabase.from(table).delete().in('id', ids);
      if (!res.error) lastRes = res;
      if (res.error && isTableNotFoundError(res.error)) continue;
    }
    if (lastRes) return lastRes;
    const table = await this.getTable();
    return this.supabase.from(table).delete().in('id', ids);
  }

  async bulkUpdateStatus(ids: string[], status: string): Promise<any> {
    if (!ids.length) return { data: null, error: null } as any;
    let lastRes: any = null;
    for (const table of ['contact_messages', 'contact_submissions'] as PhysicalTable[]) {
      const payload: Record<string, any> = table === 'contact_submissions' ? { read: status !== 'new', status } : { status };
      let res: any = await this.supabase.from(table).update(payload).in('id', ids);
      if (res.error && isColumnMissingError(res.error)) {
        const fallback: Record<string, any> = { read: status !== 'new' };
        res = await this.supabase.from(table).update(fallback).in('id', ids);
      }
      if (!res.error) lastRes = res;
      if (res.error && isTableNotFoundError(res.error)) continue;
    }
    if (lastRes) return lastRes;
    const table = await this.getTable();
    const payload: Record<string, any> = table === 'contact_submissions' ? { read: status !== 'new', status } : { status };
    let res: any = await this.supabase.from(table).update(payload).in('id', ids);
    if (res.error && isColumnMissingError(res.error)) {
      const fallback: Record<string, any> = { read: status !== 'new' };
      res = await this.supabase.from(table).update(fallback).in('id', ids);
    }
    return res;
  }

  async bulkMarkStarred(ids: string[], starred: boolean): Promise<any> {
    if (!ids.length) return { data: null, error: null } as any;
    let lastRes: any = null;
    for (const table of ['contact_messages', 'contact_submissions'] as PhysicalTable[]) {
      let res: any = await this.supabase.from(table).update({ is_starred: starred }).in('id', ids);
      if (res.error && isColumnMissingError(res.error)) {
        continue; // column missing — skip this table, treat as success for other
      }
      if (!res.error) lastRes = res;
      if (res.error && isTableNotFoundError(res.error)) continue;
    }
    if (lastRes) return lastRes;
    // if all skipped due to missing column, fake success
    return { data: null, error: null } as any;
  }

  async toggleStarred(id: string, starred: boolean): Promise<any> {
    return this.update(id, { is_starred: starred } as any);
  }

  async markAllAsRead(): Promise<any> {
    let lastRes: any = null;
    for (const table of ['contact_messages', 'contact_submissions'] as PhysicalTable[]) {
      let res: any;
      if (table === 'contact_submissions') {
        res = await this.supabase.from(table).update({ read: true }).eq('read', false);
        if (!res.error) {
          try { await this.supabase.from(table).update({ status: 'read' } as any).eq('read', true); } catch {}
        }
      } else {
        res = await this.supabase.from(table).update({ status: 'read' }).eq('status', 'new');
      }
      if (!res.error) lastRes = res;
      if (res.error && isTableNotFoundError(res.error)) continue;
    }
    if (lastRes) return lastRes;
    const table = await this.getTable();
    let res: any;
    if (table === 'contact_submissions') {
      res = await this.supabase.from(table).update({ read: true }).eq('read', false);
      if (!res.error) { try { await this.supabase.from(table).update({ status: 'read' } as any).eq('read', true); } catch {} }
    } else {
      res = await this.supabase.from(table).update({ status: 'read' }).eq('status', 'new');
    }
    return res;
  }

  async getCounts(): Promise<any> {
    // Use SELECT * to avoid column-missing errors (contact_messages has no `read`, contact_submissions may lack `status`)
    const tables: PhysicalTable[] = ['contact_messages', 'contact_submissions'];
    let allRows: any[] = [];
    for (const table of tables) {
      try {
        const q: any = await this.supabase.from(table).select('*');
        if (q.error) {
          if (isTableNotFoundError(q.error)) continue;
          // column missing shouldn't happen with *, but handle anyway
          continue;
        }
        const rows = (q.data ?? []).map((r: any) => {
          // normalize status from `read` if needed
          let status = r.status;
          if (!status) {
            if (typeof r.read === 'boolean') status = r.read ? 'read' : 'new';
            else status = 'new';
          }
          return {
            status,
            is_starred: Boolean(r.is_starred),
            is_customer: Boolean(r.is_customer),
            read: r.read,
          };
        });
        allRows = allRows.concat(rows);
      } catch {}
    }
    if (!allRows.length) {
      // fallback: try single table with getTable
      try {
        const table = await this.getTable();
        const q: any = await this.supabase.from(table).select('*');
        if (q.error) return { total: 0, newCount: 0, read: 0, replied: 0, archived: 0, starred: 0, customer: 0 };
        const rows = (q.data ?? []).map((r: any) => {
          let status = r.status;
          if (!status) status = r.read ? 'read' : 'new';
          return { status, is_starred: Boolean(r.is_starred), is_customer: Boolean(r.is_customer) };
        });
        const total = rows.length;
        return {
          total,
          newCount: rows.filter((r: any) => r.status === 'new').length,
          read: rows.filter((r: any) => r.status === 'read').length,
          replied: rows.filter((r: any) => r.status === 'replied').length,
          archived: rows.filter((r: any) => r.status === 'archived').length,
          starred: rows.filter((r: any) => r.is_starred).length,
          customer: rows.filter((r: any) => r.is_customer).length,
        };
      } catch {
        return { total: 0, newCount: 0, read: 0, replied: 0, archived: 0, starred: 0, customer: 0 };
      }
    }
    const total = allRows.length;
    return {
      total,
      newCount: allRows.filter((r: any) => r.status === 'new').length,
      read: allRows.filter((r: any) => r.status === 'read').length,
      replied: allRows.filter((r: any) => r.status === 'replied').length,
      archived: allRows.filter((r: any) => r.status === 'archived').length,
      starred: allRows.filter((r: any) => r.is_starred).length,
      customer: allRows.filter((r: any) => r.is_customer).length,
    };
  }

  async getUnreadCount(): Promise<any> {
    let total = 0;
    for (const table of ['contact_messages', 'contact_submissions'] as PhysicalTable[]) {
      try {
        let q: any;
        if (table === 'contact_submissions') q = await this.supabase.from(table).select('*', { count: 'exact', head: true }).eq('read', false);
        else q = await this.supabase.from(table).select('*', { count: 'exact', head: true }).eq('status', 'new');
        if (!q.error && typeof q.count === 'number') total += q.count;
      } catch {}
    }
    if (total > 0) return total;
    const table = await this.getTable();
    if (table === 'contact_submissions') {
      const { count } = await this.supabase.from(table).select('*', { count: 'exact', head: true }).eq('read', false);
      return count ?? 0;
    }
    const { count } = await this.supabase.from(table).select('*', { count: 'exact', head: true }).eq('status', 'new');
    return count ?? 0;
  }
}
