/**
 * Dashboard Stats API
 * GET /api/dashboard/stats  — Get dashboard statistics
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { ProductRepository, OrderRepository, CustomerRepository } from '@/lib/db';
import { successResponse, internalServerError } from '@/lib/api';

export async function GET() {
  try {
    const admin = createAdminClient();
    const productRepo = new ProductRepository(admin);
    const orderRepo = new OrderRepository(admin);
    const customerRepo = new CustomerRepository(admin);

    // Fetch all stats in parallel
    const [productStats, orderStats, customerStats] = await Promise.all([
      productRepo.getStats(),
      orderRepo.getStats(),
      customerRepo.getStats(),
    ]);

    const stats = {
      totalRevenue: orderStats.data?.totalRevenue ?? 0,
      todayRevenue: 0,
      monthlyRevenue: 0,
      revenueChange: 0,
      totalOrders: orderStats.data?.total ?? 0,
      pendingOrders: orderStats.data?.pending ?? 0,
      completedOrders: orderStats.data?.completed ?? 0,
      cancelledOrders: orderStats.data?.cancelled ?? 0,
      ordersChange: 0,
      totalCustomers: customerStats.data?.total ?? 0,
      newCustomers: customerStats.data?.newThisMonth ?? 0,
      customersChange: 0,
      totalProducts: productStats.data?.total ?? 0,
      lowStockProducts: productStats.data?.lowStock ?? 0,
      outOfStockProducts: productStats.data?.outOfStock ?? 0,
      productsChange: 0,
    };

    return successResponse(stats);
  } catch (err: any) {
    console.error('GET /api/dashboard/stats error:', err);
    return internalServerError(err.message);
  }
}