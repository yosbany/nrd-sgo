import { Database } from 'firebase/database';
import { Customer } from '../models/customer.model';
import { ICustomerRepository } from './interfaces/customer.repository.interface';
import { BaseRepositoryImpl } from './base.repository.impl';

export class CustomerRepositoryImpl extends BaseRepositoryImpl<Customer> implements ICustomerRepository {
  protected modelProperties: (keyof Customer)[] = [
    'name',
    'phone',
    'email',
    'address',
    'status'
  ];

  constructor(db: Database) {
    super(db, 'customers');
  }

  async findByName(name: string): Promise<Customer[]> {
    return this.findByField('name', name);
  }

  async findByEmail(email: string): Promise<Customer[]> {
    return this.findByField('email', email);
  }

  async findByPhone(phone: string): Promise<Customer[]> {
    return this.findByField('phone', phone);
  }

  async findByStatus(status: string): Promise<Customer[]> {
    return this.findByField('status', status);
  }
} 