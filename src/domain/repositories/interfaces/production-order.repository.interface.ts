import { OrderStatus } from '@/domain/models/base.entity';
import { ProductionOrder } from '../../models/production-order.model';
import { IBaseRepository } from './base.repository.interface';

export interface IProductionOrderRepository extends IBaseRepository<ProductionOrder> {
  findByResponsibleWorkerId(workerId: string): Promise<ProductionOrder[]>;
  findByStatus(status: OrderStatus): Promise<ProductionOrder[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<ProductionOrder[]>;
} 