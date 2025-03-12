import { BaseEntity } from './base.entity';
import { OrderStatus } from './order-status.enum';

export interface ProductItem {
  productId?: string;
  recipeId?: string;
  quantity: number;
}

export interface RecipeItems {
  recipeId: string;
  quantity: number;
}

export interface CustomerOrder extends BaseEntity {
  orderDate: Date;
  status: OrderStatus;
  customerId: string;
  products: ProductItem[];
  recipes: RecipeItems[];
  totalItems: number;
  totalProducts: number;
} 