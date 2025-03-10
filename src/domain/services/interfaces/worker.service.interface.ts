import { Worker } from '../../models/worker.model';
import { IBaseService } from './base.service.interface';

export interface IWorkerService extends IBaseService<Worker> {
  findByName(name: string): Promise<Worker[]>;
  findByPrimaryRoleId(roleId: string): Promise<Worker[]>;
  findByHireDateRange(startDate: Date, endDate: Date): Promise<Worker[]>;
  findBySalaryRange(minSalary: number, maxSalary: number): Promise<Worker[]>;
} 