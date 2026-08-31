/**
 * Admin Contact Messages API
 * GET    /api/admin/contact-messages              — list (status/search/limit/offset)
 * PATCH  /api/admin/contact-messages?id=ID        — update status/starred (body: { status?, is_starred? })
 * PUT    /api/admin/contact-messages              — mark all new as read
 * POST   /api/admin/contact-messages              — bulk: { ids: string[], action: "delete"|"markRead"|"markReplied"|"archive"|"star"|"unstar" }
 * DELETE /api/admin/contact-messages?id=ID        — delete single
 */

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ContactMessageRepository } from '@/lib/db';
import { successResponse, internalServerError, badRequest, notFound } from '@/lib/api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const admin = createAdminClient();
    const repo = new ContactMessageRepository(admin);

    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10) || 20));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10) || 0);
    const sortBy = (searchParams.get('sortBy') as 'newest' | 'oldest') || 'newest';
    const starredOnly = searchParams.get('starred') === 'true';

    const { data, error, count } = await repo.findAll({
      status,
      search,
      starredOnly: starredOnly || undefined,
      limit,
      offset,
      sortBy,
    });

    if (error) throw error;

    const counts = await repo.getCounts().catch(() => ({ total: 0, newCount: 0, read: 0, replied: 0, archived: 0, starred: 0, customer: 0 }));

    return NextResponse.json({
      success: true,
      data: data ?? [],
      meta: {
        total: count ?? 0,
        limit,
        offset,
        counts,
      },
    });
  } catch (err: any) {
    console.error('GET /api/admin/contact-messages error:', err);
    return internalServerError(err?.message ?? 'Failed to fetch messages');
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return badRequest('Message ID is required');

    const admin = createAdminClient();
    const repo = new ContactMessageRepository(admin);

    let body: Record<string, any> = {};
    try {
      if (request.headers.get('content-type')?.includes('application/json')) {
        body = await request.json();
      }
    } catch {}
    if (searchParams.has('starred')) body.is_starred = searchParams.get('starred') === 'true';
    if (searchParams.has('status')) body.status = searchParams.get('status');

    const patch: Record<string, any> = {};
    if (body.status !== undefined) {
      const valid = ['new', 'read', 'replied', 'archived'];
      if (!valid.includes(String(body.status))) return badRequest(`Invalid status. Must be one of: ${valid.join(', ')}`);
      patch.status = String(body.status);
    }
    if (body.is_starred !== undefined) patch.is_starred = Boolean(body.is_starred);
    if (body.isStarred !== undefined) patch.is_starred = Boolean(body.isStarred);
    if (body.starred !== undefined) patch.is_starred = Boolean(body.starred);

    if (Object.keys(patch).length === 0) return badRequest('No fields to update (status, is_starred)');

    const { data, error } = await repo.update(id, patch as any);
    if (error) throw error;
    if (!data) return notFound('Message not found');
    return successResponse(data);
  } catch (err: any) {
    console.error('PATCH /api/admin/contact-messages error:', err);
    return internalServerError(err?.message ?? 'Failed to update message');
  }
}

export async function PUT() {
  try {
    const admin = createAdminClient();
    const repo = new ContactMessageRepository(admin);
    const { error } = await repo.markAllAsRead();
    if (error) throw error;
    return successResponse({ message: 'All new messages marked as read' });
  } catch (err: any) {
    console.error('PUT /api/admin/contact-messages error:', err);
    return internalServerError(err?.message ?? 'Failed to mark all as read');
  }
}

export async function POST(request: Request) {
  try {
    const admin = createAdminClient();
    const repo = new ContactMessageRepository(admin);
    const body = await request.json();
    const ids: string[] = Array.isArray(body?.ids) ? body.ids.filter((x: any) => typeof x === 'string') : [];
    const action: string = String(body?.action ?? '');
    if (!ids.length) return badRequest('ids is required');
    if (ids.length > 100) return badRequest('Too many ids (max 100)');

    if (action === 'delete') {
      const { error } = await repo.bulkDelete(ids);
      if (error) throw error;
      return successResponse({ deleted: ids.length });
    }
    if (action === 'markRead') {
      const { error } = await repo.bulkUpdateStatus(ids, 'read');
      if (error) throw error;
      return successResponse({ updated: ids.length, status: 'read' });
    }
    if (action === 'markNew') {
      const { error } = await repo.bulkUpdateStatus(ids, 'new');
      if (error) throw error;
      return successResponse({ updated: ids.length, status: 'new' });
    }
    if (action === 'markReplied') {
      const { error } = await repo.bulkUpdateStatus(ids, 'replied');
      if (error) throw error;
      return successResponse({ updated: ids.length, status: 'replied' });
    }
    if (action === 'archive') {
      const { error } = await repo.bulkUpdateStatus(ids, 'archived');
      if (error) throw error;
      return successResponse({ updated: ids.length, status: 'archived' });
    }
    if (action === 'star') {
      const { error } = await repo.bulkMarkStarred(ids, true);
      if (error) throw error;
      return successResponse({ updated: ids.length, starred: true });
    }
    if (action === 'unstar') {
      const { error } = await repo.bulkMarkStarred(ids, false);
      if (error) throw error;
      return successResponse({ updated: ids.length, starred: false });
    }
    return badRequest('Invalid action. Use delete | markRead | markNew | markReplied | archive | star | unstar');
  } catch (err: any) {
    console.error('POST /api/admin/contact-messages bulk error:', err);
    return internalServerError(err?.message ?? 'Failed to process bulk action');
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return badRequest('Message ID is required');
    const admin = createAdminClient();
    const repo = new ContactMessageRepository(admin);
    const { error } = await repo.delete(id);
    if (error) throw error;
    return successResponse({ message: 'Message deleted' });
  } catch (err: any) {
    console.error('DELETE /api/admin/contact-messages error:', err);
    return internalServerError(err?.message ?? 'Failed to delete message');
  }
}
