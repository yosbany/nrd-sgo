import { EntityStatus } from '@/domain/enums/entity-status.enum';
import { Product } from '../../models/product.model';
import { IBaseService } from './base.service.interface';
import { Sector } from '@/domain/enums/sector.enum';

export interface IProductService extends IBaseService<Product> {
  findByName(name: string): Promise<Product[]>;
  findBySku(sku: string): Promise<Product[]>;
  findByStatus(state: EntityStatus): Promise<Product[]>;
  findBySector(sector: Sector): Promise<Product[]>;
  findByPrimarySupplierId(supplierId: string): Promise<Product[]>;
  findByMaterialUnitId(unitId: string): Promise<Product[]>;
  findBySalesUnitId(unitId: string): Promise<Product[]>;
  findByIsForSale(isForSale: boolean): Promise<Product[]>;
  findByIsMaterial(isMaterial: boolean): Promise<Product[]>;
  findByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]>;
  findByDesiredStockBelow(stock: number): Promise<Product[]>;
} 