import { Database, query, orderByChild, equalTo, get, ref } from 'firebase/database';
import { Product, ProductStatus } from '../models/product.model';
import { BaseRepositoryImpl } from './base.repository.impl';
import { IProductRepository } from './interfaces/product.repository.interface';

type FirebaseProductData = Omit<Product, 'id'> & {
  createdAt: string;
  updatedAt: string;
};

export class ProductRepositoryImpl extends BaseRepositoryImpl<Product> implements IProductRepository {
  constructor(db: Database) {
    super(db, 'products');
  }

  async findByName(name: string): Promise<Product[]> {
    return this.findByField('name', name);
  }

  async findBySku(sku: string): Promise<Product[]> {
    return this.findByField('sku', sku);
  }

  async findByState(state: Product['state']): Promise<Product[]> {
    return this.findByField('state', state);
  }

  async findBySector(sector: string): Promise<Product[]> {
    return this.findByField('sector', sector);
  }

  async findByPrimarySupplierId(supplierId: string): Promise<Product[]> {
    return this.findByField('primarySupplierId', supplierId);
  }

  async findByMaterialUnit(unitId: string): Promise<Product[]> {
    return this.findByField('materialUnit', unitId);
  }

  async findBySalesUnit(unitId: string): Promise<Product[]> {
    return this.findByField('salesUnit', unitId);
  }

  async findByIsForSale(isForSale: boolean): Promise<Product[]> {
    return this.findByField('isForSale', isForSale);
  }

  async findByIsMaterial(isMaterial: boolean): Promise<Product[]> {
    return this.findByField('isMaterial', isMaterial);
  }

  async findByStatus(status: ProductStatus): Promise<Product[]> {
    return this.findByField('state', status);
  }

  async findBySaleStatus(isForSale: boolean): Promise<Product[]> {
    return this.findByField('isForSale', isForSale);
  }

  async findByMaterialStatus(isMaterial: boolean): Promise<Product[]> {
    return this.findByField('isMaterial', isMaterial);
  }

  async findByDesiredStockBelow(stock: number): Promise<Product[]> {
    const q = query(
      ref(this.db, this.dbRef),
      orderByChild('desiredStock')
    );
    const snapshot = await get(q);
    if (!snapshot.exists()) {
      return [];
    }
    const data = snapshot.val() as Record<string, FirebaseProductData>;
    return Object.entries(data)
      .filter(([, value]) => value.desiredStock && value.desiredStock < stock)
      .map(([id, value]) => this.mapDocumentToEntity(value as unknown as Record<string, unknown>, id));
  }

  async findBySalesChannel(channelCode: string): Promise<Product[]> {
    const q = query(
      ref(this.db, this.dbRef),
      orderByChild('salesChannels'),
      equalTo(channelCode)
    );
    const snapshot = await get(q);
    if (!snapshot.exists()) {
      return [];
    }
    const data = snapshot.val() as Record<string, FirebaseProductData>;
    return Object.entries(data)
      .filter(([, value]) => 
        value.salesChannels?.some(channel => channel.code === channelCode)
      )
      .map(([id, value]) => this.mapDocumentToEntity(value as unknown as Record<string, unknown>, id));
  }

  async findByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
    const q = query(
      ref(this.db, this.dbRef),
      orderByChild('salePrice')
    );
    const snapshot = await get(q);
    if (!snapshot.exists()) {
      return [];
    }
    const data = snapshot.val() as Record<string, FirebaseProductData>;
    return Object.entries(data)
      .filter(([, value]) => 
        value.salePrice >= minPrice && value.salePrice <= maxPrice
      )
      .map(([id, value]) => this.mapDocumentToEntity(value as unknown as Record<string, unknown>, id));
  }

  async findByStockRange(minStock: number, maxStock: number): Promise<Product[]> {
    const q = query(
      ref(this.db, this.dbRef),
      orderByChild('desiredStock')
    );
    const snapshot = await get(q);
    if (!snapshot.exists()) {
      return [];
    }
    const data = snapshot.val() as Record<string, FirebaseProductData>;
    return Object.entries(data)
      .filter(([, value]) => 
        value.desiredStock && value.desiredStock >= minStock && value.desiredStock <= maxStock
      )
      .map(([id, value]) => this.mapDocumentToEntity(value as unknown as Record<string, unknown>, id));
  }
} 