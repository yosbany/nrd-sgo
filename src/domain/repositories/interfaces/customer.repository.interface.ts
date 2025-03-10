import { Customer } from '../../models/customer.model';
import { IBaseRepository } from './base.repository.interface';

export interface ICustomerRepository extends IBaseRepository<Customer> {
  findByName(name: string): Promise<Customer[]>;
  findByEmail(email: string): Promise<Customer[]>;
  findByPhone(phone: string): Promise<Customer[]>;
} 