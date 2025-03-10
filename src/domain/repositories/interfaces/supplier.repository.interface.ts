import { Supplier } from '../../models/supplier.model';
import { IBaseRepository } from './base.repository.interface';

export interface ISupplierRepository extends IBaseRepository<Supplier> {
  findByCommercialName(commercialName: string): Promise<Supplier[]>;
  findByEmail(email: string): Promise<Supplier[]>;
  findByPhone(phone: string): Promise<Supplier[]>;
} 