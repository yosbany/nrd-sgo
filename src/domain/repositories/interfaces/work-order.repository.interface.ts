import { WorkOrder } from '../../models/work-order.model';
import { OrderStatus } from '../../models/order-status.enum';
import { IBaseRepository } from './base.repository.interface';

export interface IWorkOrderRepository extends IBaseRepository<WorkOrder> {
  findByWorkerId(workerId: string): Promise<WorkOrder[]>;
  findByStatus(status: OrderStatus): Promise<WorkOrder[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<WorkOrder[]>;
} 