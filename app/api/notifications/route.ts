/**
 * Public Notifications API — Global, callable from any page/script
 * POST /api/notifications — Create a new notification (public, used by store/home/dashboard)
 *
 * This complements the admin CRUD at /api/admin/notifications.
 * Uses service_role internally so it works from storefront, home, or any client.
 * Preferences are still respected via notificationService.createIfEnabled.
 */

import { NextResponse } from 'next/server';
import { notificationService, type NotificationType, type NotificationPriority } from '@/lib/services/notificationService';
import { successResponse, badRequest, internalServerError } from '@/lib/api';

const VALID_TYPES: NotificationType[] = [
  'order','customer','stock','review','payment','system',
  'product','shipping','promotion','social','inventory','security',
  'account','message','achievement','reminder','subscription','support','analytics','team','event','custom',
];
const VALID_PRIORITIES: NotificationPriority[] = ['low','medium','high','urgent'];

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return badRequest('Invalid JSON body. Expected { type, title, message }');
    }

    const { type, title, message, priority, starred, actionUrl, action_url, metadata } = body as Record<string, any>;

    // Required fields
    if (!type || typeof type !== 'string' || !VALID_TYPES.includes(type as NotificationType)) {
      return badRequest(`Invalid type. Must be one of: ${VALID_TYPES.join(', ')}`);
    }
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return badRequest('title is required (1-255 chars)');
    }
    if (title.length > 255) return badRequest('title must be ≤255 chars');
    if (message !== undefined && typeof message !== 'string') return badRequest('message must be a string');
    if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
      return badRequest(`Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}`);
    }
    if (starred !== undefined && typeof starred !== 'boolean') return badRequest('starred must be boolean');
    const url = actionUrl ?? action_url;
    if (url !== undefined && url !== null && typeof url !== 'string') return badRequest('actionUrl must be a string');

    const event = {
      type: type as NotificationType,
      title: title.trim(),
      message: (message ?? '').toString().slice(0, 2000),
      priority: (priority ?? 'medium') as NotificationPriority,
      starred: Boolean(starred),
      actionUrl: typeof url === 'string' && url.length > 0 ? url.slice(0, 500) : undefined,
      metadata: metadata && typeof metadata === 'object' ? metadata : undefined,
    };

    // Use createIfEnabled so user preferences are respected
    const result = await notificationService.createIfEnabled(event);

    if (!result.success) {
      return internalServerError(result.error ?? 'Failed to create notification');
    }

    // 'skipped' means preference disabled — still success, but not stored
    if (result.id === 'skipped') {
      return successResponse({ id: 'skipped', skipped: true, reason: 'Notification type disabled in preferences' }, 200);
    }

    return successResponse({ id: result.id, ...event }, 201);
  } catch (err: any) {
    console.error('POST /api/notifications error:', err);
    return internalServerError(err?.message ?? 'Failed to create notification');
  }
}

// Optional: GET is admin-only; redirect public GET to admin route for convenience
export async function GET() {
  return NextResponse.json(
    { success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET /api/admin/notifications to list notifications. POST /api/notifications to create.' } },
    { status: 405 }
  );
}
