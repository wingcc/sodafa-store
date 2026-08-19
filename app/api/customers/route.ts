/**
 * Customers API
 * GET  /api/customers        — List customers (admin)
 * POST /api/customers        — Create customer
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { CustomerRepository } from '@/lib/db';
import { successResponse, internalServerError } from '@/lib/api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const admin = createAdminClient();
    const repo = new CustomerRepository(admin);

    const { data, error } = await repo.findAll({
      status: searchParams.get('status') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      limit: Number(searchParams.get('limit')) || undefined,
      offset: Number(searchParams.get('offset')) || undefined,
    });

    if (error) throw error;
    return successResponse(data);
  } catch (err: any) {
    console.error('GET /api/customers error:', err);
    return internalServerError(err.message);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Use admin client (bypasses RLS) — anon/RLS blocks guest customer inserts
    const admin = createAdminClient();
    const repo = new CustomerRepository(admin);

    const { data, error } = await repo.create({
      name: body.name,
      email: body.email ?? null,
      phone: body.phone ?? null,
      avatar: body.avatar ?? null,
    });

    if (error) throw error;
    return successResponse(data, 201);
  } catch (err: any) {
    console.error('POST /api/customers error:', err);
    return internalServerError(err.message);
  }
}