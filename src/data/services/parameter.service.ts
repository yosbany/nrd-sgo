import { Parameter } from '../interfaces/entities.interface';
import { BaseEntity } from '../interfaces/base.interface';
import { ParameterRepository } from '../repositories/parameter.repository';

export class ParameterService {
  private repository: ParameterRepository;

  constructor() {
    this.repository = new ParameterRepository();
  }

  async createParameter(parameterData: Omit<Parameter, keyof BaseEntity>): Promise<Parameter> {
    // Validate value type
    if (!this.isValidValueType(parameterData.value)) {
      throw new Error('Parameter value must be a string or number');
    }

    // Validate description
    if (!parameterData.description || parameterData.description.trim().length === 0) {
      throw new Error('Parameter description is required');
    }

    return await this.repository.create(parameterData);
  }

  async updateParameter(
    parameterId: string,
    updates: Partial<Omit<Parameter, keyof BaseEntity>>
  ): Promise<void> {
    const parameter = await this.repository.getById(parameterId);
    if (!parameter) throw new Error('Parameter not found');

    // Validate value type if being updated
    if (updates.value !== undefined && !this.isValidValueType(updates.value)) {
      throw new Error('Parameter value must be a string or number');
    }

    // Validate description if being updated
    if (updates.description !== undefined && 
        (!updates.description || updates.description.trim().length === 0)) {
      throw new Error('Parameter description is required');
    }

    await this.repository.update(parameterId, updates);
  }

  async deleteParameter(parameterId: string): Promise<void> {
    const parameter = await this.repository.getById(parameterId);
    if (!parameter) throw new Error('Parameter not found');

    await this.repository.delete(parameterId);
  }

  async searchByDescription(searchTerm: string): Promise<Parameter[]> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new Error('Search term is required');
    }
    return await this.repository.getByDescription(searchTerm);
  }

  async getByValue(value: string | number): Promise<Parameter[]> {
    if (!this.isValidValueType(value)) {
      throw new Error('Invalid value type');
    }
    return await this.repository.getByValue(value);
  }

  async getAllParameters(): Promise<Parameter[]> {
    return await this.repository.getAll();
  }

  private isValidValueType(value: unknown): value is string | number {
    return typeof value === 'string' || typeof value === 'number';
  }
} 