import { EntityStatus } from '../enums/entity-status.enum';
import { BaseEntity } from './base.entity';

export interface UnitConversion {
  toUnitId: string;
  factor: number;
  operation: 'multiply' | 'divide';
  isDefault?: boolean;
}

export interface Unit extends BaseEntity {
  name: string;
  symbol: string;
  conversions?: UnitConversion[];
  status: EntityStatus;
}
