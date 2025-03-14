import { Firestore, collection, query, where } from 'firebase/firestore';
import { WorkOrder } from '../models/work-order.model';
import { IWorkOrderRepository } from './interfaces/work-order.repository.interface';
import { BaseRepositoryImpl } from './base.repository.impl';
import { OrderStatus } from '../models/order-status.enum';

export class WorkOrderRepositoryImpl extends BaseRepositoryImpl<WorkOrder> implements IWorkOrderRepository {
  constructor(database: Firestore) {
    super(database, 'workOrders');
  }

  async findByWorkerId(workerId: string): Promise<WorkOrder[]> {
    const q = query(collection(this.database, this.collectionName), where('workerId', '==', workerId));
    return this.getDocs(q);
  }

  async findByStatus(status: OrderStatus): Promise<WorkOrder[]> {
    const q = query(collection(this.database, this.collectionName), where('status', '==', status));
    return this.getDocs(q);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<WorkOrder[]> {
    const q = query(
      collection(this.database, this.collectionName),
      where('orderDate', '>=', startDate),
      where('orderDate', '<=', endDate)
    );
    return this.getDocs(q);
  }
} 