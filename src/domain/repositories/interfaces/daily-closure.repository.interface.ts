import { DailyClosure } from '../../models/daily-closure.model';
import { IBaseRepository } from './base.repository.interface';

export interface IDailyClosureRepository extends IBaseRepository<DailyClosure> {
  findByDate(date: Date): Promise<DailyClosure[]>;
} 