import { Database, ref, get, set, push, update, remove, query, orderByChild, equalTo } from 'firebase/database';
import { IBaseRepository } from '../../domain/repositories/interfaces/base.repository.interface';
import { BaseEntity } from '../models/base.entity';

export abstract class BaseRepositoryImpl<T extends BaseEntity> implements IBaseRepository<T> {
  protected dbRef: string;
  protected abstract modelProperties: (keyof T)[];

  constructor(protected db: Database, collectionName: string) {
    this.dbRef = collectionName;
  }

  protected validateModelData(data: Record<string, unknown>): void {
    if (!this.modelProperties) {
      throw new Error('Model properties must be defined in the repository implementation');
    }

    // Verificar propiedades no definidas en el modelo
    const invalidProps = Object.keys(data).filter(key => 
      !this.modelProperties.includes(key as keyof T) && 
      key !== 'id' && 
      key !== 'createdAt' && 
      key !== 'updatedAt'
    );

    if (invalidProps.length > 0) {
      throw new Error(`Invalid properties found: ${invalidProps.join(', ')}`);
    }

    // Verificar tipos de datos (implementación básica)
    for (const [key, value] of Object.entries(data)) {
      if (value !== null && value !== undefined) {
        if (key.toLowerCase().includes('date') && !(value instanceof Date) && !this.isValidDateString(value as string)) {
          throw new Error(`Invalid date format for property: ${key}`);
        }
      }
    }
  }

  private isValidDateString(dateStr: string): boolean {
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date.getTime());
  }

  protected mapDocumentToEntity(data: Record<string, unknown>, id: string): T {
    const entityData = { ...data } as Record<string, unknown>;
    
    // Convertir fechas si existen
    if (entityData.createdAt) {
      entityData.createdAt = new Date(entityData.createdAt as string);
    }
    if (entityData.updatedAt) {
      entityData.updatedAt = new Date(entityData.updatedAt as string);
    }

    // Agregar el ID
    return {
      id,
      ...entityData
    } as T;
  }

  protected getRef(path?: string): any {
    return ref(this.db, path ? `${this.dbRef}/${path}` : this.dbRef);
  }

  protected async getSnapshot(path?: string) {
    return await get(this.getRef(path));
  }

  protected async setData(path: string, data: any) {
    await set(this.getRef(path), data);
  }

  protected async updateData(path: string, data: any) {
    await update(this.getRef(path), data);
  }

  protected async removeData(path: string) {
    await remove(this.getRef(path));
  }

  protected async pushData(data: any) {
    const newRef = push(this.getRef());
    await set(newRef, data);
    return newRef;
  }

  protected async queryData(field: string, value: any) {
    const q = query(
      this.getRef(),
      orderByChild(field),
      equalTo(value)
    );
    return await get(q);
  }

  async findAll(): Promise<T[]> {
    const snapshot = await this.getSnapshot();
    if (!snapshot.exists()) {
      return [];
    }
    const data = snapshot.val() as Record<string, Record<string, unknown>>;
    return Object.entries(data).map(([id, value]) => this.mapDocumentToEntity(value, id));
  }

  async findById(id: string): Promise<T | null> {
    const snapshot = await this.getSnapshot(id);
    if (!snapshot.exists()) {
      return null;
    }
    return this.mapDocumentToEntity(snapshot.val() as Record<string, unknown>, id);
  }

  async create(data: Omit<T, 'id'>): Promise<T> {
    try {
      // Validar los datos antes de crear
      this.validateModelData(data as Record<string, unknown>);

      // Añadir timestamps
      const now = new Date();
      const dataWithTimestamps = {
        ...data,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };

      const newRef = await this.pushData(dataWithTimestamps);
      return this.mapDocumentToEntity(dataWithTimestamps as Record<string, unknown>, newRef.key as string);
    } catch (error) {
      throw new Error(`Error creating entity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    try {
      // Validar los datos antes de actualizar
      this.validateModelData(data as Record<string, unknown>);

      // Añadir timestamp de actualización
      const dataWithTimestamp = {
        ...data,
        updatedAt: new Date().toISOString()
      };

      await this.updateData(id, dataWithTimestamp);
    } catch (error) {
      throw new Error(`Error updating entity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.removeData(id);
    } catch (error) {
      throw new Error(`Error deleting entity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByField(field: keyof T, value: string | number | boolean | null): Promise<T[]> {
    try {
      const snapshot = await this.queryData(field as string, value);
      if (!snapshot.exists()) {
        return [];
      }
      const data = snapshot.val() as Record<string, Record<string, unknown>>;
      return Object.entries(data).map(([id, value]) => this.mapDocumentToEntity(value, id));
    } catch (error) {
      throw new Error(`Error finding by field: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 