import { Database } from 'firebase/database';
import { Role } from '../models/role.model';
import { IRoleRepository } from './interfaces/role.repository.interface';
import { BaseRepositoryImpl } from './base.repository.impl';

export class RoleRepositoryImpl extends BaseRepositoryImpl<Role> implements IRoleRepository {
  constructor(db: Database) {
    super(db, 'roles');
  }

  async findByName(name: string): Promise<Role[]> {
    return this.findByField('name', name);
  }
} 