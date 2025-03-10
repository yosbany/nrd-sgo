import { Role } from '../models/role.model';
import { IRoleService } from './interfaces/role.service.interface';
import { IRoleRepository } from '../repositories/interfaces/role.repository.interface';
import { RoleRepositoryImpl } from '../repositories/role.repository.impl';
import { BaseServiceImpl } from './base.service.impl';

export class RoleServiceImpl extends BaseServiceImpl<Role, IRoleRepository> implements IRoleService {
  constructor() {
    super(RoleRepositoryImpl);
  }

  async findByName(name: string): Promise<Role[]> {
    return this.repository.findByName(name);
  }

  async findByIsProduction(isProduction: boolean): Promise<Role[]> {
    const roles = await this.repository.findAll();
    return roles.filter(role => role.isProduction === isProduction);
  }

  async findByTaskName(taskName: string): Promise<Role[]> {
    const roles = await this.repository.findAll();
    return roles.filter(role => role.tasks?.some(task => task.taskName === taskName));
  }
} 