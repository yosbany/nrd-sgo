import { FirebaseBaseRepository } from './base.repository';
import { ProductionOrder } from '../interfaces/entities.interface';
import { query, where, getDocs, orderBy } from 'firebase/firestore';

export class ProductionOrderRepository extends FirebaseBaseRepository<ProductionOrder> {
  protected collectionName = 'production_orders';

  async getByResponsible(workerId: string): Promise<ProductionOrder[]> {
    const q = query(this.collectionRef, where('responsible', '==', workerId));
    const querySnapshot = await getDocs(q);
    return this.convertQuerySnapshot(querySnapshot);
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<ProductionOrder[]> {
    const q = query(
      this.collectionRef,
      where('productionDate', '>=', startDate),
      where('productionDate', '<=', endDate),
      orderBy('productionDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return this.convertQuerySnapshot(querySnapshot);
  }

  async getByRecipe(recipeId: string): Promise<ProductionOrder[]> {
    const q = query(
      this.collectionRef,
      where(`recipes.${recipeId}`, '!=', null)
    );
    const querySnapshot = await getDocs(q);
    return this.convertQuerySnapshot(querySnapshot);
  }

  async updateEfficiency(orderId: string, efficiency: number): Promise<void> {
    await this.update(orderId, { laborEfficiency: efficiency });
  }
} 