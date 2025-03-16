import { IncidentStatus } from '../enums/incident-status.enum';
import { IncidentType } from '../enums/type-incident.enum';
import { InventoryAffectType } from '../enums/inventory-affect-type.enum';
import { BaseEntity } from './base.entity';

export interface ProductItem {
  productId: string;
  stockAdjustment: number;
  type: InventoryAffectType;
}

export interface Incident extends BaseEntity {
  type: IncidentType;
  date: Date;
  description: string;
  status: IncidentStatus;
  taskId?: string;
  products?: ProductItem[];
  recipeId?: string;
} 