import { Role } from '../../models/role.model';
import { IBaseService } from './base.service.interface';

export interface IRoleService extends IBaseService<Role> {
  findByName(name: string): Promise<Role[]>;
  findByIsProduction(isProduction: boolean): Promise<Role[]>;
  findByTaskName(taskName: string): Promise<Role[]>;
} 