import { Database } from 'firebase/database';
import { Worker } from '../models/worker.model';
import { IWorkerRepository } from './interfaces/worker.repository.interface';
import { BaseRepositoryImpl } from './base.repository.impl';

export class WorkerRepositoryImpl extends BaseRepositoryImpl<Worker> implements IWorkerRepository {
  protected modelProperties: (keyof Worker)[] = [
    'name',
    'primaryRoleId',
    'phone',
    'hireDate',
    'monthlySalary',
    'leaveBalance',
    'leaveSalaryBalance',
    'vacationSalaryBalance',
    'bonusSalaryBalance',
    'leaveHistory',
    'payments',
    'status'
  ];

  constructor(db: Database) {
    super(db, 'workers');
  }

  async findByPrimaryRole(roleId: string): Promise<Worker[]> {
    return this.findByField('primaryRoleId', roleId);
  }

  async findByName(name: string): Promise<Worker[]> {
    return this.findByField('name', name);
  }

} 