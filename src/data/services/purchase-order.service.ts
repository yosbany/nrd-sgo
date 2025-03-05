import { PurchaseOrder } from '../interfaces/entities.interface';
import { BaseEntity } from '../interfaces/base.interface';
import { PurchaseOrderRepository } from '../repositories/purchase-order.repository';

export class PurchaseOrderService {
  private repository: PurchaseOrderRepository;

  constructor() {
    this.repository = new PurchaseOrderRepository();
  }

  async createOrder(orderData: Omit<PurchaseOrder, keyof BaseEntity>): Promise<PurchaseOrder> {
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
    if (!order) throw new Error('Purchase order not found');

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

  async updateStatus(orderId: string, status: string): Promise<void> {
    const validStatuses = ['pending', 'approved', 'received', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const order = await this.repository.getById(orderId);
    if (!order) throw new Error('Purchase order not found');

    // Validate status transitions
    const currentStatus = order.status;
    if (currentStatus === 'cancelled' || currentStatus === 'received') {
      throw new Error(`Cannot update status of ${currentStatus} order`);
    }

    if (currentStatus === 'pending' && status === 'received') {
      throw new Error('Order must be approved before being received');
    }

    await this.repository.updateStatus(orderId, status);
  }

  async getBySupplier(supplierId: string): Promise<PurchaseOrder[]> {
    return await this.repository.getBySupplier(supplierId);
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<PurchaseOrder[]> {
    if (startDate > endDate) {
      throw new Error('Start date must be before or equal to end date');
    }
    return await this.repository.getByDateRange(startDate, endDate);
  }

  async getByStatus(status: string): Promise<PurchaseOrder[]> {
    return await this.repository.getByStatus(status);
  }

  async deleteOrder(orderId: string): Promise<void> {
    const order = await this.repository.getById(orderId);
    if (!order) throw new Error('Purchase order not found');

    if (order.status !== 'pending') {
      throw new Error('Can only delete pending orders');
    }

    await this.repository.delete(orderId);
  }
} 