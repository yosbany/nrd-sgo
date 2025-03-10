import { CustomerOrder } from '../models/customer-order.model';
import { ICustomerOrderService } from './interfaces/customer-order.service.interface';
import { ICustomerOrderRepository } from '../repositories/interfaces/customer-order.repository.interface';
import { CustomerOrderRepositoryImpl } from '../repositories/customer-order.repository.impl';
import { BaseServiceImpl } from './base.service.impl';
import { OrderStatus } from '../models/base.entity';

export class CustomerOrderServiceImpl extends BaseServiceImpl<CustomerOrder, ICustomerOrderRepository> implements ICustomerOrderService {
  constructor() {
    super(CustomerOrderRepositoryImpl);
  }

  private calculateTotals(order: Partial<CustomerOrder>): void {
    let totalProducts = 0;
    let totalItems = 0;
    
    if (!order.products) {
      order.products = [];
      totalItems += 0;
      totalProducts += 0;
    }

    if (!order.recipes) {
      order.recipes = [];
      totalItems += 0;
      totalProducts += 0;
    }

    order.totalProducts = order.products.length + order.recipes.length;
    order.totalItems = order.products.reduce((sum, item) => sum + (item.quantity || 0), 0) + order.recipes.reduce((sum, item) => sum + (item.quantity || 0), 0);;
  }

  async create(order: Partial<CustomerOrder>): Promise<CustomerOrder> {
    order.status = order.status || OrderStatus.PENDING;
    this.calculateTotals(order);
    return super.create(order as CustomerOrder);
  }

  async update(id: string, order: Partial<CustomerOrder>): Promise<CustomerOrder> {
    this.calculateTotals(order);
    return super.update(id, order);
  }

  async findByCustomerId(customerId: string): Promise<CustomerOrder[]> {
    return this.repository.findByCustomerId(customerId);
  }

  async findByStatus(status: CustomerOrderStatus): Promise<CustomerOrder[]> {
    return this.repository.findByStatus(status);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<CustomerOrder[]> {
    return this.repository.findByDateRange(startDate, endDate);
  }
} 