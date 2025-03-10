import { Database } from 'firebase/database';
import { Supplier } from '../models/supplier.model';
import { ISupplierRepository } from './interfaces/supplier.repository.interface';
import { BaseRepositoryImpl } from './base.repository.impl';

export class SupplierRepositoryImpl extends BaseRepositoryImpl<Supplier> implements ISupplierRepository {
  constructor(db: Database) {
    super(db, 'suppliers');
  }

  async findByCommercialName(commercialName: string): Promise<Supplier[]> {
    return this.findByField('commercialName', commercialName);
  }

  async findByEmail(email: string): Promise<Supplier[]> {
    return this.findByField('email', email);
  }

  async findByPhone(phone: string): Promise<Supplier[]> {
    return this.findByField('phone', phone);
  }
} 