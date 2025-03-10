import { Customer, CustomerStatus } from '../models/customer.model';
import { ICustomerService } from './interfaces/customer.service.interface';
import { ICustomerRepository } from '../repositories/interfaces/customer.repository.interface';
import { CustomerRepositoryImpl } from '../repositories/customer.repository.impl';
import { BaseServiceImpl } from './base.service.impl';

export class CustomerServiceImpl extends BaseServiceImpl<Customer, ICustomerRepository> implements ICustomerService {
  constructor() {
    super(CustomerRepositoryImpl);
  }

  async findByName(name: string): Promise<Customer[]> {
    return this.repository.findByName(name);
  }

  async findByEmail(email: string): Promise<Customer[]> {
    return this.repository.findByEmail(email);
  }

  async findByPhone(phone: string): Promise<Customer[]> {
    return this.repository.findByPhone(phone);
  }

  async findByStatus(status: CustomerStatus): Promise<Customer[]> {
    const customers = await this.repository.findAll();
    return customers.filter(customer => customer.status === status);
  }
} 