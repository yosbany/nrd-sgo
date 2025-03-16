import { EntityStatus } from '@/domain/enums/entity-status.enum';
import { Product, ProductSector } from '../../models/product.model';
import { IBaseRepository } from './base.repository.interface';

export interface IProductRepository extends IBaseRepository<Product> {
  findByName(name: string): Promise<Product[]>;
  findBySku(sku: string): Promise<Product[]>;
  findByStatus(status: EntityStatus): Promise<Product[]>;
  findBySector(sector: ProductSector): Promise<Product[]>;
  findByPrimarySupplierId(supplierId: string): Promise<Product[]>;
  findByMaterialUnitId(unitId: string): Promise<Product[]>;
  findBySalesUnitId(unitId: string): Promise<Product[]>;
  findByIsForSale(isForSale: boolean): Promise<Product[]>;
  findByIsMaterial(isMaterial: boolean): Promise<Product[]>;
  findByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]>;
  findByDesiredStockBelow(stock: number): Promise<Product[]>;
} 