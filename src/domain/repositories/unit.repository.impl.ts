import { Database } from 'firebase/database';
import { Unit } from '../models/unit.model';
import { IUnitRepository } from './interfaces/unit.repository.interface';
import { BaseRepositoryImpl } from './base.repository.impl';

export class UnitRepositoryImpl extends BaseRepositoryImpl<Unit> implements IUnitRepository {
  constructor(db: Database) {
    super(db, 'units');
  }

  async findByName(name: string): Promise<Unit[]> {
    return this.findByField('name', name);
  }

  async findBySymbol(symbol: string): Promise<Unit[]> {
    return this.findByField('symbol', symbol);
  }

} 