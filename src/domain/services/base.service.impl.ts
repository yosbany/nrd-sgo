import { IBaseService } from './interfaces/base.service.interface';
import { IBaseRepository } from '../repositories/interfaces/base.repository.interface';
import { BaseEntity } from '../models/base.entity';
import { database } from '@/config/firebase';

export abstract class BaseServiceImpl<T extends BaseEntity, R extends IBaseRepository<T> = IBaseRepository<T>> implements IBaseService<T> {
  protected repository: R;

  constructor(RepositoryClass: new (db: typeof database) => R) {
    this.repository = new RepositoryClass(database);
  }

  async findAll(): Promise<T[]> {
    return this.repository.findAll();
  }

  async findById(id: string): Promise<T | null> {
    return this.repository.findById(id);
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    return this.repository.create(data as Omit<T, 'id'>);
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    await this.repository.update(id, data);
    const updated = await this.findById(id);
    if (!updated) throw new Error('Entity not found after update');
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
} 