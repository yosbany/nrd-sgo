import { Worker } from '../../models/worker.model';
import { IBaseRepository } from './base.repository.interface';

export interface IWorkerRepository extends IBaseRepository<Worker> {
  findByName(name: string): Promise<Worker[]>;
  findByPrimaryRole(roleId: string): Promise<Worker[]>;
} 