import { Unit } from '../../models/unit.model';
import { IBaseService } from './base.service.interface';

export interface IUnitService extends IBaseService<Unit>{
  findByName(name: string): Promise<Unit[]>;
  findBySymbol(symbol: string): Promise<Unit[]>;
} 