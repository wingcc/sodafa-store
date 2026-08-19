/**
 * Admin Notifications API
 * GET /api/admin/notifications         — List notifications
 * PUT /api/admin/notifications         — Mark all as read
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { NotificationRepository } from '@/lib/db';
import { successResponse, internalServerError } from '@/lib/api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const admin = createAdminClient();
    const repo = new NotificationRepository(admin);

    const unreadOnly = searchParams.get('unread') === 'true';
    const { data, error } = await repo.findAll(unreadOnly);

    if (error) throw error;
    return successResponse(data);
  } catch (err: any) {
    console.error('GET /api/admin/notifications error:', err);
    return internalServerError(err.message);
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
    return internalServerError(err.message);
  }
}