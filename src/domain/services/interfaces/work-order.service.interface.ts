import { WorkOrder } from '../../models/work-order.model';
import { OrderStatus } from '../../enums/order-status.enum';
import { IBaseService } from './base.service.interface';

export interface IWorkOrderService extends IBaseService<WorkOrder> {
  findByWorkerId(workerId: string): Promise<WorkOrder[]>;
  findByStatus(status: OrderStatus): Promise<WorkOrder[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<WorkOrder[]>;
} 