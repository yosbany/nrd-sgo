import { Product, ProductStatus, ProductSector } from '../../models/product.model';
import { IBaseService } from './base.service.interface';

export interface IProductService extends IBaseService<Product> {
  findByName(name: string): Promise<Product[]>;
  findBySku(sku: string): Promise<Product[]>;
  findByState(state: ProductStatus): Promise<Product[]>;
  findBySector(sector: ProductSector): Promise<Product[]>;
  findByPrimarySupplierId(supplierId: string): Promise<Product[]>;
  findByMaterialUnit(unitId: string): Promise<Product[]>;
  findBySalesUnit(unitId: string): Promise<Product[]>;
  findByIsForSale(isForSale: boolean): Promise<Product[]>;
  findByIsMaterial(isMaterial: boolean): Promise<Product[]>;
  findByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]>;
  findByDesiredStockBelow(stock: number): Promise<Product[]>;
} 