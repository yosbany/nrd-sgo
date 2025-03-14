import { Database } from 'firebase/database';
import { ProductionOrder } from '../models/production-order.model';
import { IProductionOrderRepository } from './interfaces/production-order.repository.interface';
import { BaseRepositoryImpl } from './base.repository.impl';
import { OrderStatus } from '../enums/order-status.enum';

export class ProductionOrderRepositoryImpl extends BaseRepositoryImpl<ProductionOrder> implements IProductionOrderRepository {
  protected modelProperties: (keyof ProductionOrder)[] = [
    'consecutive',
    'orderDate',
    'status',
    'responsibleWorkerId',
    'recipes',
    'ratios',
    'totalItems',
    'totalProducts'
  ];

  constructor(db: Database) {
    super(db, 'production-orders');
  }

  async findByResponsibleWorkerId(workerId: string): Promise<ProductionOrder[]> {
    return this.findByField('responsibleWorkerId', workerId);
  }

  async findByStatus(status: OrderStatus): Promise<ProductionOrder[]> {
    return this.findByField('status', status.toString());
  }

  async findByRecipeId(recipeId: string): Promise<ProductionOrder[]> {
    const orders = await this.findAll();
    return orders.filter(order => 
      order.recipes.some(recipe => recipe.recipeId === recipeId)
    );
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<ProductionOrder[]> {
    const orders = await this.findAll();
    return orders.filter(order => 
      order.orderDate >= startDate && order.orderDate <= endDate
    );
  }
} 