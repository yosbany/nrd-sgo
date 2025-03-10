import { ProductionOrder, ProductionOrderStatus } from '../models/production-order.model';
import { IProductionOrderService } from './interfaces/production-order.service.interface';
import { IProductionOrderRepository } from '../repositories/interfaces/production-order.repository.interface';
import { ProductionOrderRepositoryImpl } from '../repositories/production-order.repository.impl';
import { BaseServiceImpl } from './base.service.impl';
import { OrderStatus } from '../models/base.entity';

export class ProductionOrderServiceImpl extends BaseServiceImpl<ProductionOrder, IProductionOrderRepository> implements IProductionOrderService {
  constructor() {
    super(ProductionOrderRepositoryImpl);
  }

  async create(order: Partial<ProductionOrder>): Promise<ProductionOrder> {
    order.status = order.status || OrderStatus.PENDING;
    return super.create(order as ProductionOrder);
  }

  async update(id: string, order: Partial<ProductionOrder>): Promise<ProductionOrder> {
    return super.update(id, order);
  }

  async findByResponsibleWorkerId(workerId: string): Promise<ProductionOrder[]> {
    return this.repository.findByResponsibleWorkerId(workerId);
  }

  async findByStatus(status: ProductionOrderStatus): Promise<ProductionOrder[]> {
    return this.repository.findByStatus(status);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<ProductionOrder[]> {
    return this.repository.findByDateRange(startDate, endDate);
  }
} 