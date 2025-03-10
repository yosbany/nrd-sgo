import { Supplier, SupplierStatus } from '../../models/supplier.model';
import { IBaseService } from './base.service.interface';

export interface ISupplierService extends IBaseService<Supplier> {
  findByName(name: string): Promise<Supplier[]>;
  findByEmail(email: string): Promise<Supplier[]>;
  findByPhone(phone: string): Promise<Supplier[]>;
  findByStatus(status: SupplierStatus): Promise<Supplier[]>;
} 