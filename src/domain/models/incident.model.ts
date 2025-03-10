import { BaseEntity } from './base.entity';

export enum IncidentStatus {
  PENDING = 'pending',
  RESOLVED = 'resolved'
}

export enum IncidentType {
  PRODUCTION = 'production',
  TASK = 'task',
  INVENTORY = 'inventory'
}

export interface Incident extends BaseEntity {
  type: IncidentType;
  description: string;
  reportedByWorkerId: string;
  status: IncidentStatus;
  taskId?: string;
  productId?: string;
  recipeId?: string;
} 