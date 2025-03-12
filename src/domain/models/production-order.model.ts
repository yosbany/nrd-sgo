import { BaseEntity } from './base.entity';
import { OrderStatus } from './order-status.enum';

export interface ProductionRatio {
  name: string;
  value?: number;
}

export interface RecipeItems {
  recipeId: string;
  quantity: number;
}

export interface ProductionOrder extends BaseEntity {
  consecutive: number;
  orderDate: Date;
  status: OrderStatus;
  responsibleWorkerId: string;
  recipes: RecipeItems[];
  ratios: ProductionRatio[];
  totalItems: number;
  totalProducts: number;
} 