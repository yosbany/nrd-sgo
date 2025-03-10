import { PurchaseOrder, PurchaseOrderStatus } from '../../models/purchase-order.model';
import { IBaseService } from './base.service.interface';

export interface IPurchaseOrderService extends IBaseService<PurchaseOrder> {
  findBySupplierId(supplierId: string): Promise<PurchaseOrder[]>;
  findByStatus(status: PurchaseOrderStatus): Promise<PurchaseOrder[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<PurchaseOrder[]>;
} 