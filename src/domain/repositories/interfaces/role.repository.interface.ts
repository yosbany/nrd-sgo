import { Role } from '../../models/role.model';
import { IBaseRepository } from './base.repository.interface';

export interface IRoleRepository extends IBaseRepository<Role> {
  findByName(name: string): Promise<Role[]>;
} 