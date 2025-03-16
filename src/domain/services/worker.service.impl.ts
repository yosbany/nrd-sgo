import { Worker } from '../models/worker.model';
import { IWorkerService } from './interfaces/worker.service.interface';
import { IWorkerRepository } from '../repositories/interfaces/worker.repository.interface';
import { WorkerRepositoryImpl } from '../repositories/worker.repository.impl';
import { BaseServiceImpl } from './base.service.impl';

export class WorkerServiceImpl extends BaseServiceImpl<Worker, IWorkerRepository> implements IWorkerService {
  constructor() {
    super(WorkerRepositoryImpl, 'workers');
  }

  async findByName(name: string): Promise<Worker[]> {
    return this.repository.findByName(name);
  }

  async findByPrimaryRoleId(roleId: string): Promise<Worker[]> {
    return this.repository.findByPrimaryRole(roleId);
  }

  async findByHireDateRange(startDate: Date, endDate: Date): Promise<Worker[]> {
    const workers = await this.repository.findAll();
    return workers.filter(worker => {
      const hireDate = new Date(worker.hireDate);
      return hireDate >= startDate && hireDate <= endDate;
    });
  }

  async findBySalaryRange(minSalary: number, maxSalary: number): Promise<Worker[]> {
    const workers = await this.repository.findAll();
    return workers.filter(worker => 
      worker.monthlySalary >= minSalary && worker.monthlySalary <= maxSalary
    );
  }
} 