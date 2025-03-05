import { FirebaseBaseRepository } from './base.repository';
import { Worker } from '../interfaces/entities.interface';
import { query, where, getDocs } from 'firebase/firestore';

export class WorkerRepository extends FirebaseBaseRepository<Worker> {
  protected collectionName = 'workers';

  async getByRole(roleId: string): Promise<Worker[]> {
    const q = query(this.collectionRef, where('primaryRole', '==', roleId));
    const querySnapshot = await getDocs(q);
    return this.convertQuerySnapshot(querySnapshot);
  }

  async getProductionWorkers(): Promise<Worker[]> {
    const q = query(this.collectionRef, where('isProduction', '==', true));
    const querySnapshot = await getDocs(q);
    return this.convertQuerySnapshot(querySnapshot);
  }

  async updateLeaveBalance(workerId: string, newBalance: number): Promise<void> {
    await this.update(workerId, { leaveBalance: newBalance });
  }

  async addPayment(workerId: string, payment: Worker['payments'][0]): Promise<void> {
    const worker = await this.getById(workerId);
    if (!worker) throw new Error('Worker not found');

    const payments = [...worker.payments, payment];
    await this.update(workerId, { payments });
  }
} 