import { DailyClosure } from '../../models/daily-closure.model';
import { IBaseService } from './base.service.interface';

export interface IDailyClosureService extends IBaseService<DailyClosure> {
  findByDate(date: Date): Promise<DailyClosure[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<DailyClosure[]>;
  findByAccountCode(accountCode: string): Promise<DailyClosure[]>;
  findByTransactionCode(transactionCode: string): Promise<DailyClosure[]>;
} 