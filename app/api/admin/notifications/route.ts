/**
 * Admin Notifications API
 * GET    /api/admin/notifications              — list (status/type/priority/search/limit/offset)
 * PATCH  /api/admin/notifications?id=ID       — update read/starred (body: { read?, starred? })
 * PUT    /api/admin/notifications              — mark all as read
 * POST   /api/admin/notifications              — bulk: { ids: string[], action: "delete"|"markRead"|"markUnread" }
 * DELETE /api/admin/notifications?id=ID       — delete single
 */

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NotificationRepository } from '@/lib/db';
import { successResponse, internalServerError, badRequest, notFound } from '@/lib/api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const admin = createAdminClient();
    const repo = new NotificationRepository(admin);

    const status = searchParams.get('status') || (searchParams.get('unread') === 'true' ? 'unread' : 'all');
    const type = searchParams.get('type') || 'all';
    const priority = searchParams.get('priority') || 'all';
    const search = searchParams.get('search') || '';
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10) || 20));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10) || 0);

    const { data, error, count } = await repo.findAll({
      status,
      type,
      priority,
      search,
      limit,
      offset,
    });

    if (error) throw error;

    const [unread, starred] = await Promise.all([
      repo.getUnreadCount(),
      repo.getStarredCount(),
    ]);

    return NextResponse.json({
      success: true,
      data: data ?? [],
      meta: {
        total: count ?? 0,
        unreadCount: unread.data ?? 0,
        starredCount: starred.data ?? 0,
        limit,
        offset,
      },
    });
  } catch (err: any) {
    console.error('GET /api/admin/notifications error:', err);
    return internalServerError(err?.message ?? 'Failed to fetch notifications');
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return badRequest('Notification ID is required');

    const admin = createAdminClient();
    const repo = new NotificationRepository(admin);

    let body: Record<string, any> = {};
    try {
      if (request.headers.get('content-type')?.includes('application/json')) {
        body = await request.json();
      }
    } catch {}
    if (searchParams.has('starred')) body.starred = searchParams.get('starred') === 'true';
    if (searchParams.has('read')) body.read = searchParams.get('read') === 'true';

    if (body.read === undefined && body.starred === undefined) body.read = true;

    const patch: Record<string, any> = {};
    if (body.read !== undefined) patch.read = Boolean(body.read);
    if (body.starred !== undefined) patch.starred = Boolean(body.starred);

    const { data, error } = await repo.update(id, patch);
    if (error) throw error;
    if (!data) return notFound('Notification not found');
    return successResponse(data);
  } catch (err: any) {
    console.error('PATCH /api/admin/notifications error:', err);
    return internalServerError(err?.message ?? 'Failed to update notification');
  }
}

export async function PUT() {
  try {
    const admin = createAdminClient();
    const repo = new NotificationRepository(admin);
    const { error } = await repo.markAllAsRead();
    if (error) throw error;
    return successResponse({ message: 'All notifications marked as read' });
  } catch (err: any) {
    console.error('PUT /api/admin/notifications error:', err);
    return internalServerError(err?.message ?? 'Failed to mark all as read');
  }
}

export async function POST(request: Request) {
  try {
    const admin = createAdminClient();
    const repo = new NotificationRepository(admin);
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
    if (action === 'markRead' || action === 'markUnread') {
      const read = action === 'markRead';
      const { error } = await repo.bulkMarkRead(ids, read);
      if (error) throw error;
      return successResponse({ updated: ids.length, read });
    }
    return badRequest('Invalid action. Use delete | markRead | markUnread');
  } catch (err: any) {
    console.error('POST /api/admin/notifications error:', err);
    return internalServerError(err?.message ?? 'Failed to process bulk action');
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return badRequest('Notification ID is required');
    const admin = createAdminClient();
    const repo = new NotificationRepository(admin);
    const { error } = await repo.delete(id);
    if (error) throw error;
    return successResponse({ message: 'Notification deleted' });
  } catch (err: any) {
    console.error('DELETE /api/admin/notifications error:', err);
    return internalServerError(err?.message ?? 'Failed to delete notification');
  }
}
