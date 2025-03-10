import { OrderStatus } from '@/domain/models/base.entity';
import { CustomerOrder } from '../../models/customer-order.model';
import { IBaseRepository } from './base.repository.interface';

export interface ICustomerOrderRepository extends IBaseRepository<CustomerOrder> {
  findByCustomerId(customerId: string): Promise<CustomerOrder[]>;
  findByStatus(status: OrderStatus): Promise<CustomerOrder[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<CustomerOrder[]>;
} 