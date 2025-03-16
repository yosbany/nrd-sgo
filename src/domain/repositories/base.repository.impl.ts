import { Database, ref, get, set, push, update, remove, query, orderByChild, equalTo, DatabaseReference, DataSnapshot } from 'firebase/database';
import { IBaseRepository } from '../../domain/repositories/interfaces/base.repository.interface';
import { BaseEntity } from '../models/base.entity';

export abstract class BaseRepositoryImpl<T extends BaseEntity> implements IBaseRepository<T> {
  protected db: Database;
  protected path: string;
  protected abstract modelProperties: (keyof T)[];

  constructor(db: Database, path: string) {
    this.db = db;
    this.path = path;
  }

  protected validateModelData(data: Record<string, unknown>): void {
    if (!this.modelProperties) {
      throw new Error('Model properties must be defined in the repository implementation');
    }

    // Verificar propiedades no definidas en el modelo
    const invalidProps = Object.keys(data).filter(key => 
      !this.modelProperties.includes(key as keyof T) && 
      key !== 'nro' &&
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
    
    // Convertir todas las fechas
    Object.entries(entityData).forEach(([key, value]) => {
      if (typeof value === 'string' && key.toLowerCase().includes('date')) {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            entityData[key] = date;
          }
        } catch (error) {
          console.error(`Error converting date for field ${key}:`, error);
        }
      }
    });

    // Agregar el ID
    return {
      id,
      ...entityData
    } as T;
  }

  protected getRef(path?: string): DatabaseReference {
    return ref(this.db, path ? `${this.path}/${path}` : this.path);
  }

  protected async getSnapshot(path?: string): Promise<DataSnapshot> {
    return get(this.getRef(path));
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
    if (!snapshot.exists()) return [];

    const data = snapshot.val() as Record<string, Omit<T, 'id'>>;
    return Object.entries(data).map(([id, value]) => ({
      ...value,
      id,
    }));
  }

  async findById(id: string): Promise<T | null> {
    const snapshot = await this.getSnapshot(id);
    if (!snapshot.exists()) return null;

    const data = snapshot.val() as Omit<T, 'id'>;
    return {
      ...data,
      id,
    };
  }

  async create(data: Omit<T, 'id'>): Promise<T> {
    // Eliminar el id si existe en los datos
    const { id: _, ...dataWithoutId } = data as any;
    
    // Convertir fechas a ISO strings para Firebase
    const processedData = Object.entries(dataWithoutId).reduce((acc, [key, value]) => {
      if (value instanceof Date) {
        acc[key] = value.toISOString();
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);
    
    const newRef = push(this.getRef());
    const id = newRef.key!;
    
    await set(newRef, processedData);
    
    return {
      ...dataWithoutId,
      id,
    };
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    const entityRef = ref(this.db, `${this.path}/${id}`);
    const snapshot = await get(entityRef);
    
    if (!snapshot.exists()) {
      throw new Error('Entity not found');
    }
    
    // Eliminar el id si existe en los datos de actualización
    const { id: _, ...updateData } = data as any;
    
    // Convertir fechas a ISO strings para Firebase
    const processedData = Object.entries(updateData).reduce((acc, [key, value]) => {
      if (value instanceof Date) {
        acc[key] = value.toISOString();
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);
    
    const currentData = snapshot.val() as Omit<T, 'id'>;
    await set(entityRef, {
      ...currentData,
      ...processedData,
      updatedAt: new Date().toISOString(),
    });
  }

  async delete(id: string): Promise<void> {
    await remove(ref(this.db, `${this.path}/${id}`));
  }

  async findByField(field: keyof T, value: string | number | boolean | null): Promise<T[]> {
    const snapshot = await this.getSnapshot();
    if (!snapshot.exists()) return [];

    const data = snapshot.val() as Record<string, Omit<T, 'id'>>;
    return Object.entries(data)
      .filter(([_, entity]) => entity[field as keyof Omit<T, 'id'>] === value)
      .map(([id, value]) => ({
        ...value,
        id,
      }));
  }
} 