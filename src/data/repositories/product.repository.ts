import { FirebaseBaseRepository } from './base.repository';
import { Product } from '../interfaces/entities.interface';
import { query, where, getDocs } from 'firebase/firestore';

export class ProductRepository extends FirebaseBaseRepository<Product> {
  protected collectionName = 'products';

  async getForSaleProducts(): Promise<Product[]> {
    const q = query(this.collectionRef, where('isForSale', '==', true));
    const querySnapshot = await getDocs(q);
    return this.convertQuerySnapshot(querySnapshot);
  }

  async getMaterialProducts(): Promise<Product[]> {
    const q = query(this.collectionRef, where('isMaterial', '==', true));
    const querySnapshot = await getDocs(q);
    return this.convertQuerySnapshot(querySnapshot);
  }

  async getBySupplier(supplierId: string): Promise<Product[]> {
    const q = query(this.collectionRef, where('primarySupplier', '==', supplierId));
    const querySnapshot = await getDocs(q);
    return this.convertQuerySnapshot(querySnapshot);
  }

  async updateStock(productId: string, averageStock: number): Promise<void> {
    await this.update(productId, { averageStock });
  }

  async updatePrices(productId: string, updates: {
    salePrice?: number;
    salesUnitCost?: number;
    materialUnitCost?: number;
    lastPurchasePrice?: number;
  }): Promise<void> {
    const priceHistory = [];
    const now = new Date();

    if (updates.salePrice) {
      priceHistory.push({
        date: now,
        price: updates.salePrice,
        type: 'sale' as const
      });
    }

    if (updates.lastPurchasePrice) {
      priceHistory.push({
        date: now,
        price: updates.lastPurchasePrice,
        type: 'purchase' as const
      });
    }

    const product = await this.getById(productId);
    if (!product) throw new Error('Product not found');

    await this.update(productId, {
      ...updates,
      priceHistory: [...product.priceHistory, ...priceHistory]
    });
  }
} 