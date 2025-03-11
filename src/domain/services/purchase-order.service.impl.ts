import { PurchaseOrder } from '../models/purchase-order.model';
import { IPurchaseOrderService } from './interfaces/purchase-order.service.interface';
import { IPurchaseOrderRepository } from '../repositories/interfaces/purchase-order.repository.interface';
import { PurchaseOrderRepositoryImpl } from '../repositories/purchase-order.repository.impl';
import { BaseServiceImpl } from './base.service.impl';
import { OrderStatus } from '../models/base.entity';

export class PurchaseOrderServiceImpl extends BaseServiceImpl<PurchaseOrder, IPurchaseOrderRepository> implements IPurchaseOrderService {
  constructor() {
    super(PurchaseOrderRepositoryImpl);
  }

  private calculateTotals(order: Partial<PurchaseOrder>): void {
    if (!order.products) {
      order.products = [];
    }

    // Total de productos diferentes
    order.totalProducts = order.products.length;
    
    // Total de items (suma de cantidades)
    order.totalItems = order.products.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      return sum + quantity;
    }, 0);
  }

  async create(order: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    order.status = order.status || OrderStatus.PENDING;
    this.calculateTotals(order);
    return super.create(order as PurchaseOrder);
  }

  async update(id: string, order: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    this.calculateTotals(order);
    return super.update(id, order);
  }

  async findBySupplierId(supplierId: string): Promise<PurchaseOrder[]> {
    return this.repository.findBySupplierId(supplierId);
  }

  async findByStatus(status: OrderStatus): Promise<PurchaseOrder[]> {
    return this.repository.findByStatus(status);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<PurchaseOrder[]> {
    return this.repository.findByDateRange(startDate, endDate);
  }
} 