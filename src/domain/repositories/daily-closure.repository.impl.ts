import { Database } from 'firebase/database';
import { DailyClosure } from '../models/daily-closure.model';
import { BaseRepositoryImpl } from './base.repository.impl';
import { IDailyClosureRepository } from './interfaces/daily-closure.repository.interface';

export class DailyClosureRepository extends BaseRepositoryImpl<DailyClosure> implements IDailyClosureRepository {
  constructor(db: Database) {
    super(db, 'daily-closures');
  }

  async findByDate(date: Date): Promise<DailyClosure[]> {
    return this.findByField('date', date.toISOString());
  }
} 