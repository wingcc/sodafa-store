/**
 * Single Product API
 * GET    /api/products/[id]  — Get product by ID
 * PUT    /api/products/[id]  — Update product (admin)
 * DELETE /api/products/[id]  — Delete product (admin)
 */

import { createServerClient } from '@/lib/supabase';
import { createAdminClient } from '@/lib/supabase/admin';
import { ProductRepository } from '@/lib/db';
import { notificationService } from '@/lib/services/notificationService';
import { successResponse, errorResponse, internalServerError, notFound } from '@/lib/api';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerClient();
    const repo = new ProductRepository(supabase);

    const { data, error } = await repo.findById(id);
    if (error) return notFound('Product not found');
    return successResponse(data);
  } catch (err: any) {
    console.error('GET /api/products/[id] error:', err);
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
    const repo = new ProductRepository(admin);

    // Get current product for stock comparison
    const { data: currentProduct } = await repo.findById(id);

    const updates: Record<string, any> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.slug !== undefined) updates.slug = body.slug;
    if (body.shortDescription !== undefined) updates.short_description = body.shortDescription;
    if (body.fullDescription !== undefined) updates.full_description = body.fullDescription;
    if (body.sku !== undefined) updates.sku = body.sku;
    if (body.brand !== undefined) updates.brand = body.brand;
    if (body.regularPrice !== undefined) updates.regular_price = body.regularPrice;
    if (body.salePrice !== undefined) updates.sale_price = body.salePrice;
    if (body.costPrice !== undefined) updates.cost_price = body.costPrice;
    if (body.stock !== undefined) updates.stock = body.stock;
    if (body.lowStockThreshold !== undefined) updates.low_stock_threshold = body.lowStockThreshold;
    if (body.trackInventory !== undefined) updates.track_inventory = body.trackInventory;
    if (body.categoryId !== undefined) updates.category_id = body.categoryId;
    if (body.subcategory !== undefined) updates.subcategory = body.subcategory;
    if (body.status !== undefined) updates.status = body.status;
    if (body.images !== undefined) updates.images = body.images;
    if (body.tags !== undefined) updates.tags = body.tags;
    if (body.featured !== undefined) updates.featured = body.featured;
    if (body.ADS !== undefined) updates.ADS = body.ADS;
    if (body.ads !== undefined) updates.ADS = body.ads;
    if (body.ShowInStor !== undefined) updates.ShowInStor = body.ShowInStor;
    if (body.showInStore !== undefined) updates.ShowInStor = body.showInStore;
    if (body.seoTitle !== undefined) updates.seo_title = body.seoTitle;
    if (body.seoDescription !== undefined) updates.seo_description = body.seoDescription;
    if (body.seoSlug !== undefined) updates.seo_slug = body.seoSlug;
    if (body.seoKeywords !== undefined) updates.seo_keywords = body.seoKeywords;
    if (body.moreInfo !== undefined) updates.more_info = body.moreInfo;

    const { data, error } = await repo.update(id, updates);
    if (error) throw error;

    // Check for stock alerts
    if (data && currentProduct && body.stock !== undefined && body.trackInventory !== false) {
      const newStock = Number(body.stock);
      const oldStock = Number(currentProduct.stock);
      const threshold = Number(data.low_stock_threshold || 10);

      // Only notify if stock decreased significantly
      if (newStock < oldStock) {
        if (newStock <= 0) {
          await notificationService.notifyOutOfStock(data.id, data.name);
        } else if (newStock <= threshold) {
          await notificationService.notifyLowStock(data.id, data.name, newStock, threshold);
        }
      }
    }

    // Notify on price or status changes
    if (data) {
      try {
        if (body.regularPrice !== undefined && currentProduct && body.regularPrice !== currentProduct.regular_price) {
          await notificationService.create({
            type: 'product',
            title: 'Product price changed',
            message: `"${data.name}" price updated to ${body.regularPrice} MAD.`,
            priority: 'low',
            metadata: { productId: data.id, productName: data.name, sku: data.sku },
          });
        }
        if (body.status !== undefined && currentProduct && body.status !== currentProduct.status) {
          await notificationService.create({
            type: 'product',
            title: 'Product status changed',
            message: `"${data.name}" status changed to ${body.status}.`,
            priority: 'low',
            metadata: { productId: data.id, productName: data.name, sku: data.sku },
          });
        }
      } catch (e) {
        console.error('Failed to send product change notification:', e);
      }
    }

    return successResponse(data);
  } catch (err: any) {
    console.error('PUT /api/products/[id] error:', err);
    return internalServerError(err.message);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = createAdminClient();
    const repo = new ProductRepository(admin);

    const { error } = await repo.delete(id);
    if (error) throw error;

    // Send notification
    try {
      await notificationService.create({
        type: 'product',
        title: 'Product deleted',
        message: `A product has been deleted.`,
        priority: 'low',
        metadata: { productId: id },
      });
    } catch (e) {
      console.error('Failed to send product delete notification:', e);
    }

    return successResponse({ deleted: true });
  } catch (err: any) {
    console.error('DELETE /api/products/[id] error:', err);
    return internalServerError(err.message);
  }
}