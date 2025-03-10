import { Product, ProductStatus, ProductSector } from '../models/product.model';
import { IProductService } from './interfaces/product.service.interface';
import { ProductRepositoryImpl } from '../repositories/product.repository.impl';
import { IProductRepository } from '../repositories/interfaces/product.repository.interface';
import { BaseServiceImpl } from './base.service.impl';

export class ProductServiceImpl extends BaseServiceImpl<Product, IProductRepository> implements IProductService {
  constructor() {
    super(ProductRepositoryImpl);
  }

  async findByName(name: string): Promise<Product[]> {
    return this.repository.findByName(name);
  }

  async findBySku(sku: string): Promise<Product[]> {
    return this.repository.findBySku(sku);
  }

  async findByState(state: ProductStatus): Promise<Product[]> {
    return this.repository.findByState(state);
  }

  async findBySector(sector: ProductSector): Promise<Product[]> {
    return this.repository.findBySector(sector);
  }

  async findByPrimarySupplierId(supplierId: string): Promise<Product[]> {
    return this.repository.findByPrimarySupplierId(supplierId);
  }

  async findByMaterialUnit(unitId: string): Promise<Product[]> {
    return this.repository.findByMaterialUnit(unitId);
  }

  async findBySalesUnit(unitId: string): Promise<Product[]> {
    return this.repository.findBySalesUnit(unitId);
  }

  async findByIsForSale(isForSale: boolean): Promise<Product[]> {
    return this.repository.findByIsForSale(isForSale);
  }

  async findByIsMaterial(isMaterial: boolean): Promise<Product[]> {
    return this.repository.findByIsMaterial(isMaterial);
  }

  async findByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
    return this.repository.findByPriceRange(minPrice, maxPrice);
  }

  async findByDesiredStockBelow(stock: number): Promise<Product[]> {
    return this.repository.findByDesiredStockBelow(stock);
  }
} 