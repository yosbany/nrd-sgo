import { CustomerOrder, CustomerOrderStatus } from '../../models/customer-order.model';
import { IBaseService } from './base.service.interface';

export interface ICustomerOrderService extends IBaseService<CustomerOrder>{
  findByCustomerId(customerId: string): Promise<CustomerOrder[]>;
  findByStatus(status: CustomerOrderStatus): Promise<CustomerOrder[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<CustomerOrder[]>;
} 