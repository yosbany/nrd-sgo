import { BaseEntity } from './base.entity';

export interface Sequence extends BaseEntity {
  modelName: string;
  lastNumber: number;
} 