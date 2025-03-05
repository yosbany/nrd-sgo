import { Product } from '../interfaces/entities.interface';
import { BaseEntity } from '../interfaces/base.interface';
import { ProductRepository } from '../repositories/product.repository';

export class ProductService {
  private repository: ProductRepository;

  constructor() {
    this.repository = new ProductRepository();
  }

  async createProduct(productData: Omit<Product, keyof BaseEntity>): Promise<Product> {
    const product = {
      ...productData,
      priceHistory: productData.priceHistory || [],
      salesChannels: productData.salesChannels || {},
      suppliers: productData.suppliers || {},
      averageStock: productData.averageStock || 0
    };

    return await this.repository.create(product);
  }

  async updateProductPrices(
    productId: string,
    updates: {
      salePrice?: number;
      salesUnitCost?: number;
      materialUnitCost?: number;
      lastPurchasePrice?: number;
    }
  ): Promise<void> {
    await this.repository.updatePrices(productId, updates);
  }

  async updateSalesChannelPrice(
    productId: string,
    channelName: string,
    newPrice: number
  ): Promise<void> {
    const product = await this.repository.getById(productId);
    if (!product) throw new Error('Product not found');

    const salesChannels = {
      ...product.salesChannels,
      [channelName]: {
        ...product.salesChannels[channelName],
        price: newPrice
      }
    };

    await this.repository.update(productId, { salesChannels });
  }

  async addSupplier(
    productId: string,
    supplierId: string,
    supplierData: Product['suppliers'][string]
  ): Promise<void> {
    const product = await this.repository.getById(productId);
    if (!product) throw new Error('Product not found');

    const suppliers = {
      ...product.suppliers,
      [supplierId]: supplierData
    };

    await this.repository.update(productId, { suppliers });
  }

  async updateStock(productId: string, newStock: number): Promise<void> {
    await this.repository.updateStock(productId, newStock);
  }

  async getForSaleProducts(): Promise<Product[]> {
    return await this.repository.getForSaleProducts();
  }

  async getMaterialProducts(): Promise<Product[]> {
    return await this.repository.getMaterialProducts();
  }

  async getBySupplier(supplierId: string): Promise<Product[]> {
    return await this.repository.getBySupplier(supplierId);
  }

  async deleteProduct(productId: string): Promise<void> {
    await this.repository.delete(productId);
  }
} 