/**
 * Admin Settings API
 * GET /api/admin/settings  — Get all store settings
 * PUT /api/admin/settings  — Update store settings
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { SettingsRepository } from '@/lib/db';
import { notificationService } from '@/lib/services/notificationService';
import { successResponse, internalServerError } from '@/lib/api';

export async function GET() {
  try {
    const admin = createAdminClient();
    const repo = new SettingsRepository(admin);

    const { data, error } = await repo.findAll();
    if (error) throw error;

    // Convert to key-value object
    const settings: Record<string, string> = {};
    for (const row of data ?? []) {
      settings[row.key] = row.value;
    }

    return successResponse(settings);
  } catch (err: any) {
    console.error('GET /api/admin/settings error:', err);
    return internalServerError(err.message);
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const admin = createAdminClient();
    const repo = new SettingsRepository(admin);

    const { data, error } = await repo.upsert(body);
    if (error) throw error;

    // Send notification
    try {
      await notificationService.create({
        type: 'system',
        title: 'Store settings updated',
        message: 'Store settings have been updated.',
        priority: 'low',
      });
    } catch (e) {
      console.error('Failed to send settings notification:', e);
    }

    return successResponse(data);
  } catch (err: any) {
    console.error('PUT /api/admin/settings error:', err);
    return internalServerError(err.message);
  }
}