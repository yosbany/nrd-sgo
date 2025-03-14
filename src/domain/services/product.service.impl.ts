import { Product, ProductStatus, ProductSector } from '../models/product.model';
import { IProductService } from './interfaces/product.service.interface';
import { ProductRepositoryImpl } from '../repositories/product.repository.impl';
import { IProductRepository } from '../repositories/interfaces/product.repository.interface';
import { BaseServiceImpl } from './base.service.impl';
import { UnitServiceImpl } from './unit.service.impl';
import { SupplierServiceImpl } from './supplier.service.impl';

export class ProductServiceImpl extends BaseServiceImpl<Product, IProductRepository> implements IProductService {
  private unitService: UnitServiceImpl;
  private supplierService: SupplierServiceImpl;

  constructor() {
    super(ProductRepositoryImpl, 'products');
    this.unitService = new UnitServiceImpl();
    this.supplierService = new SupplierServiceImpl();
  }

  private async calculateUnitCosts(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'nro'>): Promise<Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'nro'>> {
    // Only calculate if we have purchase price and purchase unit
    if (!data.purchasePrice || !data.purchaseUnitId) {
      return data;
    }

    const purchaseUnit = await this.unitService.findById(data.purchaseUnitId);
    if (!purchaseUnit) {
      return data;
    }

    const updatedData = { ...data };

    // Get supplier details if available
    if (data.primarySupplierId) {
      const supplier = await this.supplierService.findById(data.primarySupplierId);
      if (supplier) {
        updatedData.primarySupplier = {
          id: supplier.id || '',
          commercialName: supplier.commercialName,
          email: supplier.email || '',
          phone: supplier.phone || '',
          status: supplier.status
        };
      }
    }

    // Calculate sales unit cost if product is for sale
    if (data.isForSale && data.salesUnitId) {
      const conversion = purchaseUnit.conversions?.find(c => c.toUnitId === data.salesUnitId);
      if (conversion) {
        const { factor, operation } = conversion;
        updatedData.salesUnitCost = operation === 'multiply' 
          ? data.purchasePrice * factor 
          : data.purchasePrice / factor;

        // Calculate margin if sale price and unit cost exist
        if (data.salePrice && updatedData.salesUnitCost) {
          // Using the formula: sale price = unit cost / (1 - margin)
          // We solve for margin: margin = 1 - (unit cost / sale price)
          updatedData.margin = (1 - (updatedData.salesUnitCost / data.salePrice)) * 100;
        }
      }
    }

    // Calculate material unit cost if product is material
    if (data.isMaterial && data.materialUnitId) {
      const conversion = purchaseUnit.conversions?.find(c => c.toUnitId === data.materialUnitId);
      if (conversion) {
        const { factor, operation } = conversion;
        updatedData.materialUnitCost = operation === 'multiply' 
          ? data.purchasePrice * factor 
          : data.purchasePrice / factor;
      }
    }

    return updatedData;
  }

  async create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'nro'>): Promise<Product> {
    const dataWithCosts = await this.calculateUnitCosts(data);
    const result = await super.create(dataWithCosts);
    if (!result) {
      throw new Error('Failed to create product');
    }
    return result;
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const currentProduct = await this.findById(id);
    if (!currentProduct) {
      throw new Error('Product not found');
    }

    const mergedData = {
      ...currentProduct,
      ...data
    };

    const dataWithCosts = await this.calculateUnitCosts(mergedData);
    const result = await super.update(id, dataWithCosts);
    if (!result) {
      throw new Error('Failed to update product');
    }
    return result;
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

  async findById(id: string): Promise<Product | null> {
    const product = await super.findById(id);
    if (!product) {
      return null;
    }

    // Get supplier details if available
    if (product.primarySupplierId) {
      const supplier = await this.supplierService.findById(product.primarySupplierId);
      if (supplier) {
        product.primarySupplier = {
          id: supplier.id,
          commercialName: supplier.commercialName,
          email: supplier.email,
          phone: supplier.phone,
          status: supplier.status
        };
      }
    }

    return product;
  }

  async findAll(): Promise<Product[]> {
    const products = await super.findAll();
    
    // Get supplier details for all products
    const productsWithSuppliers = await Promise.all(
      products.map(async (product) => {
        if (product.primarySupplierId) {
          const supplier = await this.supplierService.findById(product.primarySupplierId);
          if (supplier) {
            return {
              ...product,
              primarySupplier: {
                id: supplier.id,
                commercialName: supplier.commercialName,
                email: supplier.email,
                phone: supplier.phone,
                status: supplier.status
              }
            };
          }
        }
        return product;
      })
    );

    return productsWithSuppliers;
  }
} 