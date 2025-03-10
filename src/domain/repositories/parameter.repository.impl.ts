import { Database } from 'firebase/database';
import { Parameter } from '../models/parameter.model';
import { IParameterRepository } from './interfaces/parameter.repository.interface';
import { BaseRepositoryImpl } from './base.repository.impl';

export class ParameterRepositoryImpl extends BaseRepositoryImpl<Parameter> implements IParameterRepository {
  constructor(db: Database) {
    super(db, 'parameters');
  }

  async findByName(name: string): Promise<Parameter[]> {
    return this.findByField('name', name);
  }

} 