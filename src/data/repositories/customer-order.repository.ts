import { FirebaseBaseRepository } from './base.repository';
import { CustomerOrder } from '../interfaces/entities.interface';
import { query, where, getDocs, orderBy } from 'firebase/firestore';

export class CustomerOrderRepository extends FirebaseBaseRepository<CustomerOrder> {
  protected collectionName = 'customer_orders';

  async getByCustomer(customerId: string): Promise<CustomerOrder[]> {
    const q = query(
      this.collectionRef,
      where('customerId', '==', customerId),
      orderBy('orderDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return this.convertQuerySnapshot(querySnapshot);
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<CustomerOrder[]> {
    const q = query(
      this.collectionRef,
      where('orderDate', '>=', startDate),
      where('orderDate', '<=', endDate),
      orderBy('orderDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return this.convertQuerySnapshot(querySnapshot);
  }

  async getByStatus(status: string): Promise<CustomerOrder[]> {
    const q = query(
      this.collectionRef,
      where('status', '==', status),
      orderBy('orderDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return this.convertQuerySnapshot(querySnapshot);
  }

  async updateStatus(orderId: string, status: string): Promise<void> {
    await this.update(orderId, { status });
  }

  async addItem(
    orderId: string,
    productId: string,
    quantity: number
  ): Promise<void> {
    const order = await this.getById(orderId);
    if (!order) throw new Error('Customer order not found');

    const items = {
      ...order.items,
      [productId]: { quantity }
    };

    const totalProducts = Object.values(items).reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    await this.update(orderId, {
      items,
      totalItems: Object.keys(items).length,
      totalProducts
    });
  }
} 