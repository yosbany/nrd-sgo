import { Customer } from '../interfaces/entities.interface';
import { BaseEntity } from '../interfaces/base.interface';
import { CustomerRepository } from '../repositories/customer.repository';

export class CustomerService {
  private repository: CustomerRepository;

  constructor() {
    this.repository = new CustomerRepository();
  }

  async createCustomer(customerData: Omit<Customer, keyof BaseEntity>): Promise<Customer> {
    // Validate email format
    if (customerData.email && !this.isValidEmail(customerData.email)) {
      throw new Error('Invalid email format');
    }

    // Check if email is already registered
    if (customerData.email) {
      const existingCustomer = await this.repository.getByEmail(customerData.email);
      if (existingCustomer) {
        throw new Error('Email already registered');
      }
    }

    // Check if phone is already registered
    if (customerData.phone) {
      const existingCustomer = await this.repository.getByPhone(customerData.phone);
      if (existingCustomer) {
        throw new Error('Phone number already registered');
      }
    }

    return await this.repository.create(customerData);
  }

  async updateCustomer(
    customerId: string,
    updates: Partial<Omit<Customer, keyof BaseEntity>>
  ): Promise<void> {
    const customer = await this.repository.getById(customerId);
    if (!customer) throw new Error('Customer not found');

    // Validate email format if being updated
    if (updates.email && !this.isValidEmail(updates.email)) {
      throw new Error('Invalid email format');
    }

    // Check if new email is already registered by another customer
    if (updates.email && updates.email !== customer.email) {
      const existingCustomer = await this.repository.getByEmail(updates.email);
      if (existingCustomer && existingCustomer.id !== customerId) {
        throw new Error('Email already registered');
      }
    }

    // Check if new phone is already registered by another customer
    if (updates.phone && updates.phone !== customer.phone) {
      const existingCustomer = await this.repository.getByPhone(updates.phone);
      if (existingCustomer && existingCustomer.id !== customerId) {
        throw new Error('Phone number already registered');
      }
    }

    await this.repository.update(customerId, updates);
  }

  async searchCustomers(searchTerm: string): Promise<Customer[]> {
    return await this.repository.searchByName(searchTerm);
  }

  async getByEmail(email: string): Promise<Customer | null> {
    return await this.repository.getByEmail(email);
  }

  async getByPhone(phone: string): Promise<Customer | null> {
    return await this.repository.getByPhone(phone);
  }

  async deleteCustomer(customerId: string): Promise<void> {
    const customer = await this.repository.getById(customerId);
    if (!customer) throw new Error('Customer not found');

    await this.repository.delete(customerId);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
} 