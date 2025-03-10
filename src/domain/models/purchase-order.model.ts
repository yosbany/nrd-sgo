import { BaseEntity, OrderStatus } from './base.entity';

export interface ProductItem {
  productId: string;
  quantity: number;
}

export interface PurchaseOrder extends BaseEntity {
  orderDate: Date;
  status: OrderStatus;
  supplierId: string;
  products: ProductItem[];
  totalItems: number;
  totalProducts: number;
} 