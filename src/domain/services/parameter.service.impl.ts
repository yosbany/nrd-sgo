import { Parameter } from '../models/parameter.model';
import { IParameterService } from './interfaces/parameter.service.interface';
import { IParameterRepository } from '../repositories/interfaces/parameter.repository.interface';
import { ParameterRepositoryImpl } from '../repositories/parameter.repository.impl';
import { BaseServiceImpl } from './base.service.impl';

export class ParameterServiceImpl extends BaseServiceImpl<Parameter, IParameterRepository> implements IParameterService {
  constructor() {
    super(ParameterRepositoryImpl);
  }

  async findByName(name: string): Promise<Parameter[]> {
    return this.repository.findByName(name);
  }
} 