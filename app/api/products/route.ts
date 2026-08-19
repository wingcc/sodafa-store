/**
 * Products API
 * GET  /api/products        — List products (public)
 * POST /api/products        — Create product (admin)
 */

import { createServerClient } from '@/lib/supabase';
import { createAdminClient } from '@/lib/supabase/admin';
import { ProductRepository } from '@/lib/db';
import { successResponse, errorResponse, internalServerError, badRequest } from '@/lib/api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const admin = createAdminClient();
    const repo = new ProductRepository(admin);

    const statusParam = searchParams.get('status');
    const { data, error } = await repo.findAll({
      categoryId: searchParams.get('categoryId') ?? searchParams.get('category') ?? undefined,
      status: statusParam && statusParam !== 'all' ? statusParam : undefined,
      featured: searchParams.get('featured') === 'true' ? true : undefined,
      search: searchParams.get('search') ?? undefined,
      sortBy: searchParams.get('sortBy') ?? undefined,
      limit: Number(searchParams.get('limit')) || undefined,
      offset: Number(searchParams.get('offset')) || undefined,
      showInStore: searchParams.get('showInStore') === 'true' ? true : undefined,
      tag: searchParams.get('tag') ?? undefined,
      ads: searchParams.get('ads') === 'true' ? true : searchParams.get('ads') === 'false' ? false : undefined,
    });

    if (error) throw error;
    return successResponse(data);
  } catch (err: any) {
    console.error('GET /api/products error:', err);
    return internalServerError(err.message);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const admin = createAdminClient();
    const repo = new ProductRepository(admin);

    if (!body.name || !body.regularPrice) {
      return badRequest('Name and regularPrice are required');
    }

    const { data, error } = await repo.create({
      name: body.name,
      slug: body.slug ?? body.name.toLowerCase().replace(/\s+/g, '-'),
      short_description: body.shortDescription ?? '',
      full_description: body.fullDescription ?? '',
      sku: body.sku ?? `SKU-${Date.now()}`,
      brand: body.brand ?? 'SODFA',
      category_id: body.categoryId ?? null,
      subcategory: body.subcategory ?? null,
      tags: body.tags ?? [],
      regular_price: body.regularPrice,
      sale_price: body.salePrice ?? null,
      cost_price: body.costPrice ?? 0,
      currency: body.currency ?? 'MAD',
      stock: body.stock ?? 0,
      low_stock_threshold: body.lowStockThreshold ?? 10,
      track_inventory: body.trackInventory ?? true,
      ADS: body.ADS ?? body.ads ?? false,
      ShowInStor: body.ShowInStor ?? body.showInStore ?? false,
      images: body.images ?? [],
      status: body.status ?? 'draft',
      featured: body.featured ?? false,
      seo_title: body.seoTitle ?? null,
      seo_description: body.seoDescription ?? null,
      seo_slug: body.seoSlug ?? null,
      seo_keywords: body.seoKeywords ?? [],
    });

    if (error) throw error;
    return successResponse(data, 201);
  } catch (err: any) {
    console.error('POST /api/products error:', err);
    return internalServerError(err.message);
  }
}