import { Supplier } from '../models/supplier.model';
import { ISupplierService } from './interfaces/supplier.service.interface';
import { ISupplierRepository } from '../repositories/interfaces/supplier.repository.interface';
import { SupplierRepositoryImpl } from '../repositories/supplier.repository.impl';
import { BaseServiceImpl } from './base.service.impl';
import { EntityStatus } from '../enums/entity-status.enum';

export class SupplierServiceImpl extends BaseServiceImpl<Supplier, ISupplierRepository> implements ISupplierService {
  constructor() {
    super(SupplierRepositoryImpl, 'suppliers');
  }

  async findByName(name: string): Promise<Supplier[]> {
    return this.repository.findByCommercialName(name);
  }

  async findByEmail(email: string): Promise<Supplier[]> {
    return this.repository.findByEmail(email);
  }

  async findByPhone(phone: string): Promise<Supplier[]> {
    return this.repository.findByPhone(phone);
  }

  async findByStatus(status: EntityStatus): Promise<Supplier[]> {
    const suppliers = await this.repository.findAll();
    return suppliers.filter(supplier => supplier.status === status);
  }
} 