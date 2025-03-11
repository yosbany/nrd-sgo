import { Database } from 'firebase/database';
import { PurchaseOrder } from '../models/purchase-order.model';
import { IPurchaseOrderRepository } from './interfaces/purchase-order.repository.interface';
import { BaseRepositoryImpl } from './base.repository.impl';
import { OrderStatus } from '../models/base.entity';

export class PurchaseOrderRepositoryImpl extends BaseRepositoryImpl<PurchaseOrder> implements IPurchaseOrderRepository {
  protected modelProperties: (keyof PurchaseOrder)[] = [
    'orderDate',
    'status',
    'supplierId',
    'products',
    'totalItems',
    'totalProducts'
  ];

  constructor(db: Database) {
    super(db, 'purchase-orders');
  }

  async findBySupplierId(supplierId: string): Promise<PurchaseOrder[]> {
    return this.findByField('supplierId', supplierId);
  }

  async findByStatus(status: OrderStatus): Promise<PurchaseOrder[]> {
    return this.findByField('status', status.toString());
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<PurchaseOrder[]> {
    const orders = await this.findAll();
    return orders.filter(order => 
      order.orderDate >= startDate && order.orderDate <= endDate
    );
  }
} 