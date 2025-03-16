import { Database } from 'firebase/database';
import { Product } from '../models/product.model';
import { BaseRepositoryImpl } from './base.repository.impl';
import { IProductRepository } from './interfaces/product.repository.interface';
import { EntityStatus } from '../enums/entity-status.enum';

export class ProductRepositoryImpl extends BaseRepositoryImpl<Product> implements IProductRepository {
  protected modelProperties: (keyof Product)[] = [
    'name',
    'sku',
    'imageUrl',
    'isForSale',
    'isMaterial',
    'materialName',
    'materialCode',
    'salePrice',
    'status',
    'salesUnitCost',
    'materialUnitCost',
    'purchasePrice',
    'salesUnitId',
    'materialUnitId',
    'purchaseUnitId',
    'primarySupplierId',
    'sector',
    'sectorOrder',
    'desiredStock',
    'salesChannels',
    'priceHistory',
    'margin'
  ];

  constructor(db: Database) {
    super(db, 'products');
  }

  async findByName(name: string): Promise<Product[]> {
    return this.findByField('name', name);
  }

  async findBySku(sku: string): Promise<Product[]> {
    return this.findByField('sku', sku);
  }

  async findByStatus(status: EntityStatus): Promise<Product[]> {
    return this.findByField('status', status);
  }

  async findBySector(sector: string): Promise<Product[]> {
    return this.findByField('sector', sector);
  }

  async findByPrimarySupplierId(supplierId: string): Promise<Product[]> {
    return this.findByField('primarySupplierId', supplierId);
  }

  async findByMaterialUnitId(unitId: string): Promise<Product[]> {
    return this.findByField('materialUnitId', unitId);
  }

  async findBySalesUnitId(unitId: string): Promise<Product[]> {
    return this.findByField('salesUnitId', unitId);
  }

  async findByIsForSale(isForSale: boolean): Promise<Product[]> {
    return this.findByField('isForSale', isForSale);
  }

  async findByIsMaterial(isMaterial: boolean): Promise<Product[]> {
    return this.findByField('isMaterial', isMaterial);
  }

  async findByDesiredStockBelow(stock: number): Promise<Product[]> {
    const products = await this.findAll();
    return products.filter(product => product.desiredStock && product.desiredStock < stock);
  }

  async findByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
    const products = await this.findAll();
    return products.filter(product => 
      product.salePrice >= minPrice && product.salePrice <= maxPrice
    );
  }
} 