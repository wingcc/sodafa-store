/**
 * Single Customer API
 * GET    /api/customers/[id]  — Get customer with addresses
 * PUT    /api/customers/[id]  — Update customer (admin)
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { CustomerRepository } from '@/lib/db';
import { successResponse, internalServerError, notFound } from '@/lib/api';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = createAdminClient();
    const repo = new CustomerRepository(admin);

    const { data: customer, error } = await repo.findById(id);
    if (error || !customer) return notFound('Customer not found');

    const { data: addresses } = await repo.findAddresses(id);

    return successResponse({ ...customer, addresses: addresses ?? [] });
  } catch (err: any) {
    console.error('GET /api/customers/[id] error:', err);
    return internalServerError(err.message);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const admin = createAdminClient();
    const repo = new CustomerRepository(admin);

    const { data, error } = await repo.update(id, body);
    if (error) throw error;
    return successResponse(data);
  } catch (err: any) {
    console.error('PUT /api/customers/[id] error:', err);
    return internalServerError(err.message);
  }
}