import { Worker } from '../interfaces/entities.interface';
import { BaseEntity } from '../interfaces/base.interface';
import { WorkerRepository } from '../repositories/worker.repository';

export class WorkerService {
  private repository: WorkerRepository;

  constructor() {
    this.repository = new WorkerRepository();
  }

  async createWorker(workerData: Omit<Worker, keyof BaseEntity>): Promise<Worker> {
    // Initialize default values
    const worker = {
      ...workerData,
      leaveBalance: workerData.leaveBalance || 0,
      leaveSalaryBalance: workerData.leaveSalaryBalance || 0,
      vacationSalaryBalance: workerData.vacationSalaryBalance || 0,
      bonusSalaryBalance: workerData.bonusSalaryBalance || 0,
      leaveHistory: workerData.leaveHistory || [],
      payments: workerData.payments || []
    };

    return await this.repository.create(worker);
  }

  async requestLeave(
    workerId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<void> {
    const worker = await this.repository.getById(workerId);
    if (!worker) throw new Error('Worker not found');

    // Calculate leave days
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    
    if (worker.leaveBalance < days) {
      throw new Error('Insufficient leave balance');
    }

    // Update leave history and balance
    const leaveHistory = [...worker.leaveHistory, { startDate, endDate }];
    const leaveBalance = worker.leaveBalance - days;

    await this.repository.update(workerId, {
      leaveHistory,
      leaveBalance
    });
  }

  async processPayment(
    workerId: string,
    amount: number,
    concept: string
  ): Promise<void> {
    const payment = {
      amount,
      concept,
      status: 'pending' as const,
      paymentDate: new Date()
    };

    await this.repository.addPayment(workerId, payment);
  }

  async getWorkersByRole(roleId: string): Promise<Worker[]> {
    return await this.repository.getByRole(roleId);
  }

  async getProductionWorkers(): Promise<Worker[]> {
    return await this.repository.getProductionWorkers();
  }

  async updateWorker(
    workerId: string, 
    updates: Partial<Omit<Worker, keyof BaseEntity>>
  ): Promise<void> {
    await this.repository.update(workerId, updates);
  }

  async deleteWorker(workerId: string): Promise<void> {
    await this.repository.delete(workerId);
  }
} 