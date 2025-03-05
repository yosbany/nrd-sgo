import { Supplier } from '../interfaces/entities.interface';
import { BaseEntity } from '../interfaces/base.interface';
import { SupplierRepository } from '../repositories/supplier.repository';

export class SupplierService {
  private repository: SupplierRepository;

  constructor() {
    this.repository = new SupplierRepository();
  }

  async createSupplier(supplierData: Omit<Supplier, keyof BaseEntity>): Promise<Supplier> {
    // Validate RUT format
    if (!this.isValidRut(supplierData.rut)) {
      throw new Error('Invalid RUT format');
    }

    // Check if RUT is already registered
    const existingSupplier = await this.repository.getByRut(supplierData.rut);
    if (existingSupplier) {
      throw new Error('RUT already registered');
    }

    // Check if phone is already registered
    if (supplierData.phone) {
      const existingSupplier = await this.repository.getByPhone(supplierData.phone);
      if (existingSupplier) {
        throw new Error('Phone number already registered');
      }
    }

    return await this.repository.create(supplierData);
  }

  async updateSupplier(
    supplierId: string,
    updates: Partial<Omit<Supplier, keyof BaseEntity>>
  ): Promise<void> {
    const supplier = await this.repository.getById(supplierId);
    if (!supplier) throw new Error('Supplier not found');

    // Validate RUT format if being updated
    if (updates.rut && !this.isValidRut(updates.rut)) {
      throw new Error('Invalid RUT format');
    }

    // Check if new RUT is already registered by another supplier
    if (updates.rut && updates.rut !== supplier.rut) {
      const existingSupplier = await this.repository.getByRut(updates.rut);
      if (existingSupplier && existingSupplier.id !== supplierId) {
        throw new Error('RUT already registered');
      }
    }

    // Check if new phone is already registered by another supplier
    if (updates.phone && updates.phone !== supplier.phone) {
      const existingSupplier = await this.repository.getByPhone(updates.phone);
      if (existingSupplier && existingSupplier.id !== supplierId) {
        throw new Error('Phone number already registered');
      }
    }

    await this.repository.update(supplierId, updates);
  }

  async searchSuppliers(searchTerm: string): Promise<Supplier[]> {
    return await this.repository.searchByName(searchTerm);
  }

  async getByRut(rut: string): Promise<Supplier | null> {
    return await this.repository.getByRut(rut);
  }

  async getByPhone(phone: string): Promise<Supplier | null> {
    return await this.repository.getByPhone(phone);
  }

  async deleteSupplier(supplierId: string): Promise<void> {
    const supplier = await this.repository.getById(supplierId);
    if (!supplier) throw new Error('Supplier not found');

    await this.repository.delete(supplierId);
  }

  private isValidRut(rut: string): boolean {
    // Implementar validación específica de RUT según el formato requerido
    // Este es un ejemplo básico, ajustar según las necesidades
    const rutRegex = /^\d{9,12}$/;
    return rutRegex.test(rut);
  }
} 