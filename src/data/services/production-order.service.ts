import { ProductionOrder } from '../interfaces/entities.interface';
import { BaseEntity } from '../interfaces/base.interface';
import { ProductionOrderRepository } from '../repositories/production-order.repository';

export class ProductionOrderService {
  private repository: ProductionOrderRepository;

  constructor() {
    this.repository = new ProductionOrderRepository();
  }

  async createOrder(orderData: Omit<ProductionOrder, keyof BaseEntity>): Promise<ProductionOrder> {
    // Initialize with default values if not provided
    const order = {
      ...orderData,
      laborEfficiency: orderData.laborEfficiency || 0,
      ratios: orderData.ratios || {
        timePerBatch: '0 min',
        wastePercentage: 0
      }
    };

    return await this.repository.create(order);
  }

  async addRecipe(
    orderId: string,
    recipeId: string,
    quantity: number
  ): Promise<void> {
    const order = await this.repository.getById(orderId);
    if (!order) throw new Error('Production order not found');

    const recipes = {
      ...order.recipes,
      [recipeId]: { quantity }
    };

    await this.repository.update(orderId, { recipes });
  }

  async updateEfficiency(
    orderId: string,
    efficiency: number
  ): Promise<void> {
    if (efficiency < 0 || efficiency > 100) {
      throw new Error('Efficiency must be between 0 and 100');
    }
    await this.repository.updateEfficiency(orderId, efficiency);
  }

  async updateRatios(
    orderId: string,
    timePerBatch: string,
    wastePercentage: number
  ): Promise<void> {
    if (wastePercentage < 0) {
      throw new Error('Waste percentage cannot be negative');
    }

    await this.repository.update(orderId, {
      ratios: { timePerBatch, wastePercentage }
    });
  }

  async getByResponsible(workerId: string): Promise<ProductionOrder[]> {
    return await this.repository.getByResponsible(workerId);
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<ProductionOrder[]> {
    if (startDate > endDate) {
      throw new Error('Start date must be before or equal to end date');
    }
    return await this.repository.getByDateRange(startDate, endDate);
  }

  async getByRecipe(recipeId: string): Promise<ProductionOrder[]> {
    return await this.repository.getByRecipe(recipeId);
  }

  async deleteOrder(orderId: string): Promise<void> {
    await this.repository.delete(orderId);
  }
} 