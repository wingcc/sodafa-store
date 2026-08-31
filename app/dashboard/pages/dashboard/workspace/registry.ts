import type { WidgetMeta } from './types';
import type { WidgetLayout } from '../../../store/useWorkspaceStore';

export const dashboardRegistry: WidgetMeta[] = [
  { id: 'kpi-grid', name: 'Primary KPIs', nameAr: 'المؤشرات الرئيسية', description: 'Revenue, orders, customers, products KPIs with trends', descriptionAr: 'الإيرادات والطلبات والعملاء والمنتجات مع الاتجاهات', category: 'KPIs', defaultVisible: true, defaultColSpan: 12, defaultRowSpan: 2, minColSpan: 12, maxColSpan: 12, minRowSpan: 1, maxRowSpan: 3 },
  { id: 'revenue-overview', name: 'Revenue Overview', nameAr: 'نظرة الإيرادات', description: 'Daily revenue & orders trend', descriptionAr: 'اتجاه الإيرادات والطلبات اليومية', category: 'Revenue', defaultVisible: true, defaultColSpan: 9, defaultRowSpan: 2, minColSpan: 6, maxColSpan: 12, minRowSpan: 1, maxRowSpan: 6 },
  { id: 'orders-performance', name: 'Orders Performance', nameAr: 'أداء الطلبات', description: 'Volume & status health', descriptionAr: 'حجم وحالة الطلبات', category: 'Orders', defaultVisible: true, defaultColSpan: 6, defaultRowSpan: 2, minColSpan: 3, maxColSpan: 9, minRowSpan: 1, maxRowSpan: 3 },
  { id: 'aov', name: 'Average Order Value', nameAr: 'متوسط قيمة الطلب', description: 'AOV + trend', descriptionAr: 'متوسط قيمة الطلب مع الاتجاه', category: 'Revenue', defaultVisible: true, defaultColSpan: 3, defaultRowSpan: 1, minColSpan: 3, maxColSpan: 6, minRowSpan: 1, maxRowSpan: 2 },
  { id: 'cod-performance', name: 'COD Performance', nameAr: 'أداء الدفع عند الاستلام', description: 'Confirmation, delivery, RTO rates', descriptionAr: 'معدلات التأكيد والتسليم والإرجاع', category: 'Operations', defaultVisible: true, defaultColSpan: 6, defaultRowSpan: 2, minColSpan: 6, maxColSpan: 12, minRowSpan: 1, maxRowSpan: 6 },
  { id: 'inventory-health', name: 'Inventory Health', nameAr: 'صحة المخزون', description: 'Stock value & fast/slow movers', descriptionAr: 'قيمة المخزون والمنتجات السريعة/البطيئة', category: 'Inventory', defaultVisible: true, defaultColSpan: 6, defaultRowSpan: 2, minColSpan: 3, maxColSpan: 9, minRowSpan: 1, maxRowSpan: 3 },
  { id: 'sales-by-category', name: 'Sales by Category', nameAr: 'المبيعات حسب الفئة', description: 'Revenue distribution pie', descriptionAr: 'توزيع الإيرادات على الفئات', category: 'Sales', defaultVisible: true, defaultColSpan: 6, defaultRowSpan: 2, minColSpan: 3, maxColSpan: 9, minRowSpan: 1, maxRowSpan: 3 },
  { id: 'customer-snapshot', name: 'Customer Snapshot', nameAr: 'نظرة العملاء', description: 'New vs returning + repeat rate', descriptionAr: 'جدد مقابل عائدين ومعدل التكرار', category: 'Customers', defaultVisible: true, defaultColSpan: 3, defaultRowSpan: 2, minColSpan: 3, maxColSpan: 6, minRowSpan: 1, maxRowSpan: 2 },
  { id: 'recent-orders', name: 'Recent Orders', nameAr: 'الطلبات الأخيرة', description: 'Latest 5 orders', descriptionAr: 'آخر 5 طلبات', category: 'Orders', defaultVisible: true, defaultColSpan: 9, defaultRowSpan: 3, minColSpan: 6, maxColSpan: 12, minRowSpan: 1, maxRowSpan: 6 },
  { id: 'top-products', name: 'Top Products', nameAr: 'أفضل المنتجات', description: 'Best sellers by units', descriptionAr: 'الأكثر مبيعاً حسب الوحدات', category: 'Products', defaultVisible: true, defaultColSpan: 6, defaultRowSpan: 3, minColSpan: 3, maxColSpan: 9, minRowSpan: 1, maxRowSpan: 6 },
  { id: 'low-stock', name: 'Low Stock Alerts', nameAr: 'تنبيهات المخزون', description: 'Low & out of stock', descriptionAr: 'منخفض ونافد', category: 'Inventory', defaultVisible: true, defaultColSpan: 6, defaultRowSpan: 2, minColSpan: 3, maxColSpan: 9, minRowSpan: 1, maxRowSpan: 3 },
  { id: 'pending-actions', name: 'Pending Actions', nameAr: 'إجراءات معلقة', description: 'Orders needing action', descriptionAr: 'طلبات تحتاج إجراء', category: 'Orders', defaultVisible: true, defaultColSpan: 6, defaultRowSpan: 2, minColSpan: 3, maxColSpan: 9, minRowSpan: 1, maxRowSpan: 3 },
  { id: 'quick-actions', name: 'Quick Actions', nameAr: 'إجراءات سريعة', description: 'Shortcuts to frequent tasks', descriptionAr: 'اختصارات للمهام المتكررة', category: 'Actions', defaultVisible: true, defaultColSpan: 4, defaultRowSpan: 1, minColSpan: 3, maxColSpan: 12, minRowSpan: 1, maxRowSpan: 6 },
  { id: 'orders-timeline', name: 'Orders Delivery Timeline', nameAr: 'جدول تسليم الطلبات', description: 'Gantt-style timeline for order delivery windows & call alerts', descriptionAr: 'جدول تتبع مواعيد وصول الطلبات وتنبيهات الاتصال بالزبناء', category: 'Delivery', defaultVisible: true, defaultColSpan: 12, defaultRowSpan: 2, minColSpan: 6, maxColSpan: 12, minRowSpan: 2, maxRowSpan: 6 },
];

