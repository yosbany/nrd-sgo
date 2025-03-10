import { Unit } from '../../models/unit.model';
import { IBaseRepository } from './base.repository.interface';

export interface IUnitRepository extends IBaseRepository<Unit> {
  findByName(name: string): Promise<Unit[]>;
  findBySymbol(symbol: string): Promise<Unit[]>;
} 