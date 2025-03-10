import { Customer, CustomerStatus } from '../../models/customer.model';
import { IBaseService } from './base.service.interface';

export interface ICustomerService extends IBaseService<Customer> {
  findByName(name: string): Promise<Customer[]>;
  findByEmail(email: string): Promise<Customer[]>;
  findByPhone(phone: string): Promise<Customer[]>;
  findByStatus(status: CustomerStatus): Promise<Customer[]>;
} 