import { Parameter } from '../../models/parameter.model';
import { IBaseService } from './base.service.interface';

export interface IParameterService extends IBaseService<Parameter> {
  findByName(name: string): Promise<Parameter[]>;
} 