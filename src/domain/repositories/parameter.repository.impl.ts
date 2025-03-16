import { Database } from 'firebase/database';
import { Parameter } from '../models/parameter.model';
import { IParameterRepository } from './interfaces/parameter.repository.interface';
import { BaseRepositoryImpl } from './base.repository.impl';

export class ParameterRepositoryImpl extends BaseRepositoryImpl<Parameter> implements IParameterRepository {
  protected modelProperties: (keyof Parameter)[] = [
    'name',
    'code',
    'value',
    'description',
    'status'
    ];

  constructor(db: Database) {
    super(db, 'parameters');
  }

  async findByName(name: string): Promise<Parameter[]> {
    return this.findByField('name', name);
  }

  async findByCode(code: string): Promise<Parameter[]> {
    return this.findByField('code', code);
  }
} 