export const analyticsRegistry: WidgetMeta[] = [
  { id: 'analytics-overview', name: 'Analytics Overview', nameAr: 'نظرة التحليلات', description: 'Visitors, sessions, engagement', descriptionAr: 'الزوار والجلسات والتفاعل', category: 'Overview', defaultVisible: true, defaultColSpan: 12, defaultRowSpan: 2, minColSpan: 12, maxColSpan: 12, minRowSpan: 1, maxRowSpan: 3 },
  { id: 'visitor-trends', name: 'Visitor Trends', nameAr: 'اتجاهات الزوار', description: 'Visitors/sessions/views over time', descriptionAr: 'الزوار والجلسات عبر الزمن', category: 'Visitors', defaultVisible: true, defaultColSpan: 9, defaultRowSpan: 3, minColSpan: 6, maxColSpan: 12, minRowSpan: 2, maxRowSpan: 6 },
  { id: 'conversion-funnel', name: 'Conversion Funnel', nameAr: 'مسار التحويل', description: 'Visitors → Delivered', descriptionAr: 'من الزوار حتى التسليم', category: 'Conversion', defaultVisible: true, defaultColSpan: 6, defaultRowSpan: 3, minColSpan: 6, maxColSpan: 9, minRowSpan: 2, maxRowSpan: 6 },
  { id: 'cart-abandonment', name: 'Cart Abandonment', nameAr: 'التخلي عن السلة', description: 'Cart vs checkout abandonment', descriptionAr: 'التخلي عن السلة والدفع', category: 'Conversion', defaultVisible: true, defaultColSpan: 6, defaultRowSpan: 2, minColSpan: 3, maxColSpan: 9, minRowSpan: 1, maxRowSpan: 3 },
  { id: 'traffic-performance', name: 'Traffic Performance', nameAr: 'أداء المصادر', description: 'Sessions by source', descriptionAr: 'الجلسات حسب المصدر', category: 'Acquisition', defaultVisible: true, defaultColSpan: 8, defaultRowSpan: 3, minColSpan: 6, maxColSpan: 12, minRowSpan: 2, maxRowSpan: 6 },
  { id: 'device-analytics', name: 'Device Analytics', nameAr: 'تحليل الأجهزة', description: 'Device & browser breakdown', descriptionAr: 'توزيع الأجهزة والمتصفحات', category: 'Technical', defaultVisible: true, defaultColSpan: 4, defaultRowSpan: 2, minColSpan: 3, maxColSpan: 6, minRowSpan: 1, maxRowSpan: 3 },
  { id: 'user-behavior', name: 'User Behavior', nameAr: 'سلوك المستخدم', description: 'Entry/exit & most viewed', descriptionAr: 'الدخول والخروج والأكثر مشاهدة', category: 'Behavior', defaultVisible: true, defaultColSpan: 6, defaultRowSpan: 2, minColSpan: 6, maxColSpan: 12, minRowSpan: 1, maxRowSpan: 3 },
  { id: 'product-analytics', name: 'Product Analytics', nameAr: 'تحليل المنتجات', description: 'Views, ATC, orders per product', descriptionAr: 'المشاهدات والسلة والطلبات لكل منتج', category: 'Product', defaultVisible: true, defaultColSpan: 12, defaultRowSpan: 4, minColSpan: 9, maxColSpan: 12, minRowSpan: 2, maxRowSpan: 6 },
  { id: 'customer-analytics', name: 'Customer Analytics', nameAr: 'تحليل العملاء', description: 'New vs returning + retention', descriptionAr: 'جدد مقابل عائدين + الاحتفاظ', category: 'Customers', defaultVisible: true, defaultColSpan: 6, defaultRowSpan: 2, minColSpan: 6, maxColSpan: 12, minRowSpan: 1, maxRowSpan: 3 },
  { id: 'geographic-analytics', name: 'Geographic Analytics', nameAr: 'التحليل الجغرافي', description: 'Country & city performance', descriptionAr: 'أداء الدول والمدن', category: 'Geography', defaultVisible: true, defaultColSpan: 6, defaultRowSpan: 3, minColSpan: 6, maxColSpan: 12, minRowSpan: 2, maxRowSpan: 6 },
  { id: 'top-pages', name: 'Top Pages', nameAr: 'أهم الصفحات', description: 'Most visited pages with share', descriptionAr: 'الصفحات الأكثر زيارة', category: 'Content', defaultVisible: true, defaultColSpan: 6, defaultRowSpan: 3, minColSpan: 6, maxColSpan: 12, minRowSpan: 2, maxRowSpan: 6 },
  { id: 'session-quality', name: 'Session Quality', nameAr: 'جودة الجلسة', description: 'Bounce, duration, pages/session', descriptionAr: 'الارتداد والمدة والصفحات', category: 'Quality', defaultVisible: true, defaultColSpan: 6, defaultRowSpan: 2, minColSpan: 3, maxColSpan: 9, minRowSpan: 1, maxRowSpan: 3 },
  { id: 'peak-hours', name: 'Peak Hours', nameAr: 'ساعات الذروة', description: 'Heatmap by day/hour', descriptionAr: 'خريطة حرارية حسب اليوم والساعة', category: 'Time', defaultVisible: true, defaultColSpan: 9, defaultRowSpan: 3, minColSpan: 6, maxColSpan: 12, minRowSpan: 2, maxRowSpan: 6 },
  { id: 'search-behavior', name: 'Search Behavior', nameAr: 'سلوك البحث', description: 'Top searches & conversion', descriptionAr: 'أهم عمليات البحث والتحويل', category: 'Search', defaultVisible: true, defaultColSpan: 3, defaultRowSpan: 2, minColSpan: 3, maxColSpan: 6, minRowSpan: 1, maxRowSpan: 3 },
];

export function buildDefaultLayouts(registry: WidgetMeta[]): WidgetLayout[] {
  return registry.map((m, idx) => ({
    id: m.id,
    visible: m.defaultVisible,
    locked: !!m.lockedByDefault,
    colSpan: m.defaultColSpan,
    rowSpan: (m as any).defaultRowSpan ?? 2,
    order: idx,
  }));
}

export const dashboardDefaults = buildDefaultLayouts(dashboardRegistry);
export const analyticsDefaults = buildDefaultLayouts(analyticsRegistry);
