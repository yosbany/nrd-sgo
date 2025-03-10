import { Database, ref, get, set, push, update, remove, query, orderByChild, equalTo } from 'firebase/database';
import { IBaseRepository } from '../../domain/repositories/interfaces/base.repository.interface';
import { BaseEntity } from '../models/base.entity';

export abstract class BaseRepositoryImpl<T extends BaseEntity> implements IBaseRepository<T> {
  protected dbRef: string;

  constructor(protected db: Database, collectionName: string) {
    this.dbRef = collectionName;
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
    const newRef = await this.pushData(data);
    const newData = { ...data } as Record<string, unknown>;
    return this.mapDocumentToEntity(newData, newRef.key as string);
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    await this.updateData(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.removeData(id);
  }

  async findByField(field: keyof T, value: string | number | boolean | null): Promise<T[]> {
    const snapshot = await this.queryData(field as string, value);
    if (!snapshot.exists()) {
      return [];
    }
    const data = snapshot.val() as Record<string, Record<string, unknown>>;
    return Object.entries(data).map(([id, value]) => this.mapDocumentToEntity(value, id));
  }
} 