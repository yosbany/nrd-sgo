import { IBaseService } from './interfaces/base.service.interface';
import { IBaseRepository } from '../repositories/interfaces/base.repository.interface';
import { BaseEntity } from '../models/base.entity';
import { database } from '@/config/firebase';
import { BaseService } from '../interfaces/base-service.interface';
import { SequenceServiceImpl } from './sequence.service.impl';

// Crear una instancia singleton de SequenceServiceImpl
const sequenceService = new SequenceServiceImpl();

export abstract class BaseServiceImpl<T extends BaseEntity, R extends IBaseRepository<T> = IBaseRepository<T>> implements IBaseService<T>, BaseService<T> {
  protected repository: R;
  protected modelName: string;

  constructor(RepositoryClass: new (db: typeof database) => R, modelName: string) {
    this.repository = new RepositoryClass(database);
    this.modelName = modelName;
  }

  async findAll(): Promise<T[]> {
    return this.repository.findAll();
  }

  async findById(id: string): Promise<T | null> {
    return this.repository.findById(id);
  }

  async create(entity: Omit<T, 'id' | 'nro' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const now = new Date();
    
    // Solo generar número de secuencia si no es el modelo de secuencias
    const nro = this.modelName === 'sequences' 
      ? crypto.randomUUID() 
      : await sequenceService.getNextNumber(this.modelName);
    
    const newEntity = {
      ...entity,
      nro,
      createdAt: now,
      updatedAt: now,
    } as Omit<T, 'id'>;

    return this.repository.create(newEntity);
  }

  async update(id: string, entity: Partial<T>): Promise<T | null> {
    await this.repository.update(id, entity);
    const updated = await this.findById(id);
    if (!updated) throw new Error('Entity not found after update');
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    await this.repository.delete(id);
    return true;
  }
} 