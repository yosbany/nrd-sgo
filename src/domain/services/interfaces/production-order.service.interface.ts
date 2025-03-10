import { ProductionOrder, ProductStatus } from '../../models/production-order.model';
import { IBaseService } from './base.service.interface';

export interface IProductionOrderService extends IBaseService<ProductionOrder>  {
  findByResponsibleWorkerId(workerId: string): Promise<ProductionOrder[]>;
  findByStatus(status: ProductStatus): Promise<ProductionOrder[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<ProductionOrder[]>;
} 