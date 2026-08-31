/**
 * Database Library Index
 *
 * Centralized exports for all database repositories.
 */

export { ProductRepository } from './repositories/product';
export { CategoryRepository } from './repositories/category';
export { OrderRepository } from './repositories/order';
export { CustomerRepository } from './repositories/customer';
export { ReviewRepository } from './repositories/review';
export { CouponRepository } from './repositories/coupon';
export { NotificationRepository } from './repositories/notification';
export { AdminRepository } from './repositories/admin';
export { ShippingRepository } from './repositories/shipping';
export { SettingsRepository } from './repositories/settings';
export { ContactMessageRepository } from './repositories/contactMessage';

export type { ProductRepository as ProductRepo } from './repositories/product';