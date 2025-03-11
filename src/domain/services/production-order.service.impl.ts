import { ProductionOrder } from '../models/production-order.model';
import { IProductionOrderService } from './interfaces/production-order.service.interface';
import { IProductionOrderRepository } from '../repositories/interfaces/production-order.repository.interface';
import { ProductionOrderRepositoryImpl } from '../repositories/production-order.repository.impl';
import { BaseServiceImpl } from './base.service.impl';
import { OrderStatus } from '../models/base.entity';

export class ProductionOrderServiceImpl extends BaseServiceImpl<ProductionOrder, IProductionOrderRepository> implements IProductionOrderService {
  constructor() {
    super(ProductionOrderRepositoryImpl);
  }

  private calculateTotals(order: Partial<ProductionOrder>): void {
    if (!order.recipes) {
      order.recipes = [];
    }

    // Total de recetas diferentes
    order.totalProducts = order.recipes.length;
    
    // Total de items (suma de cantidades)
    order.totalItems = order.recipes.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  }

  async create(order: Partial<ProductionOrder>): Promise<ProductionOrder> {
    order.status = order.status || OrderStatus.PENDING;
    this.calculateTotals(order);
    return super.create(order as ProductionOrder);
  }

  async update(id: string, order: Partial<ProductionOrder>): Promise<ProductionOrder> {
    this.calculateTotals(order);
    return super.update(id, order);
  }

  async findByResponsibleWorkerId(workerId: string): Promise<ProductionOrder[]> {
    return this.repository.findByResponsibleWorkerId(workerId);
  }

  async findByStatus(status: OrderStatus): Promise<ProductionOrder[]> {
    return this.repository.findByStatus(status);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<ProductionOrder[]> {
    return this.repository.findByDateRange(startDate, endDate);
  }
} 