import { Parameter } from '../../models/parameter.model';
import { IBaseRepository } from './base.repository.interface';

export interface IParameterRepository extends IBaseRepository<Parameter> {
  findByName(name: string): Promise<Parameter[]>;
  findByCode(code: string): Promise<Parameter[]>;
} 