import { BaseEntity } from './base.entity';
import { OrderStatus } from '../enums/order-status.enum';

export interface MaterialItem {
  materialId: string;
  quantity: number;
}

export interface WorkOrder extends BaseEntity {
  orderDate: Date;
  status: OrderStatus;
  workerId: string;
  materials: MaterialItem[];
  totalItems: number;
  totalMaterials: number;
} 