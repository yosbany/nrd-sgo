import { Database } from 'firebase/database';
import { CustomerOrder } from '../models/customer-order.model';
import { ICustomerOrderRepository } from './interfaces/customer-order.repository.interface';
import { BaseRepositoryImpl } from './base.repository.impl';
import { OrderStatus } from '../models/base.entity';

export class CustomerOrderRepositoryImpl extends BaseRepositoryImpl<CustomerOrder> implements ICustomerOrderRepository {
  protected modelProperties: (keyof CustomerOrder)[] = [
    'orderDate',
    'status',
    'customerId',
    'products',
    'recipes',
    'totalItems',
    'totalProducts'
  ];

  constructor(db: Database) {
    super(db, 'customer-orders');
  }

  async findByCustomerId(customerId: string): Promise<CustomerOrder[]> {
    return this.findByField('customerId', customerId);
  }

  async findByStatus(status: OrderStatus): Promise<CustomerOrder[]> {
    return this.findByField('status', status.toString());
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<CustomerOrder[]> {
    const orders = await this.findAll();
    return orders.filter(order => 
      order.orderDate >= startDate && order.orderDate <= endDate
    );
  }
} 