import { BaseEntity } from './base.entity';
import { OrderStatus } from '../enums/order-status.enum';

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
  referenceOrderNumber?: string;
} 