import { CustomerOrder } from '../interfaces/entities.interface';
import { BaseEntity } from '../interfaces/base.interface';
import { CustomerOrderRepository } from '../repositories/customer-order.repository';

type OrderStatus = 'pending' | 'confirmed' | 'in_progress' | 'ready' | 'delivered' | 'cancelled';
type StatusFlow = {
  [K in Exclude<OrderStatus, 'delivered' | 'cancelled'>]: OrderStatus[];
};

export class CustomerOrderService {
  private repository: CustomerOrderRepository;

  constructor() {
    this.repository = new CustomerOrderRepository();
  }

  async createOrder(orderData: Omit<CustomerOrder, keyof BaseEntity>): Promise<CustomerOrder> {
    const order = {
      ...orderData,
      items: orderData.items || {},
      status: orderData.status || 'pending',
      totalItems: Object.keys(orderData.items || {}).length,
      totalProducts: Object.values(orderData.items || {}).reduce(
        (sum, item) => sum + item.quantity,
        0
      )
    };

    return await this.repository.create(order);
  }

  async addItem(
    orderId: string,
    productId: string,
    quantity: number
  ): Promise<void> {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
    await this.repository.addItem(orderId, productId, quantity);
  }

  async removeItem(orderId: string, productId: string): Promise<void> {
    const order = await this.repository.getById(orderId);
    if (!order) throw new Error('Customer order not found');

    if (order.status !== 'pending') {
      throw new Error('Cannot modify a non-pending order');
    }

    const { [productId]: removed, ...items } = order.items;
    const totalProducts = Object.values(items).reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    await this.repository.update(orderId, {
      items,
      totalItems: Object.keys(items).length,
      totalProducts
    });
  }

  async updateStatus(orderId: string, newStatus: OrderStatus): Promise<void> {
    const validStatuses: OrderStatus[] = ['pending', 'confirmed', 'in_progress', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const order = await this.repository.getById(orderId);
    if (!order) throw new Error('Customer order not found');

    // Validate status transitions
    const currentStatus = order.status as OrderStatus;
    if (currentStatus === 'cancelled' || currentStatus === 'delivered') {
      throw new Error(`Cannot update status of ${currentStatus} order`);
    }

    // Validate status flow
    const statusFlow: StatusFlow = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['in_progress', 'cancelled'],
      in_progress: ['ready', 'cancelled'],
      ready: ['delivered', 'cancelled']
    };

    if (statusFlow[currentStatus] && !statusFlow[currentStatus].includes(newStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }

    await this.repository.updateStatus(orderId, newStatus);
  }

  async getByCustomer(customerId: string): Promise<CustomerOrder[]> {
    return await this.repository.getByCustomer(customerId);
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<CustomerOrder[]> {
    if (startDate > endDate) {
      throw new Error('Start date must be before or equal to end date');
    }
    return await this.repository.getByDateRange(startDate, endDate);
  }

  async getByStatus(status: OrderStatus): Promise<CustomerOrder[]> {
    return await this.repository.getByStatus(status);
  }

  async deleteOrder(orderId: string): Promise<void> {
    const order = await this.repository.getById(orderId);
    if (!order) throw new Error('Customer order not found');

    if (order.status !== 'pending') {
      throw new Error('Can only delete pending orders');
    }

    await this.repository.delete(orderId);
  }
} 