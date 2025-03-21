import { OrderStatus } from '@/domain/enums/order-status.enum';
import { PurchaseOrder } from '../../models/purchase-order.model';
import { IBaseRepository } from './base.repository.interface';

export interface IPurchaseOrderRepository extends IBaseRepository<PurchaseOrder> {
  findBySupplierId(supplierId: string): Promise<PurchaseOrder[]>;
  findByStatus(status: OrderStatus): Promise<PurchaseOrder[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<PurchaseOrder[]>;
} 