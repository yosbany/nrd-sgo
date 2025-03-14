import { BaseEntity } from './base.entity';
import { OrderStatus } from '../enums/order-status.enum';
import { TypeInventory } from '../enums/type-inventory.enum';

export interface ItemOrder {
  itemId: string;
  typeItem: TypeInventory;
  quantity: number;
}

export interface CustomerOrder extends BaseEntity {
  orderDate: Date;
  status: OrderStatus;
  customerId: string;
  items: ItemOrder[];
  totalProducts: number;
  totalItems: number;
  
} 